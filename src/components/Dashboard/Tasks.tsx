
import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Trophy, Clock, Plus, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { verifyTask } from '../../services/gemini';
import { levelInfo } from '../../lib/progress';

type Template = { title: string; desc: string; diff: 'Easy' | 'Medium' | 'Challenge'; xp: number };

// The same seven problems in both languages (Uzbek speakers get English for now).
const TEMPLATES: Record<'ru' | 'en', Template[]> = {
  en: [
    { title: "Kinetics: Velocity", desc: "Calculate the velocity (v) if an object travels 150m (d) in 30s (t). Formula: v=d/t. Result in m/s.", diff: "Easy", xp: 30 },
    { title: "Algebra: Simplify", desc: "Solve for x: 3x + 15 = 45. Give the numeric value.", diff: "Easy", xp: 35 },
    { title: "Ohm's Law", desc: "A circuit has 10V (V) and 2Ω resistance (R). Calculate the current (I). Formula: I=V/R. Result in Amperes.", diff: "Medium", xp: 60 },
    { title: "Geometry: Area", desc: "Calculate the area of a circle with radius r=5m. Use π=3.14. Formula: A=πr². Result in m².", diff: "Medium", xp: 65 },
    { title: "Chemistry: Molar Mass", desc: "Calculate the molar mass of H₂O. (H=1, O=16). Give the total g/mol.", diff: "Medium", xp: 70 },
    { title: "Logic: Sequence", desc: "Find the missing number: 1, 1, 2, 3, 5, 8, ?. (Fibonacci sequence)", diff: "Medium", xp: 50 },
    { title: "Physics: Power", desc: "Calculate Power (P) if Work (W) is 500J and time (t) is 10s. Formula: P=W/t. Result in Watts.", diff: "Challenge", xp: 125 },
  ],
  ru: [
    { title: "Кинематика: скорость", desc: "Найди скорость (v), если тело проходит 150 м (d) за 30 с (t). Формула: v = d / t. Ответ в м/с.", diff: "Easy", xp: 30 },
    { title: "Алгебра: найди x", desc: "Реши уравнение: 3x + 15 = 45. Ответ — число.", diff: "Easy", xp: 35 },
    { title: "Закон Ома", desc: "В цепи напряжение 10 В (V) и сопротивление 2 Ом (R). Найди силу тока (I). Формула: I = V / R. Ответ в амперах.", diff: "Medium", xp: 60 },
    { title: "Геометрия: площадь", desc: "Найди площадь круга с радиусом r = 5 м. Возьми π = 3,14. Формула: A = πr². Ответ в м².", diff: "Medium", xp: 65 },
    { title: "Химия: молярная масса", desc: "Найди молярную массу H₂O (H = 1, O = 16). Ответ в г/моль.", diff: "Medium", xp: 70 },
    { title: "Логика: последовательность", desc: "Найди пропущенное число: 1, 1, 2, 3, 5, 8, ? (числа Фибоначчи).", diff: "Medium", xp: 50 },
    { title: "Физика: мощность", desc: "Найди мощность (P), если работа (W) равна 500 Дж, а время (t) — 10 с. Формула: P = W / t. Ответ в ваттах.", diff: "Challenge", xp: 125 },
  ],
};

export const Tasks: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<Record<string, { isCorrect: boolean; text: string }>>({});
  const [errorStatus, setErrorStatus] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));

      // NEW TACTIC: Auto-purge legacy vague tasks
      const legacyTasks = tasksData.filter(t =>
        t.description?.includes('real-world scenario') ||
        t.description?.includes('momentum works') ||
        t.description?.includes('climate change')
      );

      if (legacyTasks.length > 0) {
        legacyTasks.forEach(async (lt) => {
          try {
            await deleteDoc(doc(db, 'tasks', lt.id));
          } catch (e) {
            console.error("Auto-purge failed:", e);
          }
        });
      }

      setTasks(tasksData.filter(t => !legacyTasks.find(lt => lt.id === t.id)));
      setLoadError(false);
      setLoading(false);
    }, (error) => {
      console.error("Tasks fetch error:", error);
      setLoadError(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // A slow or offline connection used to leave an endless spinner with no explanation.
  useEffect(() => {
    if (!loading) { setSlowLoad(false); return; }
    const timer = setTimeout(() => setSlowLoad(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const clearAllTasks = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'tasks', d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Clear tasks error:", error);
    } finally {
      setIsClearing(false);
      setConfirmClear(false);
    }
  };

  const generateTask = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);

    const pool = TEMPLATES[language === 'ru' ? 'ru' : 'en'];
    // Prefer a problem the student does not already have in the list.
    const fresh = pool.filter((tpl) => !tasks.some((task) => task.title === tpl.title));
    const choices = fresh.length > 0 ? fresh : pool;
    const template = choices[Math.floor(Math.random() * choices.length)];

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        title: template.title,
        description: template.desc,
        difficulty: template.diff,
        status: 'pending',
        xpReward: template.xp,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Task generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeTask = async (task: Task) => {
    const answer = taskAnswers[task.id];
    if (!user || !profile || task.status === 'completed' || !answer?.trim()) return;

    setVerifyingTaskId(task.id);
    setErrorStatus(prev => ({ ...prev, [task.id]: null }));
    try {
      const result = await verifyTask(task, answer, profile);
      const reward = task.xpReward + (result.bonusXP || 0);

      setTaskFeedback(prev => ({
        ...prev,
        [task.id]: { isCorrect: result.isCorrect, text: result.isCorrect ? `${result.feedback} +${reward} XP` : result.feedback }
      }));

      if (result.isCorrect) {
        const newXP = (profile.xp || 0) + reward;
        await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });
        // Through the profile so the level follows the same formula as everywhere else.
        await updateProfileData({ xp: newXP, level: Math.max(levelInfo(newXP).level, profile.level) });
      }
    } catch (error: any) {
      console.error("Task completion error:", error);
      setErrorStatus(prev => ({
        ...prev,
        [task.id]: error?.message === 'PRO_LIMIT_REACHED'
          ? tr('AI token limit reached. Get more in “Bonuses & codes”.', 'Лимит ИИ-токенов исчерпан. Получи ещё в разделе «Бонусы и коды».', 'AI token limiti tugadi. «Bonus va kodlar» bo‘limidan oling.')
          : error?.message || tr('Verification failed. Try again.', 'Ошибка проверки. Попробуй ещё раз.', 'Tekshirishda xatolik. Qayta urinib ko‘ring.')
      }));
    } finally {
      setVerifyingTaskId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const difficultyLabel = (value: string) =>
    value === 'Easy' ? tr('Easy', 'Лёгкое', 'Oson') : value === 'Medium' ? tr('Medium', 'Среднее', 'O‘rta') : tr('Challenge', 'Сложное', 'Qiyin');

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-hidden="true" />
        {slowLoad && (
          <p className="text-sm font-medium text-[var(--muted)] text-center max-w-xs">
            {tr('This is taking longer than usual. Check your connection.', 'Грузится дольше обычного. Проверь соединение.', 'Odatdagidan uzoqroq yuklanmoqda. Internetni tekshiring.')}
          </p>
        )}
      </div>
    );
  }

  const renderTask = (task: Task) => (
    <Card
      key={task.id}
      hover
      className={`
        relative overflow-hidden group
        ${task.status === 'completed' ? 'opacity-75' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`
          px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest
          ${task.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
            task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-rose-500/10 text-rose-500'}
        `}>
          {difficultyLabel(task.difficulty)}
        </div>
        <div className="flex items-center gap-2 text-indigo-500 font-black">
          <Trophy className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">{task.xpReward} XP</span>
        </div>
      </div>

      <h3 className="text-2xl font-black mb-3 text-[var(--text)] group-hover:text-indigo-500 transition-colors">
        {task.title}
      </h3>
      <p className="text-[var(--muted)] text-sm leading-relaxed mb-6">
        {task.description}
      </p>

      {task.status !== 'completed' && (
        <div className="space-y-4 mb-6">
          <textarea
            value={taskAnswers[task.id] || ''}
            onChange={(e) => setTaskAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
            placeholder={t.taskAnswerPlaceholder}
            aria-label={`${t.taskAnswerPlaceholder} — ${task.title}`}
            maxLength={1000}
            className="w-full h-20 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-indigo-500/50 transition-colors custom-scrollbar resize-none font-bold"
          />

          {errorStatus[task.id] && (
            <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {errorStatus[task.id]}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => completeTask(task)}
            disabled={verifyingTaskId === task.id || !taskAnswers[task.id]?.trim()}
            className="w-full h-12 gap-2 rounded-2xl border-indigo-500/20 text-indigo-500 hover:bg-indigo-500 hover:text-white"
          >
            {verifyingTaskId === task.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {verifyingTaskId === task.id ? t.verifying : t.submitVerify}
          </Button>
        </div>
      )}

      {/* Shown for both outcomes, including right after a correct answer (the card turns "completed" at once). */}
      {taskFeedback[task.id] && (
        <div
          role="status"
          className={`p-4 mb-6 rounded-xl text-sm font-bold border flex items-start gap-2 ${taskFeedback[task.id].isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
        >
          {taskFeedback[task.id].isCorrect ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
          {taskFeedback[task.id].text}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-black uppercase tracking-widest">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {formatDate(task.createdAt)}
        </div>

        {task.status === 'completed' && (
          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            {t.complete}
          </div>
        )}
      </div>
    </Card>
  );

  const pending = tasks.filter((task) => task.status !== 'completed');
  const done = tasks.filter((task) => task.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.tasks}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {t.tasksSub}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {confirmClear ? (
            <div role="alertdialog" aria-label={tr('Delete all tasks?', 'Удалить все задания?', 'Barcha vazifalar o‘chirilsinmi?')} className="flex flex-wrap items-center gap-3 p-3 pl-5 rounded-3xl border border-rose-500/30 bg-rose-500/5">
              <span className="text-sm font-bold text-rose-500">{tr('Delete all tasks?', 'Удалить все задания?', 'Barcha vazifalar o‘chirilsinmi?')}</span>
              <Button
                variant="outline"
                onClick={clearAllTasks}
                disabled={isClearing}
                className="h-12 px-5 rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="ml-2 font-black uppercase text-xs tracking-widest">{tr('Delete', 'Удалить', 'O‘chirish')}</span>
              </Button>
              <Button variant="ghost" onClick={() => setConfirmClear(false)} disabled={isClearing} className="h-12 px-5 rounded-2xl">
                <span className="font-black uppercase text-xs tracking-widest">{tr('Cancel', 'Отмена', 'Bekor qilish')}</span>
              </Button>
            </div>
          ) : (
            <>
              {tasks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmClear(true)}
                  className="px-6 h-16 rounded-3xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="ml-2 font-black uppercase text-xs tracking-widest">{t.clearAll}</span>
                </Button>
              )}
              <Button
                onClick={generateTask}
                disabled={isGenerating}
                className="gap-3 h-16 px-8 rounded-3xl bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span className="font-black uppercase text-xs tracking-widest">{t.generateNewTask}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          {tr('Could not load your tasks. Check your connection and reload the page.', 'Не удалось загрузить задания. Проверь соединение и обнови страницу.', 'Vazifalarni yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
        </div>
      )}

      {tasks.length === 0 && !loadError ? (
        <div className="py-16 text-center space-y-6">
          <Zap className="w-16 h-16 mx-auto text-indigo-500/40" aria-hidden="true" />
          <div className="space-y-2">
            <p className="text-xl font-black uppercase tracking-widest text-[var(--text)]">{t.noTasks}</p>
            <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
              {tr('Get a short problem, enter your answer and earn XP.', 'Получи короткую задачу, введи ответ и заработай XP.', 'Qisqa masala oling, javobni kiriting va XP to‘plang.')}
            </p>
          </div>
          <Button onClick={generateTask} disabled={isGenerating} className="h-14 px-8 rounded-2xl gap-3 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span className="font-black uppercase text-xs tracking-widest">{t.generateNewTask}</span>
          </Button>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section aria-label={tr('To do', 'Нужно решить', 'Bajarish kerak')} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">{tr('To do', 'Нужно решить', 'Bajarish kerak')} · {pending.length}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{pending.map(renderTask)}</div>
            </section>
          )}
          {done.length > 0 && (
            <section aria-label={tr('Completed', 'Выполнено', 'Bajarilgan')} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">{tr('Completed', 'Выполнено', 'Bajarilgan')} · {done.length}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{done.map(renderTask)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
