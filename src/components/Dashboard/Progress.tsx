
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { PageHeader, Panel, ProgressBar, Skeleton } from '../ds';
import { levelInfo } from '../../lib/progress';

export const Progress: React.FC = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const tr = useTr();
  const [completedTasksCount, setCompletedTasksCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      try {
        const q = query(collection(db, 'tasks'), where('userId', '==', user!.uid), where('status', '==', 'completed'));
        const snapshot = await getCountFromServer(q);
        setCompletedTasksCount(snapshot.data().count);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setCompletedTasksCount(0);
      }
    }
    fetchStats();
  }, [user]);

  if (!profile) return null;

  const { level, total, into, span, remaining, percent } = levelInfo(profile.xp);
  const streak = profile.streakDays ?? 0;
  const best = Math.max(profile.longestStreak ?? 0, streak);

  const stats: { label: string; value: React.ReactNode; note?: string }[] = [
    { label: t.totalXP, value: total.toLocaleString() },
    { label: t.currentLevelLabel, value: level },
    {
      label: t.tasksDone,
      value: completedTasksCount === null ? <Skeleton className="mt-1 h-7 w-10" /> : completedTasksCount,
    },
    {
      label: t.dailyStreak,
      value: `${streak} ${t.days}`,
      note: best > streak ? `${tr('Best', 'Рекорд', 'Rekord')}: ${best}` : undefined,
    },
  ];

  return (
    <>
      <PageHeader title={t.progress} description={t.progressSub} />

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-fg-muted">{tr('Your level', 'Твой уровень', 'Darajangiz')}</p>
            <p className="tabular text-4xl font-semibold tracking-tight text-fg">{level}</p>
          </div>
          <p className="tabular text-sm text-fg-muted">
            {into.toLocaleString()} / {span.toLocaleString()} XP
          </p>
        </div>
        <ProgressBar value={percent} label={tr('Progress to the next level', 'Прогресс до следующего уровня', 'Keyingi darajagacha')} className="mt-4 h-3" />
        <p className="mt-3 text-sm text-fg-muted">
          {tr('Next level in', 'До следующего уровня', 'Keyingi darajagacha')} <span className="tabular font-medium text-fg">{remaining.toLocaleString()} XP</span>
        </p>
      </Panel>

      <Panel className="mt-6">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-5 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t border-line' : ''} lg:border-t-0 ${i > 0 ? 'lg:border-l' : 'lg:border-l-0'}`}
            >
              <dt className="text-sm text-fg-muted">{stat.label}</dt>
              <dd className="tabular mt-1 text-2xl font-semibold text-fg">{stat.value}</dd>
              {stat.note && <p className="mt-0.5 text-sm text-fg-muted">{stat.note}</p>}
            </div>
          ))}
        </dl>
      </Panel>

      {streak === 0 && (
        <p className="mt-4 text-sm text-fg-muted">
          {tr('Open ThinkFlow every day to build a streak.', 'Заходи каждый день, чтобы набрать серию.', 'Seriya yig‘ish uchun har kuni kiring.')}
        </p>
      )}
    </>
  );
};
