
import React, { useState, useEffect, useMemo } from 'react';
import { Flame, ShieldAlert, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTr } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../../types';
import { Avatar, Badge, Button, EmptyState, IconButton, Modal, PageHeader, Panel, Spinner, Tabs } from '../ds';
import { levelInfo } from '../../lib/progress';

type Tab = 'users' | 'reviews' | 'analytics';

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const tr = useTr();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((d) => d.data() as UserProfile));
    });
    const unsubscribeReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('timestamp', 'desc')), (snapshot) => {
      setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
      setLoading(false);
    });
    const unsubscribeActivities = onSnapshot(collection(db, 'genius_lab_activities'), (snapshot) => {
      setActivities(snapshot.docs.map((d) => d.data()));
    });
    return () => {
      unsubscribeUsers();
      unsubscribeReviews();
      unsubscribeActivities();
    };
  }, [profile]);

  const deleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewToDelete));
    } catch (error) {
      console.error('Delete review error:', error);
    } finally {
      setReviewToDelete(null);
    }
  };

  const toggleAdmin = async (uid: string, currentRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: currentRole === 'admin' ? 'student' : 'admin' });
    } catch (error) {
      console.error('Toggle admin error:', error);
    }
  };

  // Funnel and habit metrics from real data: who signed up, who earned XP, who came back 3 days in a row.
  const analytics = useMemo(() => {
    const byUser: Record<string, { name: string; email: string; dates: Set<string> }> = {};
    activities.forEach((act) => {
      if (!act.userId) return;
      byUser[act.userId] ??= { name: act.userName || 'User', email: act.email || '', dates: new Set() };
      if (act.dateString) byUser[act.userId].dates.add(act.dateString);
    });

    const streaks = Object.values(byUser).map((u) => {
      const dates = Array.from(u.dates).sort();
      let current = dates.length ? 1 : 0;
      let best = current;
      for (let i = 0; i < dates.length - 1; i++) {
        const gap = Math.round((new Date(dates[i + 1]).getTime() - new Date(dates[i]).getTime()) / 86_400_000);
        current = gap === 1 ? current + 1 : 1;
        best = Math.max(best, current);
      }
      return { name: u.name, email: u.email, streak: best, retained: best >= 3 };
    });

    const active = streaks.length;
    const retained = streaks.filter((s) => s.retained).length;
    const activated = users.filter((u) => (u.xp || 0) > 0).length;
    return {
      registered: users.length,
      activated,
      activationRate: users.length ? Math.round((activated / users.length) * 100) : 0,
      active,
      retained,
      retentionRate: active ? Math.round((retained / active) * 100) : 0,
      streaks: streaks.sort((a, b) => b.streak - a.streak),
    };
  }, [activities, users]);

  if (profile?.role !== 'admin') {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-5" />}
        title={tr('Access denied', 'Доступ закрыт', 'Kirish taqiqlangan')}
        text={tr('This section is for administrators.', 'Этот раздел только для администраторов.', 'Bu bo‘lim faqat administratorlar uchun.')}
      />
    );
  }

  if (loading) return <Spinner />;

  const stats: { label: string; value: string; note?: string }[] = [
    { label: tr('Registered', 'Зарегистрировано', 'Ro‘yxatdan o‘tgan'), value: String(analytics.registered) },
    {
      label: tr('Earned XP at least once', 'Заработали XP хотя бы раз', 'Kamida bir marta XP olgan'),
      value: `${analytics.activated}`,
      note: `${analytics.activationRate}%`,
    },
    { label: tr('Opened the Lab', 'Открывали Лабораторию', 'Laboratoriyani ochgan'), value: String(analytics.active) },
    {
      label: tr('Came back 3 days in a row', 'Возвращались 3 дня подряд', '3 kun ketma-ket qaytgan'),
      value: `${analytics.retained}`,
      note: `${analytics.retentionRate}%`,
    },
  ];

  return (
    <>
      <PageHeader title={tr('Admin', 'Админ', 'Admin')} description={tr('Users, reviews and activity.', 'Пользователи, отзывы и активность.', 'Foydalanuvchilar, sharhlar va faollik.')} />

      <Tabs<Tab>
        label={tr('Admin sections', 'Разделы админки', 'Admin bo‘limlari')}
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'users', label: `${tr('Users', 'Пользователи', 'Foydalanuvchilar')} (${users.length})` },
          { id: 'reviews', label: `${tr('Reviews', 'Отзывы', 'Sharhlar')} (${reviews.length})` },
          { id: 'analytics', label: tr('Analytics', 'Аналитика', 'Tahlil') },
        ]}
      />

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'users' && (
          <Panel as="ul" className="divide-y divide-line">
            {users.map((u) => (
              <li key={u.uid} className="flex flex-wrap items-center gap-3 p-4">
                <Avatar name={u.name} src={u.photoURL} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-fg">{u.name}</p>
                  <p className="truncate text-sm text-fg-muted">{u.email}</p>
                </div>
                <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'}>{u.role}</Badge>
                <p className="tabular w-28 text-right text-sm text-fg-muted">
                  {(u.xp || 0).toLocaleString()} XP · {tr('Lv', 'Ур.', 'Dr.')} {levelInfo(u.xp || 0).level}
                </p>
                <Button variant={u.role === 'admin' ? 'danger' : 'secondary'} size="sm" onClick={() => toggleAdmin(u.uid, u.role)}>
                  {u.role === 'admin' ? tr('Revoke admin', 'Снять админа', 'Adminlikni olish') : tr('Make admin', 'Сделать админом', 'Admin qilish')}
                </Button>
              </li>
            ))}
          </Panel>
        )}

        {activeTab === 'reviews' &&
          (reviews.length === 0 ? (
            <EmptyState icon={<Star className="size-5" />} title={tr('No reviews', 'Отзывов нет', 'Sharhlar yo‘q')} />
          ) : (
            <Panel as="ul" className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-fg">
                      {r.userName} <span className="font-normal text-fg-muted">· {r.rating} / 5</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-fg-muted">{r.text}</p>
                  </div>
                  <IconButton label={tr('Delete review', 'Удалить отзыв', 'Sharhni o‘chirish')} onClick={() => setReviewToDelete(r.id!)}>
                    <Trash2 className="size-[18px]" />
                  </IconButton>
                </li>
              ))}
            </Panel>
          ))}

        {activeTab === 'analytics' && (
          <>
            <Panel>
              <dl className="grid grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <div key={stat.label} className={`p-5 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t border-line' : ''} lg:border-t-0 ${i > 0 ? 'lg:border-l' : 'lg:border-l-0'}`}>
                    <dt className="text-sm text-fg-muted">{stat.label}</dt>
                    <dd className="tabular mt-1 text-2xl font-semibold text-fg">
                      {stat.value}
                      {stat.note && <span className="ml-2 text-base font-medium text-fg-muted">{stat.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <h2 className="mb-3 mt-8 text-base font-semibold text-fg">{tr('Daily streaks in the Lab', 'Серии дней в Лаборатории', 'Laboratoriyadagi kunlik seriyalar')}</h2>
            {analytics.streaks.length === 0 ? (
              <EmptyState
                icon={<Flame className="size-5" />}
                title={tr('No activity yet', 'Активности пока нет', 'Hozircha faollik yo‘q')}
                text={tr('Streaks appear when students open courses or build maps in the Lab.', 'Серии появятся, когда ученики начнут открывать курсы и строить карты в Лаборатории.', 'Seriyalar o‘quvchilar Laboratoriyada kurs ochganda paydo bo‘ladi.')}
              />
            ) : (
              <Panel as="ul" className="divide-y divide-line">
                {analytics.streaks.map((s) => (
                  <li key={s.email || s.name} className="flex items-center gap-3 p-4">
                    <Avatar name={s.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-fg">{s.name}</p>
                      <p className="truncate text-sm text-fg-muted">{s.email}</p>
                    </div>
                    <Badge tone={s.retained ? 'ok' : 'neutral'} className="gap-1.5">
                      <Flame className="size-3.5" aria-hidden="true" />
                      <span className="tabular">{s.streak}</span> {tr('days', 'дн.', 'kun')}
                    </Badge>
                  </li>
                ))}
              </Panel>
            )}
          </>
        )}
      </div>

      <Modal open={reviewToDelete !== null} onClose={() => setReviewToDelete(null)} title={tr('Delete this review?', 'Удалить отзыв?', 'Sharh o‘chirilsinmi?')}>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReviewToDelete(null)}>{tr('Cancel', 'Отмена', 'Bekor qilish')}</Button>
          <Button variant="danger" onClick={deleteReview}>{tr('Delete', 'Удалить', 'O‘chirish')}</Button>
        </div>
      </Modal>
    </>
  );
};
