import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { REPORT_REASONS, type ReportReason } from '../../lib/safety';

const useText = () => {
  const { language } = useLanguage();
  return (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
};

/** Dark neon overlay used by both dialogs; Esc and a click outside close it. */
const Overlay: React.FC<{ onClose: () => void; labelledBy: string; children: React.ReactNode }> = ({ onClose, labelledBy, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  title: string;
  text?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}> = ({ title, text, confirmLabel, danger, onConfirm, onClose }) => {
  const tr = useText();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const run = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await onConfirm();
      onClose();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };
  return (
    <Overlay onClose={onClose} labelledBy="confirm-title">
      <h2 id="confirm-title" className="text-xl font-black uppercase tracking-tight text-[var(--text)]">{title}</h2>
      {text && <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{text}</p>}
      {failed && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {tr('Something went wrong. Try again.', 'Не получилось. Попробуй ещё раз.', 'Muvaffaqiyatsiz. Qayta urinib ko‘ring.')}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
        <button type="button" onClick={onClose} disabled={busy} className="h-12 flex-1 rounded-2xl border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text)] hover:bg-[var(--input)] transition-colors">
          {tr('Cancel', 'Отмена', 'Bekor qilish')}
        </button>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className={`h-12 flex-1 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-colors flex items-center justify-center gap-2 ${danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </div>
    </Overlay>
  );
};

/** Shown before a text with contact details or a password is posted or sent. */
export const PersonalDataDialog: React.FC<{ onSend: () => void; onClose: () => void }> = ({ onSend, onClose }) => {
  const tr = useText();
  return (
    <ConfirmDialog
      title={tr('Share contact details?', 'Поделиться контактами?', "Aloqa ma'lumotlarini yuborasizmi?")}
      text={tr(
        'Your text looks like it has a phone number, an email, a social media name or a password. Do not share these with people you do not know in real life. Send it anyway?',
        'В твоём тексте похоже есть номер телефона, почта, ник в соцсети или пароль. Не делись этим с людьми, которых не знаешь в жизни. Всё равно отправить?',
        "Matningizda telefon raqami, pochta, ijtimoiy tarmoq nomi yoki parol bor ko'rinadi. Hayotda tanimaydigan odamlarga buni bermang. Baribir yuborasizmi?"
      )}
      confirmLabel={tr('Send anyway', 'Всё равно отправить', 'Baribir yuborish')}
      danger
      onConfirm={onSend}
      onClose={onClose}
    />
  );
};

export const ReportDialog: React.FC<{
  subject: string;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
  onClose: () => void;
}> = ({ subject, onSubmit, onClose }) => {
  const tr = useText();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'form' | 'sent' | 'failed'>('form');

  const LABEL: Record<ReportReason, string> = {
    spam: tr('Spam or ads', 'Спам или реклама', 'Spam yoki reklama'),
    bullying: tr('Insults or bullying', 'Оскорбления или травля', 'Haqorat yoki bezorilik'),
    personal_data: tr('Personal information', 'Личные данные', 'Shaxsiy ma’lumotlar'),
    inappropriate: tr('Inappropriate content', 'Неприемлемое содержимое', 'Nomaqbul kontent'),
    other: tr('Something else', 'Другое', 'Boshqa'),
  };

  const send = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await onSubmit(reason, details.trim());
      setState('sent');
    } catch {
      setState('failed');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'sent') {
    return (
      <Overlay onClose={onClose} labelledBy="report-title">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" aria-hidden="true" />
          <h2 id="report-title" className="text-xl font-black uppercase tracking-tight text-[var(--text)]">{tr('Thank you', 'Спасибо', 'Rahmat')}</h2>
          <p className="text-sm text-[var(--muted)]">{tr('We will look at it. You can also block this person so you stop seeing them.', 'Мы посмотрим. Ты также можешь заблокировать этого человека, чтобы больше его не видеть.', 'Biz ko‘rib chiqamiz. Uni ko‘rmaslik uchun bloklashingiz ham mumkin.')}</p>
          <button type="button" onClick={onClose} className="h-12 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-colors">OK</button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose} labelledBy="report-title">
      <h2 id="report-title" className="text-xl font-black uppercase tracking-tight text-[var(--text)]">{tr('Report', 'Пожаловаться', 'Shikoyat qilish')}</h2>
      <p className="mt-1 text-sm text-[var(--muted)] truncate">{subject}</p>

      <fieldset className="mt-5 space-y-2">
        <legend className="mb-2 text-xs font-black uppercase tracking-widest text-[var(--muted)]">{tr('What is wrong?', 'Что не так?', 'Nima noto‘g‘ri?')}</legend>
        {REPORT_REASONS.map((r) => (
          <label key={r} className={`flex items-center gap-3 min-h-12 px-4 rounded-2xl border cursor-pointer transition-colors ${reason === r ? 'border-indigo-500 bg-indigo-600/10' : 'border-[var(--border)] hover:bg-[var(--input)]'}`}>
            <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-sm font-bold text-[var(--text)]">{LABEL[r]}</span>
          </label>
        ))}
      </fieldset>

      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{tr('Details (optional)', 'Подробности (по желанию)', 'Tafsilotlar (ixtiyoriy)')}</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
          rows={3}
          className="mt-2 w-full resize-none rounded-2xl bg-[var(--input)] border border-[var(--border)] p-4 text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition-colors"
        />
      </label>

      {state === 'failed' && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm font-bold text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {tr('Could not send the report. Try again later.', 'Не удалось отправить жалобу. Попробуй позже.', 'Shikoyatni yuborib bo‘lmadi. Keyinroq urinib ko‘ring.')}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
        <button type="button" onClick={onClose} className="h-12 flex-1 rounded-2xl border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text)] hover:bg-[var(--input)] transition-colors">
          {tr('Cancel', 'Отмена', 'Bekor qilish')}
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!reason || busy}
          className="h-12 flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest text-white transition-colors flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {tr('Send report', 'Отправить жалобу', 'Yuborish')}
        </button>
      </div>
    </Overlay>
  );
};

/** A "…" button that opens a short list of actions (report, block, delete). */
export const ContentMenu: React.FC<{
  label: string;
  items: { label: string; onClick: () => void; danger?: boolean }[];
}> = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--input)] transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 min-w-52 p-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl z-30">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-[var(--input)] ${item.danger ? 'text-rose-500' : 'text-[var(--text)]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
