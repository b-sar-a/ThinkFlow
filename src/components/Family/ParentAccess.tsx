import React, { useEffect, useState } from 'react';
import { Users, Copy, Check, Loader2, KeyRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import { createFamilyCode, fetchParents, unlinkFamily, familyErrorText, type LinkedParent } from '../../services/family';

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
    <Card className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Users className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{tr('Parent access', 'Доступ для родителей', "Ota-ona uchun kirish")}</h2>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        {tr(
          'Give your parent a code and they can follow your progress: XP, level, streak, finished tasks and the days you studied. They cannot see your messages, posts or AI chats. You can remove access at any time.',
          'Дайте родителю код, и он сможет следить за вашим прогрессом: XP, уровень, серия, выполненные задания и дни занятий. Сообщения, посты и чаты с ИИ ему не видны. Доступ можно отозвать в любой момент.',
          "Ota-onangizga kod bering, ular progressingizni kuzata oladi: XP, daraja, seriya, bajarilgan vazifalar va o'qigan kunlaringiz. Xabarlar, postlar va AI suhbatlarini ko'ra olmaydi. Kirishni istalgan vaqtda bekor qilishingiz mumkin."
        )}
      </p>

      {code ? (
        <div className="p-5 rounded-2xl bg-[var(--input)] border border-[var(--border)] space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Your code', 'Ваш код', 'Sizning kodingiz')}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-2xl md:text-3xl font-black tracking-[0.25em] text-[var(--text)] select-all">{code.code}</span>
            <Button onClick={copy} aria-label={tr('Copy code', 'Скопировать код', 'Kodni nusxalash')} className="h-12 w-12 p-0 rounded-2xl bg-indigo-600 hover:bg-indigo-500 border-none shrink-0">
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            </Button>
          </div>
          <p className="text-xs text-[var(--muted)]">
            {tr(`Works once, valid for about ${hours} hours.`, `Работает один раз, действует около ${hours} ч.`, `Bir marta ishlaydi, taxminan ${hours} soat amal qiladi.`)}
          </p>
        </div>
      ) : (
        <Button onClick={createCode} disabled={busy} className="h-12 px-6 rounded-2xl gap-2">
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
              <li key={p.parentUid} className="flex items-center justify-between gap-4">
                <span className="font-bold text-[var(--text)] truncate">{p.name || tr('Parent', 'Родитель', 'Ota-ona')}</span>
                <Button variant="outline" onClick={() => setRemoving(p)} className="h-11 px-5 rounded-xl shrink-0">
                  <span className="font-black uppercase text-xs tracking-wider">{tr('Remove access', 'Отозвать доступ', 'Kirishni bekor qilish')}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{tr('Nobody has access yet.', 'Пока доступа нет ни у кого.', "Hozircha hech kimda kirish yo'q.")}</p>
      )}

      {onNavigate && (
        <button type="button" onClick={() => onNavigate('family')} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors h-11">
          {tr("I'm a parent: open the parent cabinet", 'Я родитель: открыть кабинет родителя', "Men ota-onaman: kabinetni ochish")}
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
