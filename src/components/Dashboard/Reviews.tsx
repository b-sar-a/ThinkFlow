import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Send, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Review } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

const MAX_LENGTH = 1000;

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

interface StarsProps {
  rating: number;
  label: string;
  onSelect?: (r: number) => void;
  starLabel?: (n: number) => string;
}

// Read-only stars are one image with a text label; the picker is a radio group.
const Stars: React.FC<StarsProps> = ({ rating, label, onSelect, starLabel }) => {
  const star = (s: number) => <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber-400' : ''}`} aria-hidden="true" />;

  if (!onSelect) {
    return (
      <div role="img" aria-label={label} className="flex gap-1 text-amber-400 shrink-0">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= rating ? '' : 'text-[var(--border)]'}>{star(s)}</span>
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={s === rating}
          aria-label={starLabel?.(s)}
          onClick={() => onSelect(s)}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all hover:bg-amber-400/10 motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-indigo-500 ${s <= rating ? 'text-amber-400' : 'text-[var(--border)]'}`}
        >
          {star(s)}
        </button>
      ))}
    </div>
  );
};

export const Reviews: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
        setLoadFailed(false);
        setLoading(false);
      },
      (error) => {
        console.error('Reviews fetch error:', error);
        setLoadFailed(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reviewInput.trim();
    if (!user || !profile || !text || isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);
    setPosted(false);

    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: profile.name,
        text,
        rating,
        timestamp: Date.now(),
      });
      setReviewInput('');
      setRating(5);
      setPosted(true);
    } catch (error) {
      console.error('Review submission error:', error);
      setFormError(tr('Could not post your review. Check your connection and try again.', 'Не удалось отправить отзыв. Проверьте соединение и попробуйте ещё раз.', "Sharhni yuborib bo'lmadi. Ulanishni tekshirib, qayta urinib ko'ring."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error('Review delete error:', error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const ratingWord = (n: number) =>
    tr(`${n} out of 5`, `${n} из 5`, `5 dan ${n}`);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length : 0;
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20" role="status" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{t.reviews}</h1>
          <p className="text-[var(--muted)] font-medium mt-2 max-w-xl">
            {tr(
              'What students say about ThinkFlow. Leave your own review: it helps others decide.',
              'Что ученики говорят о ThinkFlow. Оставьте свой отзыв: он поможет другим определиться.',
              "O'quvchilar ThinkFlow haqida nima deydi. O'z sharhingizni qoldiring: u boshqalarga yordam beradi."
            )}
          </p>
        </div>
        {reviews.length > 0 ? (
          <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30 rounded-[1.5rem] text-white shrink-0">
            <span className="text-2xl font-black leading-none">{average.toFixed(1)}</span>
            <Star className="w-4 h-4 fill-white text-white mt-1" aria-hidden="true" />
            <span className="text-xs font-bold text-white/85 mt-1">{reviews.length}</span>
          </div>
        ) : (
          <div className="hidden sm:flex w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30 rounded-[1.5rem] items-center justify-center text-white shrink-0" aria-hidden="true">
            <Star className="w-9 h-9 fill-white" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">
        <Card className="relative overflow-hidden order-1 lg:order-2 p-6 md:p-8 rounded-[2rem] border border-[var(--border)] lg:sticky lg:top-24">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />
          <form onSubmit={submitReview} className="space-y-6 pt-1">
            <h2 className="flex items-center gap-3 text-xl font-black text-[var(--text)] uppercase tracking-tight">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white" aria-hidden="true">
                <MessageCircle className="w-5 h-5" />
              </span>
              {tr('Share your experience', 'Поделитесь впечатлениями', "Taassurotlaringiz bilan bo'lishing")}
            </h2>

            <div className="space-y-2">
              <span id="rating-label" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">
                {tr('Your rating', 'Ваша оценка', 'Sizning bahoyingiz')}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Stars
                  rating={rating}
                  label={tr('Your rating', 'Ваша оценка', 'Sizning bahoyingiz')}
                  onSelect={setRating}
                  starLabel={ratingWord}
                />
                <span aria-hidden="true" className="px-3 py-1 rounded-full bg-amber-400/15 text-xs font-black tabular-nums text-[var(--text)]">{ratingWord(rating)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review-text" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">
                {tr('Your review', 'Ваш отзыв', 'Sizning sharhingiz')}
              </label>
              <textarea
                id="review-text"
                value={reviewInput}
                maxLength={MAX_LENGTH}
                onChange={(e) => {
                  setReviewInput(e.target.value);
                  setPosted(false);
                }}
                placeholder={tr('What helped you? What would you change?', 'Что помогло? Что бы вы изменили?', "Nima yordam berdi? Nimani o'zgartirgan bo'lardingiz?")}
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors h-36 resize-none text-[var(--text)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
              <div className="text-xs text-[var(--muted)] text-right">{reviewInput.length}/{MAX_LENGTH}</div>
            </div>

            <div role="status" aria-live="polite">
              {formError && (
                <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{formError}</p>
              )}
              {posted && (
                <p className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  {tr('Thank you! Your review is posted.', 'Спасибо! Ваш отзыв опубликован.', 'Rahmat! Sharhingiz joylandi.')}
                </p>
              )}
            </div>

            <Button type="submit" disabled={!reviewInput.trim() || isSubmitting} className="w-full h-14 rounded-2xl gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
              {t.submit}
            </Button>
          </form>
        </Card>

        <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
          {loadFailed ? (
            <div role="alert" className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold">
              {tr('Reviews could not be loaded. Try again later.', 'Не удалось загрузить отзывы. Попробуйте позже.', "Sharhlarni yuklab bo'lmadi. Keyinroq urinib ko'ring.")}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 px-6 text-center rounded-[2rem] border border-dashed border-[var(--border)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 motion-safe:animate-bounce" aria-hidden="true">
                <MessageCircle className="w-8 h-8" />
              </div>
              <p className="font-black text-[var(--text)]">{tr('No reviews yet', 'Отзывов пока нет', "Hali sharhlar yo'q")}</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                {tr('Be the first to share how ThinkFlow works for you.', 'Станьте первым, кто расскажет, как ThinkFlow работает для вас.', "ThinkFlow siz uchun qanday ishlashini birinchi bo'lib aytib bering.")}
              </p>
            </div>
          ) : (
            reviews.map((review) => {
              const mine = !!user && review.userId === user.uid;
              const name = review.userName?.trim() || '?';
              return (
                <Card key={review.id} className={`p-6 md:p-7 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-indigo-500/10 motion-safe:hover:-translate-y-0.5 ${mine ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-[var(--border)] hover:border-indigo-500/30'}`}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 bg-gradient-to-br shadow-lg rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 ${avatarColor(name)}`} aria-hidden="true">
                        {name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-[var(--text)] flex items-center gap-2">
                          <span className="truncate">{name}</span>
                          {mine && <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 text-[10px] font-black uppercase tracking-widest">{tr('You', 'Вы', 'Siz')}</span>}
                        </h3>
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(review.timestamp).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Stars rating={review.rating} label={ratingWord(review.rating)} />
                  </div>
                  <p className="text-[var(--text)] leading-relaxed whitespace-pre-wrap break-words">{review.text}</p>

                  {mine && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
                      {confirmDeleteId === review.id ? (
                        <>
                          <span className="text-sm text-[var(--muted)]">{tr('Delete this review?', 'Удалить этот отзыв?', "Bu sharh o'chirilsinmi?")}</span>
                          <Button variant="outline" onClick={() => removeReview(review.id)} className="h-10 px-4 rounded-xl border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white">
                            <span className="font-black uppercase text-xs tracking-wider">{tr('Delete', 'Удалить', "O'chirish")}</span>
                          </Button>
                          <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="h-10 px-4 rounded-xl">
                            <span className="font-black uppercase text-xs tracking-wider">{tr('Cancel', 'Отмена', 'Bekor qilish')}</span>
                          </Button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(review.id)}
                          className="inline-flex items-center gap-2 h-10 px-1 text-xs font-bold text-[var(--muted)] hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          {tr('Delete my review', 'Удалить мой отзыв', "Sharhimni o'chirish")}
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
