
import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Zap, Target, Star, FlaskConical, ListChecks, MessageSquare, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { db } from '../../lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { levelInfo } from '../../lib/progress';
import { PROGRAMS, LESSON_XP } from '../../data/programs';

interface ProgressProps {
  /** Lets the page send the student on to the Lab or the tasks. */
  onNavigate?: (view: string) => void;
}

export const Progress: React.FC<ProgressProps> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const [completedTasksCount, setCompletedTasksCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      try {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', user.uid), where('status', '==', 'completed'));
        const snapshot = await getCountFromServer(q);
        setCompletedTasksCount(snapshot.data().count);
      } catch (err) {
        console.error("Stats fetch error:", err);
        setCompletedTasksCount(0);
      }
    }

    fetchStats();
  }, [user]);

  if (!profile) return null;

  // Level and the bar come from the same formula the Lab uses to award XP.
  const { level, total, into, span, remaining, percent } = levelInfo(profile.xp);
  const streak = profile.streakDays ?? 0;
  const bestStreak = Math.max(profile.longestStreak ?? 0, streak);

  const stats = [
    { label: t.totalXP, value: total.toLocaleString(), icon: Zap, color: "text-indigo-500" },
    { label: t.currentLevelLabel, value: level, icon: Trophy, color: "text-yellow-500" },
    { label: t.tasksDone, value: completedTasksCount !== null ? completedTasksCount : "…", icon: Target, color: "text-emerald-500" },
    {
      label: t.dailyStreak,
      value: streak,
      icon: Star,
      color: "text-purple-500",
      note: bestStreak > streak ? `${tr('Best', 'Рекорд', 'Rekord')}: ${bestStreak}` : undefined,
    },
  ];

  // Finished lessons come from the profile, so they follow the student to every device.
  const lessonsDone = new Set(Array.isArray(profile.lessonsDone) ? profile.lessonsDone : []);
  const programRows = PROGRAMS.map((p) => ({
    id: p.id,
    title: p.title[language],
    done: p.lessons.filter((l) => lessonsDone.has(`${p.id}/${l.id}`)).length,
    total: p.lessons.length,
  }));
  const lessonsTotal = programRows.reduce((n, r) => n + r.done, 0);
  const lessonsAll = programRows.reduce((n, r) => n + r.total, 0);

  const ways = [
    { icon: GraduationCap, text: tr('Finish a lesson in Programs', 'Пройти урок в Программах', 'Dasturlarda darsni tugatish'), xp: `+${LESSON_XP} XP` },
    { icon: FlaskConical, text: tr('Open a course or build a map in the Lab', 'Открыть курс или построить карту в Лаборатории', 'Laboratoriyada kurs ochish yoki xarita qurish'), xp: '+25 XP' },
    { icon: ListChecks, text: tr('Solve a task correctly', 'Верно решить задание', 'Vazifani to‘g‘ri yechish'), xp: '30–125 XP' },
    { icon: MessageSquare, text: tr('Ask the AI assistant a question', 'Задать вопрос ИИ-ассистенту', 'AI yordamchiga savol berish'), xp: '+15 XP' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.progress}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {t.progressSub}
          </p>
        </div>
        <div className="w-20 h-20 shrink-0 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <BarChart3 className="w-10 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 md:p-8 rounded-[2.5rem] border border-[var(--border)] flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black uppercase text-[var(--muted)] tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-[var(--text)] tabular-nums">{stat.value}</p>
            {stat.note && <p className="mt-1 text-xs font-bold text-[var(--muted)]">{stat.note}</p>}
          </Card>
        ))}
      </div>

      <Card className="p-6 md:p-10 rounded-[2.5rem] border border-[var(--border)] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Programs', 'Программы', 'Dasturlar')}</h3>
          <p className="text-sm font-bold text-[var(--muted)] tabular-nums">{lessonsTotal}/{lessonsAll} {tr('lessons', 'уроков', 'dars')}</p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          {programRows.map((r) => {
            const pct = r.total ? (r.done / r.total) * 100 : 0;
            const row = (
              <>
                <span className="flex justify-between gap-3 text-sm font-bold text-[var(--text)]">
                  <span className="truncate">{r.title}</span>
                  <span className="text-[var(--muted)] tabular-nums shrink-0">{r.done}/{r.total}</span>
                </span>
                <span
                  role="progressbar"
                  aria-label={r.title}
                  aria-valuemin={0}
                  aria-valuemax={r.total}
                  aria-valuenow={r.done}
                  className="mt-2 block h-2 rounded-full bg-[var(--input)] overflow-hidden"
                >
                  <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                </span>
              </>
            );
            return (
              <li key={r.id}>
                {onNavigate ? (
                  <button type="button" onClick={() => onNavigate('programs')} className="block w-full text-left rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-500">
                    {row}
                  </button>
                ) : (
                  <div>{row}</div>
                )}
              </li>
            );
          })}
        </ul>
        {onNavigate && (
          <Button variant="outline" onClick={() => onNavigate('programs')} className="h-12 px-6 rounded-2xl gap-2">
            <span className="font-black uppercase text-xs tracking-widest">{tr('Open Programs', 'Открыть Программы', 'Dasturlarni ochish')}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </Card>

      <Card className="p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] border border-[var(--border)] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-black uppercase tracking-tighter text-[var(--text)]">{t.levelLabel} {level}</h3>
              <p className="text-[var(--muted)] font-medium">{t.nextLevel}: {level + 1}</p>
            </div>
            <div className="md:text-right">
              <p className="text-4xl md:text-5xl font-black text-indigo-500 font-mono tracking-tighter tabular-nums">{into.toLocaleString()} / {span.toLocaleString()}</p>
              <p className="text-xs font-black uppercase text-[var(--muted)] tracking-widest mt-1">{t.xpNextLevel}</p>
            </div>
          </div>

          <div
            role="progressbar"
            aria-label={t.xpNextLevel}
            aria-valuemin={0}
            aria-valuemax={span}
            aria-valuenow={into}
            className="h-6 bg-[var(--input)] rounded-full overflow-hidden border border-[var(--border)] p-1"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/40"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="text-lg font-bold text-[var(--text)]">
            {tr('Next level in', 'До следующего уровня', 'Keyingi darajagacha')} <span className="text-indigo-500 tabular-nums">{remaining.toLocaleString()} XP</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)]">
            {ways.map((way) => (
              <div key={way.text} className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--input)] border border-[var(--border)]">
                <way.icon className="w-5 h-5 mt-0.5 shrink-0 text-indigo-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] leading-snug">{way.text}</p>
                  <p className="text-xs font-black tracking-widest text-emerald-500 mt-1">{way.xp}</p>
                </div>
              </div>
            ))}
          </div>

          {onNavigate && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => onNavigate('genius_lab')} className="h-14 px-8 rounded-2xl gap-3 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30">
                <FlaskConical className="w-5 h-5" aria-hidden="true" />
                <span className="font-black uppercase text-xs tracking-widest">{tr('Continue in the Lab', 'Продолжить в Лаборатории', 'Laboratoriyada davom etish')}</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate('tasks')} className="h-14 px-8 rounded-2xl gap-3">
                <ListChecks className="w-5 h-5" aria-hidden="true" />
                <span className="font-black uppercase text-xs tracking-widest">{tr('Solve a task', 'Решить задание', 'Vazifa yechish')}</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
