import React, { useCallback, useEffect, useState } from 'react';
import { Users, Flame, Trophy, CheckCircle2, Loader2, UserPlus, ShieldCheck, TrendingUp, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import { fetchChildren, linkChild, unlinkFamily, familyErrorText, type ChildSummary } from '../../services/family';
import { DigestToggle } from '../Family/DigestToggle';
import { track } from '../../lib/analytics';
import { GRADE_LABEL, GOAL_LABEL, type Grade, type Goal } from '../../lib/profileOptions';

export const PARENT_MODE_KEY = 'tf_parent_mode';

// Each child gets a stable avatar colour (class names written out in full for Tailwind).
const AVATAR_COLORS = [
  'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
  'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
  'from-amber-400 to-orange-500 shadow-amber-500/30',
  'from-rose-400 to-pink-600 shadow-rose-500/30',
  'from-cyan-400 to-sky-600 shadow-cyan-500/30',
  'from-purple-400 to-fuchsia-600 shadow-purple-500/30',
  'from-teal-400 to-teal-600 shadow-teal-500/30',
] as const;
const avatarColor = (name: string) => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const dayDiff = (isoDay: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return Math.round((Date.parse(today) - Date.parse(isoDay)) / 86_400_000);
};

export const Family: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';

  const [children, setChildren] = useState<ChildSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linked, setLinked] = useState(false);
  const [removing, setRemoving] = useState<ChildSummary | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchChildren();
      setChildren(list);
      setLoadError(null);
      try {
        if (list.length > 0) localStorage.setItem(PARENT_MODE_KEY, '1');
      } catch {
        /* the sidebar shortcut just will not appear */
      }
    } catch (e) {
      setChildren([]);
      setLoadError(familyErrorText(e, tr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || linking) return;
    setLinking(true);
    setLinkError(null);
    setLinked(false);
    try {
      await linkChild(code);
      track('parent_linked');
      setCode('');
      setLinked(true);
      await load();
    } catch (err) {
      setLinkError(familyErrorText(err, tr));
    } finally {
      setLinking(false);
    }
  };

  const lastActive = (c: ChildSummary) => {
    if (!c.lastActiveDate) return tr('No activity yet', 'Пока нет активности', "Hali faollik yo'q");
    const d = dayDiff(c.lastActiveDate);
    if (d <= 0) return tr('Active today', 'Занимался сегодня', 'Bugun shug‘ullangan');
    if (d === 1) return tr('Last active yesterday', 'Последний раз вчера', 'Oxirgi marta kecha');
    return tr(`Last active ${d} days ago`, `Последний раз ${d} дн. назад`, `Oxirgi marta ${d} kun oldin`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Parent cabinet', 'Кабинет родителя', 'Ota-ona kabineti')}</h1>
          <p className="text-[var(--muted)] font-medium mt-2 max-w-2xl">
            {tr(
              "Follow your child's progress. You only see what they chose to share with a code.",
              'Следите за прогрессом ребёнка. Вы видите только то, чем он поделился с помощью кода.',
              "Farzandingiz progressini kuzating. Faqat u kod orqali ulashgan narsani ko'rasiz."
            )}
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 shadow-xl shadow-rose-500/30 rounded-[1.5rem] items-center justify-center text-white shrink-0" aria-hidden="true">
          <Users className="w-8 h-8" aria-hidden="true" />
        </div>
      </div>

      <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-4">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />
        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-rose-500 pt-1">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
            <UserPlus className="w-4 h-4" aria-hidden="true" />
          </span>
          {tr('Connect a child', 'Подключить ребёнка', "Farzandni ulash")}
        </h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {tr(
            'Ask your child to open Settings → Parent access and create a code. Enter it here. The code works once and expires in 24 hours.',
            'Попросите ребёнка открыть Настройки → Доступ для родителей и создать код. Введите его здесь. Код работает один раз и действует 24 часа.',
            "Farzandingizdan Sozlamalar → Ota-ona uchun kirish bo'limida kod yaratishni so'rang. Uni shu yerga kiriting. Kod bir marta ishlaydi va 24 soat amal qiladi."
          )}
        </p>
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="family-code" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">
            {tr("Child's code", 'Код ребёнка', 'Farzand kodi')}
          </label>
          <div className="flex gap-2">
            <input
              id="family-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD2345"
              className="flex-1 min-w-0 h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm font-mono tracking-[0.2em] text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-[var(--muted)] placeholder:opacity-50"
            />
            <Button type="submit" disabled={!code.trim() || linking} className="h-12 px-6 rounded-2xl shrink-0 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25">
              {linking ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <span className="font-black uppercase text-xs tracking-wider">{tr('Connect', 'Подключить', 'Ulash')}</span>}
            </Button>
          </div>
          <div role="status" aria-live="polite">
            {linkError && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{linkError}</p>}
            {linked && <p className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-in fade-in zoom-in-95 duration-300">{tr('Connected! Your child is now in the list below.', 'Готово! Ребёнок появился в списке ниже.', "Tayyor! Farzandingiz quyidagi ro'yxatda.")}</p>}
          </div>
        </form>
      </Card>

      {children !== null && children.length > 0 && <DigestToggle />}

      {children === null ? (
        <div className="py-10 flex justify-center" role="status" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')}>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : loadError && children.length === 0 ? (
        <p role="alert" className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-semibold">{loadError}</p>
      ) : children.length === 0 ? (
        <div className="py-12 px-6 text-center rounded-[2rem] border border-dashed border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/30 motion-safe:animate-bounce" aria-hidden="true">
            <Users className="w-8 h-8" />
          </div>
          <p className="font-black text-[var(--text)]">{tr('No children connected yet', 'Дети ещё не подключены', "Hali farzandlar ulanmagan")}</p>
          <p className="text-sm text-[var(--muted)] mt-1">{tr('Enter a code above to see progress.', 'Введите код выше, чтобы увидеть прогресс.', "Progressni ko'rish uchun yuqorida kodni kiriting.")}</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {children.map((c) => {
            const activeDays = c.week.filter((d) => d.active).length;
            const grade = c.grade ? (GRADE_LABEL[language]?.[c.grade as Grade] ?? c.grade) : '';
            const goal = c.goal ? (GOAL_LABEL[language]?.[c.goal as Goal] ?? '') : '';
            const stats = [
              { icon: TrendingUp, label: tr('Level', 'Уровень', 'Daraja'), value: c.level, tile: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30' },
              { icon: Trophy, label: 'XP', value: c.xp, tile: 'from-amber-400 to-orange-500 shadow-amber-500/30' },
              { icon: Flame, label: tr('Streak, days', 'Серия, дней', 'Seriya, kun'), value: `${c.streakDays} (${tr('best', 'рекорд', 'rekord')} ${c.longestStreak})`, tile: 'from-rose-400 to-pink-600 shadow-rose-500/30' },
              { icon: CheckCircle2, label: tr('Tasks done', 'Заданий выполнено', 'Bajarilgan vazifalar'), value: c.tasksCompleted, tile: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
              { icon: GraduationCap, label: tr('Lessons done', 'Уроков пройдено', 'Tugagan darslar'), value: c.lessonsCompleted, tile: 'from-purple-400 to-fuchsia-600 shadow-purple-500/30' },
            ];
            return (
              <li key={c.childUid}>
                <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-6 transition-all hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-500/30">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-14 h-14 bg-gradient-to-br shadow-lg rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 ${avatarColor(c.name || '?')}`} aria-hidden="true">
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-black text-[var(--text)] truncate">{c.name || tr('Student', 'Ученик', "O'quvchi")}</h2>
                        <p className="text-sm text-[var(--muted)] truncate">{[grade, goal].filter(Boolean).join(' · ') || lastActive(c)}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setRemoving(c)} className="h-11 px-4 rounded-xl shrink-0">
                      <span className="font-black uppercase text-xs tracking-wider">{tr('Disconnect', 'Отключить', 'Uzish')}</span>
                    </Button>
                  </div>

                  <dl className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {stats.map((s) => (
                      <div key={s.label} className="p-4 rounded-2xl bg-[var(--input)] space-y-2">
                        <span className={`w-9 h-9 rounded-xl bg-gradient-to-br shadow-md flex items-center justify-center text-white ${s.tile}`} aria-hidden="true">
                          <s.icon className="w-4 h-4" />
                        </span>
                        <dt className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] leading-tight">{s.label}</dt>
                        <dd className="text-xl font-black tabular-nums text-[var(--text)] leading-tight">{s.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Last 7 days', 'Последние 7 дней', "So'nggi 7 kun")}</h3>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-sm font-bold text-[var(--text)]">
                        {tr(`Studied ${activeDays} of 7 days`, `Занимался ${activeDays} из 7 дней`, `7 kunning ${activeDays} tasida shug'ullangan`)}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2" role="img" aria-label={tr(`Studied ${activeDays} of the last 7 days`, `Занимался ${activeDays} из последних 7 дней`, `So'nggi 7 kunning ${activeDays} tasida shug'ullangan`)}>
                      {c.week.map((d) => (
                        <div key={d.date} className="flex flex-col items-center gap-1.5">
                          <div className={`w-full h-10 rounded-xl ${d.active ? 'bg-gradient-to-b from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25' : 'bg-[var(--input)]'}`} />
                          <span className="text-xs text-[var(--muted)]">
                            {new Date(`${d.date}T00:00:00Z`).toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--muted)]">{lastActive(c)}</p>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-start gap-2 text-xs text-[var(--muted)] leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        {tr(
          'You see name, grade, goal, XP, level, streaks, finished tasks, finished lessons and study days. You never see messages, posts, AI chats or email. Your child can remove your access at any time.',
          'Вы видите имя, класс, цель, XP, уровень, серии, выполненные задания, пройденные уроки и дни занятий. Сообщения, посты, чаты с ИИ и почта вам недоступны. Ребёнок может отозвать доступ в любой момент.',
          "Siz ism, sinf, maqsad, XP, daraja, seriyalar, bajarilgan vazifalar va o'qish kunlarini ko'rasiz. Xabarlar, postlar, AI suhbatlari va pochta ko'rinmaydi. Farzandingiz kirishni istalgan vaqtda bekor qila oladi."
        )}
      </p>

      {removing && user && (
        <ConfirmDialog
          title={tr('Disconnect this child?', 'Отключить ребёнка?', 'Farzandni uzasizmi?')}
          text={tr(`You will stop seeing ${removing.name || 'their'} progress. A new code is needed to connect again.`, `Вы перестанете видеть прогресс (${removing.name || 'ребёнка'}). Чтобы подключиться снова, нужен новый код.`, `Progressni ko'rmaysiz. Qayta ulash uchun yangi kod kerak.`)}
          confirmLabel={tr('Disconnect', 'Отключить', 'Uzish')}
          danger
          onConfirm={async () => {
            await unlinkFamily(removing.childUid, user.uid);
            await load();
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
};
