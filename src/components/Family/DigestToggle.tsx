import React, { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { fetchDigest, setDigest, familyErrorText, type DigestState } from '../../services/family';

/** Parent cabinet: turn the weekly email summary on or off. */
export const DigestToggle: React.FC = () => {
  const { language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const [state, setState] = useState<DigestState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchDigest()
      .then((s) => alive && setState(s))
      .catch((e) => alive && setError(familyErrorText(e, tr)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    if (!state || busy) return;
    setBusy(true);
    setError(null);
    try {
      setState(await setDigest(!state.enabled, language));
    } catch (e) {
      setError(familyErrorText(e, tr));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 md:p-6 rounded-[2rem] border border-[var(--border)]">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p id="digest-label" className="font-black text-[var(--text)]">{tr('Weekly summary by email', 'Недельная сводка на почту', "Haftalik xulosa pochtaga")}</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {state && !state.available
              ? tr(
                  'Email delivery is being set up. Your choice is saved, and the emails start as soon as it is ready.',
                  'Отправка писем ещё настраивается. Ваш выбор сохраняется, письма начнут приходить, как только всё будет готово.',
                  "Xatlar yuborish hali sozlanmoqda. Tanlovingiz saqlanadi, tayyor bo'lishi bilan xatlar kela boshlaydi."
                )
              : tr(
                  'Once a week: active days, finished lessons, level and streak of each child. Sent only to a verified email address; every email has a one-click unsubscribe.',
                  'Раз в неделю: активные дни, пройденные уроки, уровень и серия каждого ребёнка. Письма идут только на подтверждённую почту; в каждом есть отписка в один клик.',
                  "Haftada bir marta: har bir farzandning faol kunlari, tugatilgan darslari, darajasi va seriyasi. Xatlar faqat tasdiqlangan pochtaga yuboriladi; har bir xatda bir bosishda obunani bekor qilish bor."
                )}
          </p>
        </div>
        {state === null && !error ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500 shrink-0" aria-hidden="true" />
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={state?.enabled ?? false}
            aria-labelledby="digest-label"
            disabled={!state || busy}
            onClick={toggle}
            className={`relative w-14 h-8 rounded-full shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60 ${state?.enabled ? 'bg-indigo-600' : 'bg-[var(--input)] border border-[var(--border)]'}`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${state?.enabled ? 'translate-x-6' : ''}`} />
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}
    </Card>
  );
};
