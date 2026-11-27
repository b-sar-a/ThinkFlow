import React, { useEffect, useState } from 'react';
import { Users, Copy, Check, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import { ClassAccess } from './ClassAccess';
import { createFamilyCode, fetchParents, unlinkFamily, familyErrorText, type LinkedParent } from '../../services/family';

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

interface Props {
  onNavigate?: (view: string) => void;
}

/** Settings card, student side: create a code for a parent and manage who has access. */
export const ParentAccess: React.FC<Props> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const [parents, setParents] = useState<LinkedParent[] | null>(null);
  const [code, setCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState<LinkedParent | null>(null);

  const load = () =>
    fetchParents()
      .then((p) => {
        setParents(p);
        setError(null);
      })
      .catch((e) => {
        setParents([]);
        setError(familyErrorText(e, tr));
      });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCode = async () => {
    setBusy(true);
    setError(null);
    try {
      setCode(await createFamilyCode());
    } catch (e) {
      setError(familyErrorText(e, tr));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Ctrl+C', code.code);
    }
  };

  const hours = code ? Math.max(1, Math.round((code.expiresAt - Date.now()) / 3_600_000)) : 24;

  return (
    <Card className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />
      <div className="flex items-center gap-3 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg shadow-rose-500/30 flex items-center justify-center text-white shrink-0">
          <Users className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500">{tr('Parents and teachers', 'Родители и учителя', "Ota-ona va o'qituvchilar")}</h2>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        {tr(
          'Give your parent a code and they can follow your progress: XP, level, streak, finished tasks and the days you studied. They cannot see your messages, posts or AI chats. You can remove access at any time.',
          'Дайте родителю код, и он сможет следить за вашим прогрессом: XP, уровень, серия, выполненные задания и дни занятий. Сообщения, посты и чаты с ИИ ему не видны. Доступ можно отозвать в любой момент.',
          "Ota-onangizga kod bering, ular progressingizni kuzata oladi: XP, daraja, seriya, bajarilgan vazifalar va o'qigan kunlaringiz. Xabarlar, postlar va AI suhbatlarini ko'ra olmaydi. Kirishni istalgan vaqtda bekor qilishingiz mumkin."
        )}
      </p>

      {code ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Your code', 'Ваш код', 'Sizning kodingiz')}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-2xl md:text-3xl font-black tracking-[0.25em] text-[var(--text)] select-all">{code.code}</span>
            <Button onClick={copy} aria-label={tr('Copy code', 'Скопировать код', 'Kodni nusxalash')} className={`h-12 w-12 p-0 rounded-2xl border-none shrink-0 shadow-lg transition-all motion-safe:active:scale-95 ${copied ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'}`}>
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            </Button>
          </div>
          <p className="text-xs text-[var(--muted)]">
            {tr(`Works once, valid for about ${hours} hours.`, `Работает один раз, действует около ${hours} ч.`, `Bir marta ishlaydi, taxminan ${hours} soat amal qiladi.`)}
          </p>
        </div>
      ) : (
        <Button onClick={createCode} disabled={busy} className="h-12 px-6 rounded-2xl gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <KeyRound className="w-4 h-4" aria-hidden="true" />}
          <span className="font-black uppercase text-xs tracking-wider">{tr('Create a code', 'Создать код', 'Kod yaratish')}</span>
        </Button>
      )}

      <div role="status" aria-live="polite">
        {error && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}
      </div>

      {parents === null ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')} />
      ) : parents.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Who has access', 'Кто имеет доступ', 'Kimda kirish bor')}</h3>
          <ul className="space-y-3">
            {parents.map((p) => (
              <li key={p.parentUid} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--input)]">
                <span className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center font-black text-white ${avatarColor(p.name || 'P')}`} aria-hidden="true">
                    {(p.name || 'P')[0].toUpperCase()}
                  </span>
                  <span className="font-bold text-[var(--text)] truncate">{p.name || tr('Parent', 'Родитель', 'Ota-ona')}</span>
                </span>
                <Button variant="outline" onClick={() => setRemoving(p)} className="h-11 px-5 rounded-xl shrink-0">
                  <span className="font-black uppercase text-xs tracking-wider">{tr('Remove access', 'Отозвать доступ', 'Kirishni bekor qilish')}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="inline-block px-3 py-1.5 rounded-full bg-[var(--input)] text-sm font-bold text-[var(--muted)]">{tr('Nobody has access yet.', 'Пока доступа нет ни у кого.', "Hozircha hech kimda kirish yo'q.")}</p>
      )}

      <ClassAccess />

      {onNavigate && (
        <button type="button" onClick={() => onNavigate('family')} className="group flex items-center justify-between gap-3 w-full sm:w-auto text-sm font-bold text-rose-500 hover:bg-rose-500/10 bg-rose-500/5 px-4 rounded-xl transition-colors h-11">
          {tr("I'm a parent: open the parent cabinet", 'Я родитель: открыть кабинет родителя', "Men ota-onaman: kabinetni ochish")}
          <ArrowRight className="w-4 h-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
        </button>
      )}

      {onNavigate && (
        <button type="button" onClick={() => onNavigate('teacher')} className="group flex items-center justify-between gap-3 w-full sm:w-auto text-sm font-bold text-emerald-500 hover:bg-emerald-500/10 bg-emerald-500/5 px-4 rounded-xl transition-colors h-11">
          {tr("I'm a teacher: open the teacher cabinet", 'Я учитель: открыть кабинет учителя', "Men o'qituvchiman: kabinetni ochish")}
          <ArrowRight className="w-4 h-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
        </button>
      )}

      {removing && user && (
        <ConfirmDialog
          title={tr('Remove access?', 'Отозвать доступ?', 'Kirishni bekor qilasizmi?')}
          text={tr(`${removing.name || 'This parent'} will no longer see your progress.`, `${removing.name || 'Этот родитель'} больше не будет видеть ваш прогресс.`, `${removing.name || 'Bu ota-ona'} endi progressingizni ko'rmaydi.`)}
          confirmLabel={tr('Remove', 'Отозвать', 'Bekor qilish')}
          danger
          onConfirm={async () => {
            await unlinkFamily(user.uid, removing.parentUid);
            await load();
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </Card>
  );
};
