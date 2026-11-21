
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { Review } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { Avatar, Button, EmptyState, Field, Notice, PageHeader, Panel, Spinner, TextArea, cn } from '../ds';

/** Five stars. Read-only ones are a single image with a text label; the picker is a radio group. */
const Stars = ({ value, onSelect, label }: { value: number; onSelect?: (rating: number) => void; label: string }) =>
  onSelect ? (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={s === value}
          aria-label={`${s} / 5`}
          onClick={() => onSelect(s)}
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 hover:bg-panel-2 sm:size-9"
        >
          <Star className={cn('size-5', s <= value ? 'fill-warn text-warn' : 'text-line-strong')} aria-hidden="true" />
        </button>
      ))}
    </div>
  ) : (
    <div role="img" aria-label={`${label}: ${value} / 5`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn('size-4', s <= value ? 'fill-warn text-warn' : 'text-line-strong')} aria-hidden="true" />
      ))}
    </div>
  );

export const Reviews: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Reviews fetch error:', error);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !reviewInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: profile.name,
        text: reviewInput.trim(),
        rating,
        timestamp: Date.now(),
      });
      setReviewInput('');
      setRating(5);
    } catch (error) {
      console.error('Review submission error:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (loading) return <Spinner />;

  const ratingLabel = tr('Rating', 'Оценка', 'Baho');

  return (
    <>
      <PageHeader
        title={t.reviews}
        description={tr('What students say about ThinkFlow.', 'Что ученики говорят о ThinkFlow.', 'O‘quvchilar ThinkFlow haqida nima deydi.')}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {loadError && (
            <Notice tone="bad" className="mb-4">
              {tr('Could not load reviews. Check your connection and reload the page.', 'Не удалось загрузить отзывы. Проверь соединение и обнови страницу.', 'Sharhlarni yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
            </Notice>
          )}
          {reviews.length === 0 && !loadError ? (
            <EmptyState
              icon={<MessageCircle className="size-5" />}
              title={tr('No reviews yet', 'Пока нет отзывов', 'Hozircha sharhlar yo‘q')}
              text={tr('Be the first to share how ThinkFlow works for you.', 'Расскажи первым, как тебе помогает ThinkFlow.', 'ThinkFlow sizga qanday yordam berayotganini birinchi bo‘lib yozing.')}
            />
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Panel as="article" className="p-5">
                    <header className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={review.userName} />
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-fg">{review.userName}</p>
                          <p className="text-sm text-fg-muted">{formatDate(review.timestamp)}</p>
                        </div>
                      </div>
                      <Stars value={review.rating} label={ratingLabel} />
                    </header>
                    <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg">{review.text}</p>
                  </Panel>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Panel as="form" onSubmit={submitReview} className="space-y-4 p-5 lg:sticky lg:top-0">
          <h2 className="text-base font-semibold text-fg">{tr('Write a review', 'Написать отзыв', 'Sharh yozish')}</h2>
          <div>
            <p className="mb-1 text-sm font-medium text-fg">{ratingLabel}</p>
            <Stars value={rating} onSelect={setRating} label={ratingLabel} />
          </div>
          <Field label={tr('Your experience', 'Твой опыт', 'Tajribangiz')}>
            <TextArea value={reviewInput} onChange={(e) => setReviewInput(e.target.value)} placeholder={t.writeReview} maxLength={1000} rows={5} />
          </Field>
          {submitError && <Notice tone="bad">{tr('Could not send the review. Try again.', 'Не удалось отправить отзыв. Попробуй ещё раз.', 'Sharhni yuborib bo‘lmadi. Qayta urinib ko‘ring.')}</Notice>}
          <Button type="submit" disabled={!reviewInput.trim()} loading={isSubmitting} className="w-full">
            {!isSubmitting && <Send className="size-4" aria-hidden="true" />}
            {t.submit}
          </Button>
        </Panel>
      </div>
    </>
  );
};
