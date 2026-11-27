import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, Zap, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { authedPost } from '../../services/http';

const LAUNCH_CODES = ['STARTAI', 'LEARNFLOW'];
const MAX_REWARDED_INVITES = 20;
const BONUS = 1000;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API can be blocked (insecure context, iframe): let the user copy by hand.
    window.prompt('Ctrl+C', text);
    return false;
  }
}

export const PromoHub: React.FC = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [copied, setCopied] = useState<'link' | 'text' | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCode.trim().toUpperCase();
    if (!code || !profile || isApplying) return;

    setIsApplying(true);
    try {
      const { added } = await authedPost<{ added: number }>('/api/promo/redeem', { code });
      const amount = added.toLocaleString();
      setPromoSuccess(tr(
        `Code applied! +${amount} AI tokens added to your quota.`,
        `Промокод активирован! +${amount} токенов ИИ добавлено к квоте.`,
        `Promo kod faollashtirildi! Kvotangizga +${amount} AI token qo'shildi.`
      ));
      setPromoCode('');
    } catch (err: any) {
      const reason = String(err?.message || '');
      if (reason === 'ALREADY_CLAIMED') {
        setPromoError(tr('You have already used this code.', 'Вы уже активировали этот промокод.', 'Bu promo kod allaqachon ishlatilgan.'));
      } else if (reason === 'INVALID_CODE') {
        setPromoError(tr('Invalid code, or it has expired.', 'Неверный промокод или срок действия истёк.', "Promo kod noto'g'ri yoki muddati tugagan."));
      } else if (reason === 'PROMO_UNAVAILABLE') {
        setPromoError(tr('Promo codes are temporarily unavailable.', 'Промокоды временно недоступны.', 'Promo kodlar vaqtincha mavjud emas.'));
      } else {
        setPromoError(tr('Could not apply the code. Try again.', 'Не удалось активировать код. Попробуйте ещё раз.', "Kodni faollashtirib bo'lmadi. Qayta urinib ko'ring."));
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Invite code = first 8 characters of the user id; the server credits both sides once.
  const referralUrl = `${window.location.origin}/?ref=${profile?.uid?.slice(0, 8) ?? ''}`;
  const invited = profile?.referralCount ?? 0;
  const shareText = tr(
    `Learn with ThinkFlow AI! Join with my link and get +${BONUS.toLocaleString()} AI tokens: ${referralUrl}`,
    `Учусь с ИИ-помощником ThinkFlow! Зарегистрируйся по моей ссылке и получи +${BONUS.toLocaleString()} токенов ИИ: ${referralUrl}`,
    `ThinkFlow AI bilan o'rganaman! Mening havolam orqali qo'shil va +${BONUS.toLocaleString()} AI token ol: ${referralUrl}`
  );
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const flash = (what: 'link' | 'text') => {
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = async () => {
    if (await copyText(referralUrl)) flash('link');
  };
  const copyMessage = async () => {
    if (await copyText(shareText)) flash('text');
  };
  const share = async () => {
    try {
      await navigator.share({ title: 'ThinkFlow', text: shareText });
    } catch {
      /* the person closed the share sheet */
    }
  };

  const progressPct = Math.min(100, (invited / MAX_REWARDED_INVITES) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div className="p-6 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-[var(--card)] border border-indigo-500/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-[2.25rem] bg-gradient-to-br from-amber-400 via-orange-500 to-pink-600 text-white items-center justify-center shadow-2xl shadow-orange-500/30 rotate-6 z-10 motion-safe:animate-bounce" aria-hidden="true">
          <Gift className="w-16 h-16" />
        </div>

        <div className="max-w-3xl space-y-4 relative z-10 md:pr-40">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-pink-500/20 border border-amber-400/30 text-amber-500 text-xs font-black uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" />
            {tr('Bonuses', 'Бонусы', 'Bonuslar')}
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)] italic leading-tight">
            {tr('Invite friends, get ', 'Зови друзей, получай ', "Do'stlarni taklif qil, ")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 font-black pr-2 box-decoration-clone">
              {tr('more AI tokens', 'больше токенов ИИ', 'ko‘proq AI token ol')}
            </span>
          </h1>

          <p className="text-sm md:text-base text-[var(--muted)] font-medium max-w-2xl leading-relaxed">
            {tr(
              'Tokens are your daily AI quota. Invite a friend or enter a launch code to get more.',
              'Токены — это ваша квота ИИ. Пригласите друга или введите стартовый код, чтобы получить больше.',
              "Tokenlar — sizning AI kvotangiz. Do'stingizni taklif qiling yoki start kodini kiriting."
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Card className="p-6 md:p-8 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white shrink-0">
              <Share2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-black text-[var(--text)] uppercase tracking-tight text-base leading-tight">
                {tr('Invite friends', 'Пригласить друзей', "Do'stlarni taklif qilish")}
              </h2>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-xs text-amber-500 font-black uppercase tracking-wider">
                {tr(`+${BONUS.toLocaleString()} tokens for you and your friend`, `+${BONUS.toLocaleString()} токенов вам и другу`, `+${BONUS.toLocaleString()} token sizga va do'stingizga`)}
              </span>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)] leading-relaxed relative">
            {tr(
              `When a friend signs up with your link, you both get +${BONUS.toLocaleString()} tokens. The friend must be a new user. The first ${MAX_REWARDED_INVITES} invites pay out.`,
              `Когда друг регистрируется по вашей ссылке, вы оба получаете +${BONUS.toLocaleString()} токенов. Друг должен быть новым пользователем. Награда выплачивается за первые ${MAX_REWARDED_INVITES} приглашений.`,
              `Do'stingiz havolangiz orqali ro'yxatdan o'tsa, ikkalangiz +${BONUS.toLocaleString()} token olasiz. Do'st yangi foydalanuvchi bo'lishi kerak. Birinchi ${MAX_REWARDED_INVITES} ta taklif uchun mukofot beriladi.`
            )}
          </p>

          <div className="space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {tr('Friends joined', 'Присоединилось друзей', "Qo'shilgan do'stlar")}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-[var(--text)] tabular-nums">{invited} / {MAX_REWARDED_INVITES}</span>
            </div>
            <div
              className="h-3 rounded-full bg-[var(--input)] overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MAX_REWARDED_INVITES}
              aria-valuenow={Math.min(invited, MAX_REWARDED_INVITES)}
              aria-label={tr('Friends joined', 'Присоединилось друзей', "Qo'shilgan do'stlar")}
            >
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="invite-url" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">
              {tr('Your invite link', 'Ваша ссылка-приглашение', 'Sizning taklif havolangiz')}
            </label>
            <div className="flex gap-2">
              <input
                id="invite-url"
                type="text"
                readOnly
                value={referralUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 px-4 h-12 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
              <Button
                onClick={copyLink}
                aria-label={tr('Copy link', 'Скопировать ссылку', 'Havolani nusxalash')}
                className={`h-12 w-12 shrink-0 border-none rounded-2xl p-0 flex items-center justify-center shadow-lg transition-all motion-safe:active:scale-95 ${copied === 'link' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'}`}
              >
                {copied === 'link' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              </Button>
            </div>
            <span role="status" className="block h-4 text-xs font-bold text-emerald-500">
              {copied === 'link' ? tr('Link copied', 'Ссылка скопирована', 'Havola nusxalandi') : ''}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative">
            <Button
              onClick={copyMessage}
              variant="outline"
              className="flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-wider"
            >
              {copied === 'text'
                ? (
                  <span className="flex items-center gap-2 justify-center text-emerald-500">
                    <Check className="w-4 h-4" /> {tr('Copied', 'Скопировано', 'Nusxalandi')}
                  </span>
                )
                : tr('Copy invite message', 'Скопировать приглашение', 'Taklifni nusxalash')}
            </Button>
            {canShare && (
              <Button onClick={share} className="flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 border-none">
                <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                {tr('Share', 'Поделиться', 'Ulashish')}
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 md:p-8 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white shrink-0">
              <Zap className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-black text-[var(--text)] uppercase tracking-tight text-base leading-tight">
                {tr('Promo code', 'Промокод', 'Promo kod')}
              </h2>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-xs text-purple-500 font-black uppercase tracking-wider">
                {tr('One use per account', 'Один раз на аккаунт', 'Har bir akkauntga bir marta')}
              </span>
            </div>
          </div>

          <p className="text-sm text-[var(--muted)] leading-relaxed relative">
            {tr(
              'Got a code from a teacher, a class chat or our channels? Enter it to add tokens to your quota right away.',
              'Получили код от учителя, из чата класса или наших каналов? Введите его, и токены сразу добавятся к квоте.',
              "O'qituvchi, sinf chati yoki kanallarimizdan kod oldingizmi? Kiriting, tokenlar kvotangizga darhol qo'shiladi."
            )}
          </p>

          <form onSubmit={handleApplyPromo} className="space-y-3 relative">
            <label htmlFor="promo-code" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">
              {tr('Enter code', 'Введите код', 'Kodni kiriting')}
            </label>
            <div className="flex gap-2">
              <input
                id="promo-code"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="STARTAI"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 min-w-0 px-4 h-12 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] placeholder:opacity-60 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none font-mono tracking-wider"
              />
              <Button
                type="submit"
                disabled={!promoCode.trim() || isApplying}
                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 shadow-lg shadow-purple-500/25 shrink-0 border-none rounded-2xl font-black uppercase text-xs tracking-wider disabled:opacity-50"
              >
                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : tr('Apply', 'Применить', 'Qo‘llash')}
              </Button>
            </div>

            <div role="status" aria-live="polite">
              {promoError && (
                <div role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {promoError}
                </div>
              )}
              {promoSuccess && (
                <div className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-300">
                  {promoSuccess}
                </div>
              )}
            </div>
          </form>

          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 space-y-2 relative">
            <span className="text-xs font-black text-[var(--text)] uppercase tracking-wider block">
              {tr('Launch codes', 'Стартовые коды', 'Start kodlari')}
            </span>
            <div className="flex flex-wrap gap-2">
              {LAUNCH_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPromoCode(code)}
                  className="font-mono bg-[var(--input)] border border-[var(--border)] hover:border-indigo-500/60 hover:bg-indigo-500/10 text-indigo-400 px-3 h-9 rounded-xl text-xs font-bold tracking-wider transition-all motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
