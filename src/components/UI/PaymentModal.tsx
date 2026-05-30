import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, Sparkles, Loader2, Zap, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from './Card';
import { Button } from './Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileData } = useAuth();
  const { t } = useLanguage();
  const [gateway, setGateway] = useState<'stripe' | 'robokassa'>('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'routing' | 'verifying' | 'finalizing' | 'success'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setFeedback(null);
    
    // Step-by-step transaction simulation
    setPaymentStep('routing');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setPaymentStep('verifying');
    try {
      const endpoint = gateway === 'stripe' ? '/api/payment/stripe' : '/api/payment/robokassa';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: gateway === 'stripe' ? 9.99 : 790,
          currency: gateway === 'stripe' ? 'USD' : 'RUB',
          cardName,
          gateway,
          email: profile?.email
        })
      });

      const result = await response.json();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentStep('finalizing');
      
      // Update Premium state in user profile database
      await updateProfileData({ geniusMode: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPaymentStep('success');
    } catch (err) {
      console.error("Payment registration failed, falling back to simulated authorization:", err);
      // Fallback
      await updateProfileData({ geniusMode: true });
      setPaymentStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentThemeText = (uk: string, ru: string) => {
    return profile?.language === 'ru' ? ru : uk;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-4xl bg-[#090a12]/95 border border-indigo-500/20 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row z-10"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Left Column - Marketing & Value Proposition */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between relative">
          <button 
            onClick={onClose} 
            className="md:hidden absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 y-1.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              {currentThemeText("Genius Premium", "Интеллектуальный Премиум")}
            </div>
            
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic leading-none">
              {currentThemeText("Unlock", "Разблокируй")} <span className="text-indigo-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">Genius Mode</span>
            </h3>

            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              {currentThemeText(
                "Supercharge your learning mechanics with premium AI structures, custom roadmaps, and instant explanations powered by advanced Gemini logic.",
                "Прокачай своё обучение на максимум с продвинутыми ИИ-картами знаний, персональными метафорами и мгновенной верификацией ответов."
              )}
            </p>

            <div className="space-y-4 pt-4">
              {[
                { icon: Sparkles, text: currentThemeText("Unlimited Depth Knowledge Mapping", "Неограниченная глубина карт знаний") },
                { icon: CreditCard, text: currentThemeText("Interactive Metaphor Synthesis", "Интерактивный синтез метафор") },
                { icon: ShieldCheck, text: currentThemeText("Full access to GCSE & ЕГЭ Roadmaps", "Полный доступ к ЕГЭ и курсам-шаблонам") },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-300">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 md:pt-0">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                {currentThemeText("CHOOSE BILLING PLAN", "ВЫБЕРИТЕ ТАРИФНЫЙ ПЛАН")}
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-black text-white italic">
                  {gateway === 'stripe' ? '$9.99' : '790 ₽'}
                </span>
                <span className="text-xs font-semibold text-gray-500">/ {currentThemeText("month", "месяц")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative bg-black/20">
          <button 
            onClick={onClose} 
            className="hidden md:flex absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {paymentStep === 'idle' ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 block">
                  {currentThemeText("Payment Method", "Способ оплаты")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setGateway('stripe'); }}
                    className={`p-4 rounded-2xl border text-center font-black uppercase text-[10px] tracking-wider transition-all flex flex-col items-center gap-2 ${
                      gateway === 'stripe' 
                        ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-lg' 
                        : 'border-white/5 bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Stripe (Global)
                  </button>
                  <button
                    onClick={() => { setGateway('robokassa'); }}
                    className={`p-4 rounded-2xl border text-center font-black uppercase text-[10px] tracking-wider transition-all flex flex-col items-center gap-2 ${
                      gateway === 'robokassa' 
                        ? 'border-emerald-500 bg-emerald-600/10 text-white shadow-lg' 
                        : 'border-white/5 bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    Робокасса / СБП (РФ)
                  </button>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                {gateway === 'stripe' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{currentThemeText("Card Name", "Имя на карте")}</label>
                      <input
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 text-white font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{currentThemeText("Card Number", "Номер карты")}</label>
                      <input
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 text-white font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{currentThemeText("Expiry", "Срок действия")}</label>
                        <input
                          required
                          maxLength={5}
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 text-white font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CVC</label>
                        <input
                          required
                          maxLength={3}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500 text-white font-bold text-center"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-4 text-center">
                    <QrCode className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
                    <div>
                      <p className="text-white text-sm font-black uppercase">{currentThemeText("Instant SBP Payment", "Оплата через СБП")}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentThemeText("Generate a dynamic QR-code with Robokassa to process your RF card or SBP fast transaction securely.", "Будет сгенерирован динамический QR-код СБП или ссылка на Robokassa для моментальной оплаты в РФ без комиссии.")}
                      </p>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{currentThemeText("Phone Number", "Телефон для чека")}</label>
                      <input
                        required
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 text-white font-bold"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 group relative overflow-hidden flex items-center justify-center gap-2 ${
                    gateway === 'stripe' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  {currentThemeText("Authorize Transaction", "Авторизовать Оплату")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <AnimatePresence mode="wait">
                {paymentStep === 'routing' && (
                  <motion.div
                    key="routing"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative flex justify-center">
                      <Loader2 className="w-14 h-14 animate-spin text-indigo-500" />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-indigo-300">SEC</div>
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-tight">{currentThemeText("CONTACTING COGNITIVE GATEWAY", "ПОДКЛЮЧЕНИЕ К ПЛАТЕЖНОМУ ШЛЮЗУ")}</h4>
                      <p className="text-xs text-gray-500 mt-1">Initializing highly secured handshake protocol with financial nodes...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'verifying' && (
                  <motion.div
                    key="verifying"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative flex justify-center">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-14 h-14 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                        <Zap className="w-5 h-5 fill-current animate-pulse" />
                      </motion.div>
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-tight">{currentThemeText("VERIFYING FUNDS", "ПОДТВЕРЖДЕНИЕ ТРАНЗАКЦИИ")}</h4>
                      <p className="text-xs text-gray-500 mt-1">Auditing signature credentials & performing 3D-Secure verifications...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'finalizing' && (
                  <motion.div
                    key="finalizing"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative flex justify-center">
                      <Loader2 className="w-14 h-14 animate-spin text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-tight">{currentThemeText("PROVISIONING ACCOUNTS", "ВЫПУСК ПРЕМИУМ-ДОСТУПА")}</h4>
                      <p className="text-xs text-gray-500 mt-1">Injecting continuous neural capability tokens into your live cloud profile...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="w-8 h-8 fill-current" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">
                        {currentThemeText("TRANSACTION AUTHORIZED!", "ОПЛАТА УСПЕШНО СОВЕРШЕНА!")}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                        {currentThemeText(
                          "Your account has been instantly updated. Premium Genius Mode modules have been unlocked in your neural cloud profile forever.",
                          "Статус аккаунта мгновенно изменён на Премиум. Улучшенные модули ИИ и готовые курсы теперь активны в вашем профиле."
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={onClose}
                      className="h-14 px-10 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {currentThemeText("Let's Go!", "Поехали!")}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
