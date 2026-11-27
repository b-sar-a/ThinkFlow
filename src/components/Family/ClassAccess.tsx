import React, { useEffect, useState } from 'react';
import { Loader2, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import { fetchMyClasses, joinClass, leaveClass, classErrorText, type MyClass } from '../../services/classes';

// Each person gets a stable avatar colour (class names written out in full for Tailwind).
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

/** Student side of the teacher cabinet: join a class with its code, see classes, leave any time. */
export const ClassAccess: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const [classes, setClasses] = useState<MyClass[] | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<MyClass | null>(null);

  const load = () =>
    fetchMyClasses()
      .then((c) => setClasses(c))
      .catch((e) => {
        setClasses([]);
        setError(classErrorText(e, tr));
      });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    setJoined(null);
    try {
      const result = await joinClass(code);
      setJoined(result.name);
      setCode('');
      await load();
    } catch (err) {
      setError(classErrorText(err, tr));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-[var(--border)]">
      <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-emerald-500 pt-4">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
          <GraduationCap className="w-4 h-4" aria-hidden="true" />
        </span>
        {tr('Teacher’s class', 'Класс учителя', "O'qituvchi sinfi")}
      </h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        {tr(
          'If your teacher gave you a class code, enter it. The teacher will see your progress (not your messages or chats). You can leave at any time.',
          'Если учитель дал вам код класса, введите его. Учитель увидит ваш прогресс (но не сообщения и не чаты). Выйти можно в любой момент.',
          "Agar o'qituvchi sizga sinf kodini bergan bo'lsa, uni kiriting. O'qituvchi progressingizni ko'radi (xabarlar va suhbatlarni emas). Istalgan vaqtda chiqishingiz mumkin."
        )}
      </p>

      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="class-code" className="sr-only">{tr('Class code', 'Код класса', 'Sinf kodi')}</label>
        <input
          id="class-code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD2345"
          className="flex-1 min-w-0 h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm font-mono tracking-[0.2em] text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-[var(--muted)] placeholder:opacity-50"
        />
        <Button type="submit" disabled={!code.trim() || busy} className="h-12 px-5 rounded-2xl shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <span className="font-black uppercase text-xs tracking-wider">{tr('Join', 'Вступить', "Qo'shilish")}</span>}
        </Button>
      </form>

      <div role="status" aria-live="polite">
        {error && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}
        {joined && <p className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-in fade-in zoom-in-95 duration-300">{tr(`You joined “${joined}”.`, `Вы вступили в «${joined}».`, `Siz «${joined}» sinfiga qo'shildingiz.`)}</p>}
      </div>

      {classes === null ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')} />
      ) : classes.length > 0 ? (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li key={c.classId} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--input)]">
              <span className="flex items-center gap-3 min-w-0">
                <span className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center font-black text-white ${avatarColor(c.name || 'C')}`} aria-hidden="true">
                  {(c.name || 'C')[0].toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[var(--text)] truncate">{c.name}</span>
                  <span className="block text-xs text-[var(--muted)] truncate">{c.teacherName || tr('Teacher', 'Учитель', "O'qituvchi")}</span>
                </span>
              </span>
              <Button variant="outline" onClick={() => setLeaving(c)} className="h-11 px-5 rounded-xl shrink-0">
                <span className="font-black uppercase text-xs tracking-wider">{tr('Leave', 'Выйти', 'Chiqish')}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {leaving && user && (
        <ConfirmDialog
          title={tr('Leave this class?', 'Выйти из класса?', 'Sinfdan chiqasizmi?')}
          text={tr(`${leaving.teacherName || 'The teacher'} will no longer see your progress.`, `${leaving.teacherName || 'Учитель'} больше не будет видеть ваш прогресс.`, `${leaving.teacherName || "O'qituvchi"} endi progressingizni ko'rmaydi.`)}
          confirmLabel={tr('Leave', 'Выйти', 'Chiqish')}
          danger
          onConfirm={async () => {
            await leaveClass(leaving.classId, user.uid);
            await load();
          }}
          onClose={() => setLeaving(null)}
        />
      )}
    </div>
  );
};
