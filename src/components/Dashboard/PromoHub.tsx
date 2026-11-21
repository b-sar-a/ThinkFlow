import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTr } from '../../context/LanguageContext';
import { authedPost } from '../../services/http';
import { Button, Chip, Field, Notice, PageHeader, Panel, TextInput } from '../ds';

const LAUNCH_CODES = ['STARTAI', 'LEARNFLOW'];

export const PromoHub: React.FC = () => {
  const { profile } = useAuth();
  const tr = useTr();
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [copied, setCopied] = useState<'link' | 'text' | null>(null);

  // Invite code = first 8 characters of the user id; the server credits both sides once.
  const referralUrl = `${window.location.origin}/?ref=${profile?.uid?.slice(0, 8) ?? ''}`;
  const invited = profile?.referralCount ?? 0;
  const shareText = tr(
    `Learn with ThinkFlow: an AI tutor that explains any topic through your interests. Join with my link and get +1,000 AI tokens: ${referralUrl}`,
    `Учусь в ThinkFlow: ИИ-наставник объясняет любую тему через твои интересы. Заходи по моей ссылке и получи +1 000 токенов ИИ: ${referralUrl}`,
    `ThinkFlow’da o‘qiyman: AI repetitor istalgan mavzuni qiziqishlaringiz orqali tushuntiradi. Mening havolam orqali kiring va +1 000 AI token oling: ${referralUrl}`
  );

  const copy = async (what: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? referralUrl : shareText);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt(tr('Copy this:', 'Скопируй:', 'Nusxa oling:'), what === 'link' ? referralUrl : shareText);
    }
  };

  const share = async () => {
    try {
      await navigator.share({ text: shareText });
    } catch {
      /* closed by the user */
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code || !profile) return;
    setIsApplying(true);
    setPromoStatus(null);

    try {
      const { added } = await authedPost<{ added: number }>('/api/promo/redeem', { code });
      const amount = added.toLocaleString();
      setPromoStatus({
        tone: 'ok',
        text: tr(`Code applied. +${amount} AI tokens added.`, `Промокод активирован. +${amount} токенов ИИ добавлено.`, `Promo kod faollashtirildi. +${amount} AI token qo‘shildi.`),
      });
      setPromoCode('');
    } catch (err: any) {
      const reason = String(err?.message || '');
      const text =
        reason === 'ALREADY_CLAIMED'
          ? tr('You have already used this code.', 'Ты уже активировал этот промокод.', 'Bu promo kod allaqachon ishlatilgan.')
          : reason === 'INVALID_CODE'
            ? tr('This code is invalid or expired.', 'Неверный промокод или срок действия истёк.', 'Promo kod noto‘g‘ri yoki muddati tugagan.')
            : reason === 'PROMO_UNAVAILABLE'
              ? tr('Promo codes are temporarily unavailable.', 'Промокоды временно недоступны.', 'Promo kodlar vaqtincha mavjud emas.')
              : tr('Could not apply the code. Try again.', 'Не удалось применить код. Попробуй ещё раз.', 'Kodni qo‘llab bo‘lmadi. Qayta urinib ko‘ring.');
      setPromoStatus({ tone: 'bad', text });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <PageHeader
        title={tr('Bonuses & codes', 'Бонусы и коды', 'Bonus va kodlar')}
        description={tr('Get more AI tokens by inviting friends or entering a promo code.', 'Получай больше ИИ-токенов: приглашай друзей или вводи промокоды.', 'Do‘stlarni taklif qilib yoki promo kod kiritib ko‘proq AI token oling.')}
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel as="section" aria-labelledby="invite-title" className="p-5 sm:p-6">
          <h2 id="invite-title" className="text-base font-semibold text-fg">{tr('Invite friends', 'Пригласить друзей', 'Do‘stlarni taklif qilish')}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-fg-muted">
            {tr(
              'When a friend signs up with your link, you both get +1,000 AI tokens. Friends must be new accounts, and the first 20 invites pay out.',
              'Когда друг регистрируется по твоей ссылке, вы оба получаете +1 000 токенов ИИ. Друг должен быть новым пользователем; награда выплачивается за первые 20 приглашений.',
              'Do‘st havolangiz orqali ro‘yxatdan o‘tsa, ikkalangiz +1 000 AI token olasiz. Do‘st yangi foydalanuvchi bo‘lishi kerak; birinchi 20 ta taklif uchun to‘lanadi.'
            )}
          </p>

          <div className="mt-4">
            <Field label={tr('Your invite link', 'Твоя ссылка-приглашение', 'Taklif havolangiz')}>
              <div className="flex gap-2">
                <TextInput readOnly value={referralUrl} onFocus={(e) => e.currentTarget.select()} />
                <Button variant="secondary" onClick={() => copy('link')} className="shrink-0">
                  {copied === 'link' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {copied === 'link' ? tr('Copied', 'Скопировано', 'Nusxalandi') : tr('Copy', 'Копировать', 'Nusxalash')}
                </Button>
              </div>
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => copy('text')}>
              {copied === 'text' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied === 'text' ? tr('Copied', 'Скопировано', 'Nusxalandi') : tr('Copy invite message', 'Скопировать текст приглашения', 'Taklif matnini nusxalash')}
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button variant="secondary" onClick={share}>
                <Share2 className="size-4" aria-hidden="true" />
                {tr('Share', 'Поделиться', 'Ulashish')}
              </Button>
            )}
          </div>

          {invited > 0 && (
            <p className="mt-4 text-sm font-medium text-ok">{tr('Friends joined', 'Присоединилось друзей', 'Qo‘shilgan do‘stlar')}: {invited}</p>
          )}
        </Panel>

        <Panel as="section" aria-labelledby="promo-title" className="p-5 sm:p-6">
          <h2 id="promo-title" className="text-base font-semibold text-fg">{tr('Promo code', 'Промокод', 'Promo kod')}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-fg-muted">
            {tr('Each code works once per account.', 'Каждый код можно использовать один раз на аккаунт.', 'Har bir kod bir hisobda bir marta ishlaydi.')}
          </p>

          <form onSubmit={handleApplyPromo} className="mt-4">
            <Field label={tr('Enter a code', 'Введи код', 'Kodni kiriting')}>
              <div className="flex gap-2">
                <TextInput
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="STARTAI"
                  maxLength={40}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="uppercase"
                />
                <Button type="submit" loading={isApplying} disabled={!promoCode.trim()} className="shrink-0">
                  {tr('Apply', 'Применить', 'Qo‘llash')}
                </Button>
              </div>
            </Field>
          </form>

          {promoStatus && <Notice tone={promoStatus.tone} className="mt-3">{promoStatus.text}</Notice>}

          <div className="mt-5">
            <p className="mb-2 text-sm text-fg-muted">{tr('Launch codes', 'Стартовые коды', 'Boshlang‘ich kodlar')}</p>
            <div className="flex flex-wrap gap-2">
              {LAUNCH_CODES.map((code) => (
                <Chip key={code} onClick={() => setPromoCode(code)} className="font-mono">
                  {code}
                </Chip>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
};
