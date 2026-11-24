import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Users, Trash2, Loader2, Flame, Star, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import { authedPost } from '../../services/http';
import { fetchTeacherAdmin, teacherAction, type TeacherAdminData } from '../../services/classes';

type Tab = 'users' | 'reports' | 'reviews' | 'teachers' | 'analytics' | 'status';
type ReportFilter = 'open' | 'resolved';

const USERS_LIMIT = 500;
const REVIEWS_LIMIT = 200;
const ACTIVITY_LIMIT = 2000;

interface ConfirmState {
  title: string;
  text?: string;
  confirmLabel: string;
  danger?: boolean;
  run: () => Promise<void>;
}

export const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  // The admin panel is for the team: English and Russian only (Uzbek falls back to English).
  const tr = (en: string, ru: string) => (language === 'ru' ? ru : en);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('open');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const fail = (what: string) => (error: unknown) => {
      console.warn(`Admin: could not load ${what}:`, error);
      setLoadError(true);
      setLoading(false);
    };

    const unsubscribers = [
      onSnapshot(
        query(collection(db, 'users'), limit(USERS_LIMIT)),
        (snapshot) => {
          setUsers(snapshot.docs.map((d) => d.data() as UserProfile));
          setLoading(false);
        },
        fail('users')
      ),
      onSnapshot(
        query(collection(db, 'reviews'), orderBy('timestamp', 'desc'), limit(REVIEWS_LIMIT)),
        (snapshot) => setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review))),
        fail('reviews')
      ),
      onSnapshot(
        query(collection(db, 'genius_lab_activities'), orderBy('timestamp', 'desc'), limit(ACTIVITY_LIMIT)),
        (snapshot) => setActivities(snapshot.docs.map((d) => d.data())),
        fail('activity')
      ),
      onSnapshot(
        query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100)),
        (snapshot) => setReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
        fail('reports')
      ),
    ];
    return () => unsubscribers.forEach((u) => u());
  }, [isAdmin]);

  const userById = useMemo(() => {
    const map = new Map<string, UserProfile>();
    users.forEach((u) => map.set(u.uid, u));
    return map;
  }, [users]);

  const nameOf = (uid?: string) => {
    if (!uid) return '—';
    const u = userById.get(uid);
    return u ? `${u.name} (${u.email})` : uid;
  };

  // These throw on failure so the confirm dialog can show "try again".
  const resolveReport = async (id: string) => {
    await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
  };

  const deleteReported = async (r: any) => {
    if (r.targetType === 'post') await deleteDoc(doc(db, 'posts', r.targetId));
    else if (r.targetType === 'comment' && r.postId) await deleteDoc(doc(db, 'posts', r.postId, 'comments', r.targetId));
    await resolveReport(r.id);
  };

  const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, 'reviews', id));
  };

  const setRole = async (uid: string, role: 'student' | 'admin') => {
    await updateDoc(doc(db, 'users', uid), { role });
  };

  const askRole = (u: UserProfile) => {
    const makeAdmin = u.role !== 'admin';
    setConfirm({
      title: makeAdmin ? tr('Make this person an admin?', 'Сделать администратором?') : tr('Revoke admin rights?', 'Забрать права администратора?'),
      text: makeAdmin
        ? tr(`${u.name} will be able to read all student data, delete content and change roles.`, `${u.name} сможет читать данные всех учеников, удалять контент и менять роли.`)
        : tr(`${u.name} will become a regular student.`, `${u.name} станет обычным учеником.`),
      confirmLabel: makeAdmin ? tr('Make admin', 'Сделать админом') : tr('Revoke', 'Забрать права'),
      danger: !makeAdmin,
      run: () => setRole(u.uid, makeAdmin ? 'admin' : 'student'),
    });
  };

  const retention = useMemo(() => {
    const byUser: Record<string, Set<string>> = {};
    activities.forEach((a) => {
      if (!a.userId || !a.dateString) return;
      (byUser[a.userId] ??= new Set<string>()).add(a.dateString);
    });

    const rows = Object.entries(byUser).map(([uid, dates]) => {
      const sorted = Array.from(dates).sort();
      let current = 1;
      let max = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000);
        current = diff === 1 ? current + 1 : 1;
        if (current > max) max = current;
      }
      return { uid, streak: max, retained: max >= 3 };
    });

    const retained = rows.filter((r) => r.retained).length;
    return {
      rows: rows.sort((a, b) => b.streak - a.streak),
      retained,
      total: rows.length,
      rate: rows.length ? Math.round((retained / rows.length) * 100) : 0,
    };
  }, [activities]);

  const funnel = useMemo(() => {
    const total = users.length;
    const steps = [
      { key: 'reg', label: tr('Registered', 'Зарегистрировались'), count: total },
      { key: 'onb', label: tr('Finished onboarding', 'Прошли онбординг'), count: users.filter((u) => u.onboarded || (u.interests?.length ?? 0) > 0).length },
      { key: 'xp', label: tr('Earned XP', 'Заработали XP'), count: users.filter((u) => (u.xp || 0) > 0).length },
      { key: 'streak', label: tr('3-day streak', 'Серия 3 дня'), count: users.filter((u) => (u.longestStreak || 0) >= 3).length },
    ];
    return steps.map((s) => ({ ...s, pct: total ? Math.round((s.count / total) * 100) : 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, language]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));
  }, [users, search]);

  const openReports = reports.filter((r) => r.status !== 'resolved');
  const handledReports = reports.filter((r) => r.status === 'resolved');
  const shownReports = reportFilter === 'open' ? openReports : handledReports;

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-6" aria-hidden="true" />
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Access denied', 'Нет доступа')}</h1>
        <p className="text-[var(--muted)] mt-2">{tr('You do not have administrator rights.', 'У вас нет прав администратора.')}</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number; active: string }[] = [
    { id: 'users', label: tr('Users', 'Ученики'), count: users.length, active: 'bg-indigo-600' },
    { id: 'reports', label: tr('Reports', 'Жалобы'), count: openReports.length, active: 'bg-rose-600' },
    { id: 'reviews', label: tr('Reviews', 'Отзывы'), count: reviews.length, active: 'bg-indigo-600' },
    { id: 'teachers', label: tr('Teachers', 'Учителя'), active: 'bg-indigo-600' },
    { id: 'analytics', label: tr('Analytics', 'Аналитика'), active: 'bg-emerald-600' },
    { id: 'status', label: tr('Status', 'Состояние'), active: 'bg-emerald-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Admin panel', 'Админ-панель')}</h1>
        <p className="text-[var(--muted)] font-medium">{tr('Students, reports, reviews and product health.', 'Ученики, жалобы, отзывы и состояние продукта.')}</p>
      </div>

      <div role="tablist" aria-label={tr('Admin sections', 'Разделы админки')} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls="admin-panel"
            onClick={() => setActiveTab(tab.id)}
            className={`h-11 px-5 shrink-0 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors ${
              activeTab === tab.id ? `${tab.active} text-white shadow-lg` : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-2 opacity-70">{tab.count}</span>}
          </button>
        ))}
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-semibold">
          {tr('Some data could not be loaded. Check the Firestore rules and your connection.', 'Часть данных не загрузилась. Проверьте правила Firestore и соединение.')}
        </div>
      )}

      <div id="admin-panel" role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`}>
        {loading ? (
          <div className="py-20 flex justify-center" role="status" aria-label={tr('Loading', 'Загрузка')}>
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={tr('Search by name or email', 'Поиск по имени или email')}
                placeholder={tr('Search by name or email', 'Поиск по имени или email')}
                className="w-full h-12 pl-11 pr-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:border-indigo-500 placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>
            {users.length >= USERS_LIMIT && (
              <p className="text-xs text-[var(--muted)]">{tr(`Showing the first ${USERS_LIMIT} accounts.`, `Показаны первые ${USERS_LIMIT} аккаунтов.`)}</p>
            )}
            {visibleUsers.length === 0 && (
              <p className="py-10 text-center text-[var(--muted)]">{tr('Nobody found.', 'Никого не найдено.')}</p>
            )}
            <ul className="space-y-3">
              {visibleUsers.map((u) => {
                const self = u.uid === user?.uid;
                return (
                  <li key={u.uid}>
                    <Card className="p-4 md:p-5 rounded-3xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center font-black text-indigo-500 border border-indigo-500/25 shrink-0" aria-hidden="true">
                          {u.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-black text-sm text-[var(--text)] truncate">
                            {u.name}
                            {u.role === 'admin' && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black uppercase">admin</span>
                            )}
                          </h2>
                          <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-black text-[var(--text)]">{u.xp || 0} XP</p>
                          <p className="text-xs text-[var(--muted)]">{tr('Level', 'Уровень')} {u.level || 1}{u.streakDays ? ` · ${u.streakDays} ${tr('d streak', 'дн. серия')}` : ''}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={self}
                          title={self ? tr('You cannot change your own role', 'Свою роль менять нельзя') : undefined}
                          onClick={() => askRole(u)}
                          className={`rounded-xl h-11 px-4 text-xs shrink-0 ${u.role === 'admin' ? 'border-rose-500 text-rose-500' : 'border-indigo-500 text-indigo-500'}`}
                        >
                          {u.role === 'admin' ? tr('Revoke admin', 'Забрать права') : tr('Make admin', 'Сделать админом')}
                        </Button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['open', 'resolved'] as ReportFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={reportFilter === f}
                  onClick={() => setReportFilter(f)}
                  className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                    reportFilter === f ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {f === 'open' ? tr('Open', 'Открытые') : tr('Handled', 'Обработанные')} ({f === 'open' ? openReports.length : handledReports.length})
                </button>
              ))}
            </div>

            {shownReports.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-[2rem] text-[var(--muted)]">
                <ShieldAlert className="w-10 h-10 text-indigo-500/50 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-semibold">
                  {reportFilter === 'open' ? tr('No open reports.', 'Открытых жалоб нет.') : tr('No handled reports yet.', 'Обработанных жалоб пока нет.')}
                </p>
              </div>
            ) : (
              shownReports.map((r) => (
                <Card key={r.id} className="p-5 md:p-6 rounded-3xl border border-[var(--border)] space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-wider">{r.reason}</span>
                    <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">{r.targetType}</span>
                    <span className="text-xs text-[var(--muted)]">{new Date(r.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}</span>
                  </div>
                  {r.text && <p className="text-sm text-[var(--text)] whitespace-pre-wrap break-words p-4 rounded-2xl bg-[var(--input)]">{r.text}</p>}
                  {r.details && <p className="text-sm text-[var(--muted)] break-words">“{r.details}”</p>}
                  <p className="text-xs text-[var(--muted)] break-words">
                    {tr('Reported by', 'Пожаловался')}: {nameOf(r.reporterId)} · {tr('About', 'На')}: {nameOf(r.targetUserId)}
                  </p>
                  {r.status !== 'resolved' && (
                    <div className="flex flex-wrap gap-3">
                      {(r.targetType === 'post' || r.targetType === 'comment') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConfirm({
                              title: tr('Delete the reported content?', 'Удалить контент, на который пожаловались?'),
                              text: tr('It will be removed for everyone and the report will be marked as handled.', 'Он исчезнет у всех, а жалоба будет отмечена обработанной.'),
                              confirmLabel: tr('Delete', 'Удалить'),
                              danger: true,
                              run: () => deleteReported(r),
                            })
                          }
                          className="rounded-xl h-11 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                        >
                          {tr('Delete content', 'Удалить контент')}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveReport(r.id).catch((e) => console.error('Resolve report error:', e))}
                        className="rounded-xl h-11"
                      >
                        {tr('Mark handled', 'Отметить обработанной')}
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'status' ? (
          <StatusPanel tr={tr} />
        ) : activeTab === 'teachers' ? (
          <TeacherApprovals tr={tr} />
        ) : activeTab === 'reviews' ? (
          <ul className="space-y-3">
            {reviews.length === 0 && <li className="py-10 text-center text-[var(--muted)]">{tr('No reviews yet.', 'Отзывов пока нет.')}</li>}
            {reviews.map((r) => (
              <li key={r.id}>
                <Card className="p-5 rounded-3xl border border-[var(--border)] flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-sm text-[var(--text)] truncate">{r.userName}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-500" aria-label={`${r.rating} / 5`}>
                        <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> {r.rating}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)] whitespace-pre-wrap break-words">{r.text}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={tr('Delete review', 'Удалить отзыв')}
                    onClick={() =>
                      setConfirm({
                        title: tr('Delete this review?', 'Удалить этот отзыв?'),
                        text: tr('This cannot be undone.', 'Это нельзя отменить.'),
                        confirmLabel: tr('Delete', 'Удалить'),
                        danger: true,
                        run: () => deleteReview(r.id!),
                      })
                    }
                    className="rounded-xl h-11 w-11 p-0 shrink-0 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 md:p-8 rounded-[2rem] border border-emerald-500/20 relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg className="w-40 h-40" viewBox="0 0 176 176" role="img" aria-label={`${retention.rate}%`}>
                    <circle cx="88" cy="88" r="76" stroke="var(--border)" strokeWidth="12" fill="transparent" />
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      className="stroke-emerald-500"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 76}
                      strokeDashoffset={2 * Math.PI * 76 * (1 - retention.rate / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 88 88)"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-[var(--text)] leading-none">{retention.rate}%</span>
                    <span className="text-xs font-black tracking-wider text-emerald-500 uppercase mt-1">{tr('3-day streak', 'Серия 3 дня')}</span>
                  </div>
                </div>
                <div className="space-y-3 relative">
                  <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text)]">{tr('Habit: 3 days in a row', 'Привычка: 3 дня подряд')}</h2>
                  <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md">
                    {tr(
                      `Share of students with Genius Lab activity who were active on 3 consecutive days. Based on the latest ${ACTIVITY_LIMIT} activity records.`,
                      `Доля учеников с активностью в Лаборатории, которые занимались 3 дня подряд. Считается по последним ${ACTIVITY_LIMIT} записям активности.`
                    )}
                  </p>
                  <p className="text-sm text-[var(--text)] font-bold">
                    {retention.retained} {tr('of', 'из')} {retention.total} {tr('active students', 'активных учеников')}
                  </p>
                </div>
              </Card>

              <Card className="p-6 rounded-[2rem] border border-indigo-500/20 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-400 tracking-wider uppercase">{tr('Accounts', 'Аккаунтов')}</span>
                  <Users className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-4xl font-black text-[var(--text)]">{users.length}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{tr('Total registered on the platform.', 'Всего зарегистрировано на платформе.')}</p>
                </div>
              </Card>
            </div>

            <VisitorFunnel tr={tr} />

            <Card className="p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-5">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                {tr('Student funnel (from profiles)', 'Воронка учеников (по профилям)')}
              </h2>
              <ul className="space-y-4">
                {funnel.map((s) => (
                  <li key={s.key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[var(--text)]">{s.label}</span>
                      <span className="text-[var(--muted)]">{s.count} · {s.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--input)] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--muted)]">
                {tr('Built from student profiles. Page-level events (sign-up clicks, first task) are not tracked yet.', 'Считается по профилям учеников. События по экранам (клики регистрации, первое задание) пока не отслеживаются.')}
              </p>
            </Card>

            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase text-[var(--muted)] tracking-[0.2em] pl-1">
                {tr('Longest daily streaks in Genius Lab', 'Лучшие серии занятий в Лаборатории')}
              </h2>
              {retention.rows.length > 0 ? (
                <ul className="space-y-3">
                  {retention.rows.slice(0, 50).map((row) => {
                    const u = userById.get(row.uid);
                    const name = u?.name || '—';
                    return (
                      <li key={row.uid}>
                        <Card className="p-4 rounded-3xl border border-[var(--border)] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${row.retained ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--input)] text-[var(--muted)]'}`} aria-hidden="true">
                              {name[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-[var(--text)] truncate">{name}</p>
                              <p className="text-xs text-[var(--muted)] truncate">{u?.email || row.uid}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shrink-0 ${row.retained ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            <Flame className="w-3.5 h-3.5" aria-hidden="true" /> {row.streak} {row.streak === 1 ? tr('day', 'дн.') : tr('days', 'дн.')}
                          </span>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-[2rem] text-[var(--muted)]">
                  <Flame className="w-10 h-10 text-indigo-500/50 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-semibold">{tr('No activity recorded yet.', 'Активности пока нет.')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          text={confirm.text}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.run}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

interface FunnelData {
  funnel: { key: string; count: number; fromPrevious: number | null; fromFirst: number | null }[];
  extras: Record<string, number>;
  daily: { day: string; visits: number; signups: number }[];
  days: number;
  truncated: boolean;
}

/** Visitor funnel from the milestone events the app sends (server/analytics.ts). */
const VisitorFunnel: React.FC<{ tr: (en: string, ru: string) => string }> = ({ tr }) => {
  const [data, setData] = useState<FunnelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authedPost<FunnelData>('/api/admin/funnel', {})
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        if (cancelled) return;
        const code = String(e?.message || '');
        setError(
          code === 'ANALYTICS_UNAVAILABLE'
            ? tr('Event analytics needs FIREBASE_SERVICE_ACCOUNT on the server.', 'Для аналитики событий нужен FIREBASE_SERVICE_ACCOUNT на сервере.')
            : tr('Could not load the visitor funnel.', 'Не удалось загрузить воронку посетителей.')
        );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labels: Record<string, string> = {
    landing_view: tr('Visited the site', 'Зашли на сайт'),
    signup_started: tr('Opened sign-in', 'Открыли вход'),
    signup_completed: tr('Signed up', 'Зарегистрировались'),
    onboarding_completed: tr('Finished onboarding', 'Прошли онбординг'),
    activated: tr('First learning action', 'Первое учебное действие'),
  };
  const extraLabels: Record<string, string> = {
    first_lab_topic: tr('Lab topic', 'Тема в Лаборатории'),
    first_task_completed: tr('First task', 'Первое задание'),
    first_lesson_completed: tr('First lesson', 'Первый урок'),
    referral_claimed: tr('Invite used', 'Приглашение применено'),
    parent_linked: tr('Parent connected', 'Родитель подключён'),
  };

  const max = data ? Math.max(1, ...data.daily.map((d) => d.visits)) : 1;

  return (
    <Card className="p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-5">
      <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
        <TrendingUp className="w-4 h-4" aria-hidden="true" />
        {tr('Visitor funnel', 'Воронка посетителей')}{data ? ` · ${data.days} ${tr('days', 'дн.')}` : ''}
      </h2>

      {error ? (
        <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>
      ) : !data ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка')} />
      ) : (
        <>
          <ul className="space-y-4">
            {data.funnel.map((s) => (
              <li key={s.key} className="space-y-1.5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-bold text-[var(--text)]">{labels[s.key] ?? s.key}</span>
                  <span className="text-[var(--muted)] text-right">
                    {s.count}
                    {s.fromPrevious !== null && <> · {s.fromPrevious}% {tr('of previous', 'от прошлого шага')}</>}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--input)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full" style={{ width: `${s.fromFirst ?? 100}%` }} />
                </div>
              </li>
            ))}
          </ul>

          <dl className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(data.extras).map(([key, value]) => (
              <div key={key} className="p-3 rounded-2xl bg-[var(--input)]">
                <dt className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{extraLabels[key] ?? key}</dt>
                <dd className="mt-1 text-lg font-black text-[var(--text)]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Visits and sign-ups per day', 'Визиты и регистрации по дням')}</h3>
            <div className="flex items-end gap-1 h-24" role="img" aria-label={tr('Daily visits and sign-ups', 'Визиты и регистрации по дням')}>
              {data.daily.map((d) => (
                <div key={d.day} className="flex-1 h-full flex flex-col justify-end" title={`${d.day}: ${d.visits} / ${d.signups}`}>
                  <div className="w-full rounded-t bg-indigo-500/40 flex flex-col justify-end" style={{ height: `${(d.visits / max) * 100}%` }}>
                    <div className="w-full rounded-t bg-emerald-500" style={{ height: d.visits ? `${Math.min(100, (d.signups / d.visits) * 100)}%` : 0 }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {tr('Counts are per device, not per person. Indigo: visits, green: sign-ups.', 'Считается по устройствам, а не по людям. Фиолетовый: визиты, зелёный: регистрации.')}
              {data.truncated && ' ' + tr('Showing the latest 50,000 events only.', 'Показаны только последние 50 000 событий.')}
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

/** Teacher requests: an admin checks who is asking before anyone can see students (server/classes.ts). */
const TeacherApprovals: React.FC<{ tr: (en: string, ru: string) => string }> = ({ tr }) => {
  const [data, setData] = useState<TeacherAdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const load = () =>
    fetchTeacherAdmin()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => {
        setData({ requests: [], teachers: [] });
        setError(
          String(e?.message || '') === 'FAMILY_UNAVAILABLE'
            ? tr('Needs FIREBASE_SERVICE_ACCOUNT on the server.', 'Нужен FIREBASE_SERVICE_ACCOUNT на сервере.')
            : tr('Could not load teachers.', 'Не удалось загрузить учителей.')
        );
      });

  useEffect(() => {
    load();
  }, []);

  const ask = (action: 'approve' | 'decline' | 'revoke', uid: string, name: string) =>
    setConfirm({
      title:
        action === 'approve' ? tr('Approve this teacher?', 'Подтвердить учителя?')
        : action === 'decline' ? tr('Decline this request?', 'Отклонить заявку?')
        : tr('Revoke teacher access?', 'Забрать доступ учителя?'),
      text:
        action === 'approve'
          ? tr(`${name} will be able to create classes and see the progress of students who join.`, `${name} сможет создавать классы и видеть прогресс учеников, которые вступят.`)
          : action === 'decline'
            ? tr('The request is deleted.', 'Заявка будет удалена.')
            : tr(`${name} loses access to every class at once and class codes stop working.`, `${name} сразу теряет доступ ко всем классам, коды классов перестают работать.`),
      confirmLabel: action === 'approve' ? tr('Approve', 'Подтвердить') : action === 'decline' ? tr('Decline', 'Отклонить') : tr('Revoke', 'Забрать'),
      danger: action !== 'approve',
      run: async () => {
        await teacherAction(action, uid);
        await load();
      },
    });

  if (!data) return <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка')} /></div>;

  return (
    <div className="space-y-8">
      {error && <p role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-semibold">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">{tr('Requests', 'Заявки')} ({data.requests.length})</h2>
        {data.requests.length === 0 ? (
          <p className="py-8 text-center border border-dashed border-[var(--border)] rounded-[2rem] text-[var(--muted)]">{tr('No pending requests.', 'Новых заявок нет.')}</p>
        ) : (
          <ul className="space-y-3">
            {data.requests.map((r) => (
              <li key={r.uid}>
                <Card className="p-5 rounded-3xl border border-[var(--border)] space-y-3">
                  <div>
                    <p className="font-black text-[var(--text)]">{r.name || r.uid}</p>
                    <p className="text-xs text-[var(--muted)] break-all">{r.email}</p>
                  </div>
                  <p className="text-sm text-[var(--text)]"><span className="font-bold">{tr('School', 'Школа')}:</span> {r.school}</p>
                  {r.note && <p className="text-sm text-[var(--muted)] whitespace-pre-wrap break-words">{r.note}</p>}
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" onClick={() => ask('approve', r.uid, r.name)} className="rounded-xl h-11"><span className="font-black uppercase text-xs tracking-wider">{tr('Approve', 'Подтвердить')}</span></Button>
                    <Button variant="outline" size="sm" onClick={() => ask('decline', r.uid, r.name)} className="rounded-xl h-11"><span className="font-black uppercase text-xs tracking-wider">{tr('Decline', 'Отклонить')}</span></Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">{tr('Teachers', 'Учителя')} ({data.teachers.length})</h2>
        {data.teachers.length === 0 ? (
          <p className="py-8 text-center border border-dashed border-[var(--border)] rounded-[2rem] text-[var(--muted)]">{tr('No approved teachers yet.', 'Подтверждённых учителей пока нет.')}</p>
        ) : (
          <ul className="space-y-3">
            {data.teachers.map((t) => (
              <li key={t.uid}>
                <Card className="p-4 rounded-3xl border border-[var(--border)] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-black text-[var(--text)] truncate">{t.name || t.uid}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{t.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => ask('revoke', t.uid, t.name)} className="rounded-xl h-11 px-4 shrink-0 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white">
                    <span className="font-black uppercase text-xs tracking-wider">{tr('Revoke', 'Забрать')}</span>
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirm && (
        <ConfirmDialog title={confirm.title} text={confirm.text} confirmLabel={confirm.confirmLabel} danger={confirm.danger} onConfirm={confirm.run} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
};

interface Health {
  status: string;
  node?: string;
  aiKeyLoaded: boolean;
  quotaEnforced: boolean;
  emailConfigured?: boolean;
  cronConfigured?: boolean;
}

/** What the server can do right now, read from /api/health, with the exact next step for anything that is off. */
const StatusPanel: React.FC<{ tr: (en: string, ru: string) => string }> = ({ tr }) => {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setHealth(null);
    setFailed(false);
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setHealth)
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  const Row: React.FC<{ ok: boolean; title: string; ok_text: string; off_text: string }> = ({ ok, title, ok_text, off_text }) => (
    <li className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--input)]">
      <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-black text-[var(--text)]">
          {title} <span className={`text-xs uppercase tracking-wider ${ok ? 'text-emerald-500' : 'text-rose-500'}`}>{ok ? tr('works', 'работает') : tr('off', 'выключено')}</span>
        </p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{ok ? ok_text : off_text}</p>
      </div>
    </li>
  );

  const needKey = tr('Add FIREBASE_SERVICE_ACCOUNT in Vercel (Settings → Environment Variables), then redeploy.', 'Добавьте FIREBASE_SERVICE_ACCOUNT в Vercel (Settings → Environment Variables) и перевыкатите сайт.');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">{tr('Read live from the server (/api/health).', 'Читается с сервера в реальном времени (/api/health).')}</p>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl h-11 px-4 shrink-0">
          <span className="font-black uppercase text-xs tracking-wider">{tr('Refresh', 'Обновить')}</span>
        </Button>
      </div>

      {failed ? (
        <p role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-semibold">
          {tr('The server does not answer. Check the latest deployment in Vercel and its function logs.', 'Сервер не отвечает. Проверьте последний деплой в Vercel и логи функции.')}
        </p>
      ) : !health ? (
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка')} />
      ) : (
        <>
          <ul className="space-y-3">
            <Row ok title={tr('Server', 'Сервер')} ok_text={`${tr('Answers requests', 'Отвечает на запросы')}${health.node ? `, Node ${health.node}` : ''}.`} off_text="" />
            <Row
              ok={health.aiKeyLoaded}
              title={tr('AI (Gemini)', 'ИИ (Gemini)')}
              ok_text={tr('The key is loaded. If it was ever in the old public code, replace it with a new one (aistudio.google.com) and update GEMINI_API_KEY in Vercel.', 'Ключ загружен. Если он когда-то был в старом публичном коде, замените его новым (aistudio.google.com) и обновите GEMINI_API_KEY в Vercel.')}
              off_text={tr('Add GEMINI_API_KEY in Vercel (Settings → Environment Variables), then redeploy.', 'Добавьте GEMINI_API_KEY в Vercel (Settings → Environment Variables) и перевыкатите сайт.')}
            />
            <Row
              ok={health.quotaEnforced}
              title={tr('Token quota', 'Квота токенов')}
              ok_text={tr('Each student has a real, shared daily limit in Firestore.', 'У каждого ученика настоящий общий лимит в Firestore.')}
              off_text={tr('Only a rough in-memory limit protects the AI. ', 'Сейчас ИИ защищает только приблизительный лимит в памяти. ') + needKey}
            />
            <Row ok={health.quotaEnforced} title={tr('Promo codes and invites', 'Промокоды и приглашения')} ok_text={tr('Credited on the server, once per student.', 'Начисляются на сервере, один раз на ученика.')} off_text={needKey} />
            <Row ok={health.quotaEnforced} title={tr('Parent access', 'Доступ родителей')} ok_text={tr('Codes and the parent cabinet work.', 'Коды и кабинет родителя работают.')} off_text={needKey} />
            <Row ok={health.quotaEnforced} title={tr('Teacher cabinet', 'Кабинет учителя')} ok_text={tr('Requests, approval and classes work.', 'Заявки, одобрение и классы работают.')} off_text={needKey} />
            <Row ok={health.quotaEnforced} title={tr('Funnel analytics', 'Аналитика воронки')} ok_text={tr('Events are stored; see Analytics.', 'События сохраняются; смотрите «Аналитика».')} off_text={needKey} />
            <Row
              ok={Boolean(health.quotaEnforced && health.emailConfigured && health.cronConfigured)}
              title={tr('Weekly parent email', 'Недельное письмо родителям')}
              ok_text={tr('Parents who turned it on get a summary every week.', 'Родители, включившие сводку, получают её каждую неделю.')}
              off_text={
                !health.quotaEnforced
                  ? needKey
                  : tr(
                      'Add RESEND_API_KEY, DIGEST_FROM and CRON_SECRET in Vercel, then redeploy (docs/LAUNCH.md, section 6в).',
                      'Добавьте RESEND_API_KEY, DIGEST_FROM и CRON_SECRET в Vercel и перевыкатите сайт (docs/LAUNCH.md, раздел 6в).'
                    )
              }
            />
            <Row ok={health.quotaEnforced} title={tr('Account deletion', 'Удаление аккаунта')} ok_text={tr('Students can delete their account and data.', 'Ученики могут удалить аккаунт и данные.')} off_text={needKey} />
          </ul>

          <div className="p-5 rounded-2xl border border-[var(--border)] space-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">{tr('Cannot be detected from here', 'Отсюда не определить')}</h2>
            <ul className="list-disc pl-5 text-sm text-[var(--muted)] leading-relaxed space-y-1">
              <li>{tr('firestore.rules published in the Firebase console (after the keys above are set).', 'Правила firestore.rules опубликованы в консоли Firebase (после того как заданы ключи выше).')}</li>
              <li>{tr('Firestore index: Indexes → Single field → collection group "comments", field "userId" (needed to delete a student’s comments under other posts).', 'Индекс Firestore: Indexes → Single field → collection group «comments», поле «userId» (нужен, чтобы удалять комментарии ученика под чужими постами).')}</li>
              <li>{tr('One manual test on test accounts: parent link, teacher approval and class join, account deletion. Steps are in docs/LAUNCH.md.', 'Один ручной прогон на тестовых аккаунтах: подключение родителя, одобрение учителя и вступление в класс, удаление аккаунта. Шаги в docs/LAUNCH.md.')}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
