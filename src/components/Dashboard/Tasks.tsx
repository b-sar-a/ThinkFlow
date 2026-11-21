import React, { useState, useEffect } from 'react';
import { CheckCircle2, ListChecks, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { Task } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { Badge, Button, EmptyState, Field, Modal, Notice, PageHeader, Panel, SectionTitle, Spinner, TextArea } from '../ds';
import { verifyTask } from '../../services/gemini';
import { levelInfo } from '../../lib/progress';

type Template = { title: string; desc: string; diff: 'Easy' | 'Medium' | 'Challenge'; xp: number };

const TEMPLATES: Record<'ru' | 'en', Template[]> = {
  en: [
    { title: 'Kinetics: velocity', desc: 'Calculate the velocity (v) if an object travels 150 m (d) in 30 s (t). Formula: v = d / t. Result in m/s.', diff: 'Easy', xp: 30 },
    { title: 'Algebra: solve for x', desc: 'Solve for x: 3x + 15 = 45. Give the numeric value.', diff: 'Easy', xp: 35 },
    { title: "Ohm's law", desc: 'A circuit has 10 V (V) and 2 Ω resistance (R). Calculate the current (I). Formula: I = V / R. Result in amperes.', diff: 'Medium', xp: 60 },
    { title: 'Geometry: area', desc: 'Calculate the area of a circle with radius r = 5 m. Use π = 3.14. Formula: A = πr². Result in m².', diff: 'Medium', xp: 65 },
    { title: 'Chemistry: molar mass', desc: 'Calculate the molar mass of H₂O (H = 1, O = 16). Give the total in g/mol.', diff: 'Medium', xp: 70 },
    { title: 'Logic: sequence', desc: 'Find the missing number: 1, 1, 2, 3, 5, 8, ? (Fibonacci sequence).', diff: 'Medium', xp: 50 },
    { title: 'Physics: power', desc: 'Calculate power (P) if work (W) is 500 J and time (t) is 10 s. Formula: P = W / t. Result in watts.', diff: 'Challenge', xp: 125 },
  ],
  ru: [
    { title: 'Кинематика: скорость', desc: 'Найди скорость (v), если тело проходит 150 м (d) за 30 с (t). Формула: v = d / t. Ответ в м/с.', diff: 'Easy', xp: 30 },
    { title: 'Алгебра: найди x', desc: 'Реши уравнение: 3x + 15 = 45. Ответ — число.', diff: 'Easy', xp: 35 },
    { title: 'Закон Ома', desc: 'В цепи напряжение 10 В (V) и сопротивление 2 Ом (R). Найди силу тока (I). Формула: I = V / R. Ответ в амперах.', diff: 'Medium', xp: 60 },
    { title: 'Геометрия: площадь', desc: 'Найди площадь круга с радиусом r = 5 м. Возьми π = 3,14. Формула: A = πr². Ответ в м².', diff: 'Medium', xp: 65 },
    { title: 'Химия: молярная масса', desc: 'Найди молярную массу H₂O (H = 1, O = 16). Ответ в г/моль.', diff: 'Medium', xp: 70 },
    { title: 'Логика: последовательность', desc: 'Найди пропущенное число: 1, 1, 2, 3, 5, 8, ? (числа Фибоначчи).', diff: 'Medium', xp: 50 },
    { title: 'Физика: мощность', desc: 'Найди мощность (P), если работа (W) равна 500 Дж, а время (t) — 10 с. Формула: P = W / t. Ответ в ваттах.', diff: 'Challenge', xp: 125 },
  ],
};

export const Tasks: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task));

        // Auto-purge legacy vague tasks
        const legacyTasks = tasksData.filter(
          (item) =>
            item.description?.includes('real-world scenario') ||
            item.description?.includes('momentum works') ||
            item.description?.includes('climate change')
        );
        legacyTasks.forEach(async (lt) => {
          try {
            await deleteDoc(doc(db, 'tasks', lt.id));
          } catch (e) {
            console.error('Auto-purge failed:', e);
          }
        });

        setTasks(tasksData.filter((item) => !legacyTasks.find((lt) => lt.id === item.id)));
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Tasks fetch error:', error);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const clearAllTasks = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'tasks'), where('userId', '==', user.uid)));
      await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'tasks', d.id))));
    } catch (error) {
      console.error('Clear tasks error:', error);
    } finally {
      setIsClearing(false);
      setConfirmClear(false);
    }
  };

  const generateTask = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);
    const pool = TEMPLATES[language === 'ru' ? 'ru' : 'en'];
    const template = pool[Math.floor(Math.random() * pool.length)];
    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        title: template.title,
        description: template.desc,
        difficulty: template.diff,
        status: 'pending',
        xpReward: template.xp,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Task generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeTask = async (task: Task) => {
    const answer = taskAnswers[task.id];
    if (!user || !profile || task.status === 'completed' || !answer?.trim()) return;

    setVerifyingTaskId(task.id);
    setErrorStatus((prev) => ({ ...prev, [task.id]: null }));
    try {
      const result = await verifyTask(task, answer, profile);
      setTaskFeedback((prev) => ({ ...prev, [task.id]: { isCorrect: result.isCorrect, text: result.feedback } }));

      if (result.isCorrect) {
        const newXP = (profile.xp || 0) + task.xpReward + (result.bonusXP || 0);
        await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });
        const level = levelInfo(newXP).level;
        await updateProfileData({ xp: newXP, level: Math.max(level, profile.level) });
      }
    } catch (error: any) {
      console.error('Task completion error:', error);
      setErrorStatus((prev) => ({
        ...prev,
        [task.id]:
          error?.message === 'PRO_LIMIT_REACHED'
            ? tr('AI token limit reached. Get more in “Bonuses & codes”.', 'Лимит ИИ-токенов исчерпан. Получи ещё в разделе «Бонусы и коды».', 'AI token limiti tugadi. «Bonus va kodlar» bo‘limidan oling.')
            : error?.message || tr('Could not check the answer. Try again.', 'Не удалось проверить ответ. Попробуй ещё раз.', 'Javobni tekshirib bo‘lmadi. Qayta urinib ko‘ring.'),
      }));
    } finally {
      setVerifyingTaskId(null);
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const difficulty = (value: string) =>
    value === 'Easy'
      ? { tone: 'ok' as const, label: tr('Easy', 'Лёгкое', 'Oson') }
      : value === 'Medium'
        ? { tone: 'warn' as const, label: tr('Medium', 'Среднее', 'O‘rta') }
        : { tone: 'bad' as const, label: tr('Challenge', 'Сложное', 'Qiyin') };

  if (loading) return <Spinner />;

  const active = tasks.filter((task) => task.status !== 'completed');
  const done = tasks.filter((task) => task.status === 'completed');

  const renderTask = (task: Task) => {
    const level = difficulty(task.difficulty);
    const completed = task.status === 'completed';
    const feedback = taskFeedback[task.id];
    return (
      <li key={task.id}>
        <Panel className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-fg">{task.title}</h3>
            <div className="flex items-center gap-2">
              <Badge tone={level.tone}>{level.label}</Badge>
              <Badge tone="hl">+{task.xpReward} XP</Badge>
            </div>
          </div>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-fg-muted">{task.description}</p>

          {!completed && (
            <div className="mt-4 space-y-3">
              <Field label={tr('Your answer', 'Твой ответ', 'Javobingiz')}>
                <TextArea
                  value={taskAnswers[task.id] || ''}
                  onChange={(e) => setTaskAnswers((prev) => ({ ...prev, [task.id]: e.target.value }))}
                  placeholder={t.taskAnswerPlaceholder}
                  maxLength={1000}
                  rows={2}
                />
              </Field>
              {feedback && <Notice tone={feedback.isCorrect ? 'ok' : 'bad'}>{feedback.text}</Notice>}
              {errorStatus[task.id] && <Notice tone="bad">{errorStatus[task.id]}</Notice>}
              <Button
                variant="secondary"
                onClick={() => completeTask(task)}
                disabled={!taskAnswers[task.id]?.trim()}
                loading={verifyingTaskId === task.id}
              >
                {verifyingTaskId === task.id ? t.verifying : t.submitVerify}
              </Button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm text-fg-muted">
            <span>{formatDate(task.createdAt)}</span>
            {completed && (
              <span className="inline-flex items-center gap-1.5 font-medium text-ok">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {t.complete}
              </span>
            )}
          </div>
        </Panel>
      </li>
    );
  };

  return (
    <>
      <PageHeader
        title={t.tasks}
        description={t.tasksSub}
        actions={
          <>
            {tasks.length > 0 && (
              <Button variant="ghost" onClick={() => setConfirmClear(true)}>
                <Trash2 className="size-4" aria-hidden="true" />
                {t.clearAll}
              </Button>
            )}
            <Button onClick={generateTask} loading={isGenerating}>
              {!isGenerating && <Plus className="size-4" aria-hidden="true" />}
              {t.generateNewTask}
            </Button>
          </>
        }
      />

      {loadError && (
        <Notice tone="bad" className="mb-4">
          {tr('Could not load your tasks. Check your connection and reload the page.', 'Не удалось загрузить задания. Проверь соединение и обнови страницу.', 'Vazifalarni yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
        </Notice>
      )}

      {tasks.length === 0 && !loadError ? (
        <EmptyState
          icon={<ListChecks className="size-5" />}
          title={t.noTasks}
          text={tr('Get a short problem to practice, then enter your answer to earn XP.', 'Получи короткую задачу, введи ответ и заработай XP.', 'Qisqa masala oling, javobni kiriting va XP to‘plang.')}
          action={
            <Button onClick={generateTask} loading={isGenerating}>
              {t.generateNewTask}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <SectionTitle>{tr('To do', 'Нужно решить', 'Bajarish kerak')} · {active.length}</SectionTitle>
              <ul className="grid gap-4 lg:grid-cols-2">{active.map(renderTask)}</ul>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <SectionTitle>{tr('Completed', 'Выполнено', 'Bajarilgan')} · {done.length}</SectionTitle>
              <ul className="grid gap-4 lg:grid-cols-2">{done.map(renderTask)}</ul>
            </section>
          )}
        </div>
      )}

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title={tr('Delete all tasks?', 'Удалить все задания?', 'Barcha vazifalar o‘chirilsinmi?')}>
        <p className="text-[15px] text-fg-muted">
          {tr('All your tasks will be removed. XP you already earned stays.', 'Все задания будут удалены. Уже заработанный XP останется.', 'Barcha vazifalar o‘chiriladi. Yig‘ilgan XP saqlanadi.')}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>
            {tr('Cancel', 'Отмена', 'Bekor qilish')}
          </Button>
          <Button variant="danger" onClick={clearAllTasks} loading={isClearing}>
            {tr('Delete all', 'Удалить все', 'Hammasini o‘chirish')}
          </Button>
        </div>
      </Modal>
    </>
  );
};
