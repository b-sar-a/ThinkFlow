import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Sparkles, Award, Star, Share2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { authedPost } from '../../services/http';

export const PromoHub: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isCopyingText, setIsCopyingText] = useState(false);
  
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCode.trim().toUpperCase();
    if (!code || !profile) return;

    const lang = profile.language;
    const pick = (ru: string, uz: string, en: string) => (lang === 'ru' ? ru : lang === 'uz' ? uz : en);

    try {
      const { added } = await authedPost<{ added: number }>('/api/promo/redeem', { code });
      const amount = added.toLocaleString();
      setPromoSuccess(pick(
        `Промокод активирован! +${amount} токенов ИИ добавлены к квоте!`,
        `Promo kod faollashtirildi! Kvotangizga +${amount} AI token qo'shildi!`,
        `Code applied! +${amount} AI tokens added to your quota!`
      ));
      setPromoCode('');
    } catch (err: any) {
      const reason = String(err?.message || '');
      if (reason === 'ALREADY_CLAIMED') {
        setPromoError(pick('Вы уже активировали этот промокод!', 'Bu promo kod allaqachon ishlatilgan!', 'You have already claimed this promo code!'));
      } else if (reason === 'INVALID_CODE') {
        setPromoError(pick('Неверный промокод или срок действия истек', "Promo kod noto'g'ri yoki muddati tugagan", 'Invalid promo code or expired'));
      } else if (reason === 'PROMO_UNAVAILABLE') {
        setPromoError(pick('Промокоды временно недоступны.', 'Promo kodlar vaqtincha mavjud emas.', 'Promo codes are temporarily unavailable.'));
      } else {
        setPromoError(pick('Не удалось активировать код. Попробуйте еще раз.', "Kodni faollashtirib bo'lmadi. Qayta urinib ko'ring.", 'Failed to apply code. Try again.'));
      }
    }
  };

  const referralUrl = `https://thinkflow.ai/join?ref=${profile?.uid?.slice(0, 6) || 'genius'}`;
  
  const referralShareTextEn = `Unlock your academic genius with ThinkFlow AI! Use my invite link to claim an instant +500 token quota bonus: ${referralUrl}`;
  const referralShareTextRu = `Активируй свой учебный интеллект с ИИ-помощником ThinkFlow! Переходи по моей ссылке и получи мгновенные +500 токенов на счет: ${referralUrl}`;

  const copyReferralLink = () => {
    setIsCopyingLink(true);
    navigator.clipboard.writeText(referralUrl);
    setTimeout(() => setIsCopyingLink(false), 2000);
  };

  const copyReferralText = () => {
    setIsCopyingText(true);
    const text = profile?.language === 'ru' ? referralShareTextRu : referralShareTextEn;
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsCopyingText(false), 2000);
  };

  const currentThemeText = (uk: string, ru: string) => {
    return profile?.language === 'ru' ? ru : uk;
  };

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-500">
      {/* Header Container */}
      <div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-[var(--card)] border border-indigo-500/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5 text-indigo-400" />
            {currentThemeText("Rewards & Referral Hub", "Центр наград и рефералов")}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic leading-tight">
            {currentThemeText("Spread the Flow, Get ", "Делись знаниями, получай ")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 drop-shadow-sm font-black">
              {currentThemeText("More AI Tokens", "ИИ Токены")}
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-gray-400 font-medium max-w-2xl leading-relaxed">
            {currentThemeText(
              "Help us improve educational accessibility for everyone! Invite friends to ThinkFlow and claim token quota bonuses. Discover hidden launch promo codes across our channels to unlock extra intelligence limits.",
              "Помогите нам сделать качественное образование доступным каждому! Приглашайте друзей в ThinkFlow и расширяйте квоты использования ИИ. Находите купоны в наших сообществах, чтобы получить дополнительный объём умной памяти."
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Referral Box */}
        <Card className="p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[50px] rounded-full" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tighter text-base leading-none">
                  {currentThemeText("Invite your Friends", "Пригласить друзей")}
                </h3>
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mt-1">Get +500 tokens for each friend</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {currentThemeText(
                "When friends sign up using your unique invitation, you will receive a +500 quota boost. They also get a starting +500 token reward to explore physics, algebra, and chemistry!",
                "Когда ваши друзья регистрируются по вашему приглашению, их квота ИИ увеличивается на +500 токенов. Вы также получаете +500 бонусных токенов на свой баланс!"
              )}
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">Your Invite URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={referralUrl}
                  className="flex-1 min-w-0 px-4 h-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-indigo-300 focus:outline-none"
                />
                <Button 
                  onClick={copyReferralLink}
                  className="h-12 w-12 bg-indigo-600 hover:bg-indigo-500 shrink-0 border-none rounded-2xl p-0 flex items-center justify-center"
                >
                  {isCopyingLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={copyReferralText}
            variant="ghost" 
            className="w-full h-11 border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/10 text-xs text-gray-300 font-bold rounded-2xl uppercase tracking-wider"
          >
            {isCopyingText ? (
              <span className="flex items-center gap-2 justify-center text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                {currentThemeText("Copied! Share with friends", "Готово! Отправь друзьям")}
              </span>
            ) : (
              currentThemeText("Copy Ready-to-Send Post", "Скопировать текст приглашения")
            )}
          </Button>
        </Card>

        {/* Promo Codes claim */}
        <Card className="p-6 md:p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 blur-[50px] rounded-full" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tighter text-base leading-none">
                  {currentThemeText("Activate Promo Codes", "Активация промокодов")}
                </h3>
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block mt-1">Discover hidden community benefits</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {currentThemeText(
                "Keep an eye out on physical posters, class bulletins, and social forums. Enter keys here to boost your threshold instantly.",
                "Следите за объявлениями, чатами групп и конкурсами! Вводите секретные слова и коды в форму ниже, чтобы мгновенно подпитать квоту вашего ИИ."
              )}
            </p>

            <form onSubmit={handleApplyPromo} className="space-y-3 pt-2">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">Enter Coupon / Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. STARTAI"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 min-w-0 px-4 h-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none uppercase"
                  />
                  <Button 
                    type="submit"
                    className="h-12 px-6 bg-purple-600 hover:bg-purple-500 shrink-0 border-none rounded-2xl font-black uppercase text-[10px] tracking-widest"
                  >
                    {currentThemeText("CLAIM", "ВВОД")}
                  </Button>
                </div>
              </div>

              {promoError && (
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/10">
                  {promoError}
                </div>
              )}

              {promoSuccess && (
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                  {promoSuccess}
                </div>
              )}
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-gray-400 space-y-1">
            <span className="font-black text-white uppercase block">{currentThemeText("⭐ Try these launch coupon codes:", "⭐ Попробуйте эти стартовые промокоды:")}</span>
            <div className="flex flex-wrap gap-2 pt-1.5">
              <span className="font-mono bg-white/5 border border-white/5 text-indigo-400 px-2 py-0.5 rounded text-[10px]">STARTAI</span>
              <span className="font-mono bg-white/5 border border-white/5 text-indigo-400 px-2 py-0.5 rounded text-[10px]">LEARNFLOW</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Brand Ambassador Quests */}
      <Card className="p-6 md:p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-base leading-none">
                {currentThemeText("Ambassador Missions", "Миссии Амбассадора")}
              </h3>
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest block mt-1">Unlock high performance thresholds</span>
            </div>
          </div>
          <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase scale-95">{currentThemeText("NEW", "НОВОЕ")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              titleEn: "Vocal Supporter",
              titleRu: "Голос Проекта",
              descEn: "Write a high-quality review in your group or blog explaining your learning experience.",
              descRu: "Напишите честный отзыв в вашей группе, блоге или соцсетях, рассказав, как вы учитесь с ИИ.",
              reward: "+3,000 Tokens",
              actionEn: "Check Quest",
              actionRu: "Начать квест",
            },
            {
              titleEn: "Knowledge Mapper",
              titleRu: "Исследователь тем",
              descEn: "Spawn more than 10 master knowledge map clusters in Genius Lab.",
              descRu: "Создайте более 10 разветвленных карт знаний по сложным наукам в Genius Lab.",
              reward: "+5,000 Tokens",
              actionEn: "Achieve Lab Level",
              actionRu: "Перейти в Лабораторию",
            },
            {
              titleEn: "Super Educator",
              titleRu: "Супер Наставник",
              descEn: "Assist other users by answering their queries in the public messages.",
              descRu: "Помогите другим пользователям, отвечая на вопросы и делясь метафорами в сообщениях.",
              reward: "+4,000 Tokens",
              actionEn: "Help Community",
              actionRu: "Помочь сообществу",
            }
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:translate-y-[-2px] transition-transform">
              <div className="flex justify-between items-start gap-2">
                <span className="font-black text-xs text-white uppercase tracking-wider">{currentThemeText(m.titleEn, m.titleRu)}</span>
                <span className="text-[9px] font-black text-amber-400 shrink-0">{m.reward}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">{currentThemeText(m.descEn, m.descRu)}</p>
              <button className="text-[9px] font-black uppercase text-indigo-400 hover:text-indigo-300 tracking-wider">
                {currentThemeText(m.actionEn, m.actionRu)} &rarr;
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
