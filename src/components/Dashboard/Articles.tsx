import React, { useEffect, useRef, useState } from 'react';
import { FileText, ArrowRight, ArrowLeft, Atom, Calculator, PenTool, Dna, FlaskConical, Landmark, Clock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LEARNING_ARTICLES, SUBJECT_LABELS, type LearningArticle, type Subject, type ArticleLang } from '../../data/articles';
import { ARTICLES_UZ } from '../../data/articlesUz';

export const LAB_TOPIC_KEY = 'tf_lab_topic';

const SUBJECT_STYLE: Record<Subject, { icon: React.ElementType; color: string }> = {
  physics: { icon: Atom, color: 'text-indigo-500' },
  algebra: { icon: Calculator, color: 'text-purple-500' },
  english: { icon: PenTool, color: 'text-emerald-500' },
  biology: { icon: Dna, color: 'text-rose-500' },
  chemistry: { icon: FlaskConical, color: 'text-cyan-500' },
  history: { icon: Landmark, color: 'text-amber-500' },
};

interface ArticlesProps {
  onNavigate?: (view: string) => void;
}

export const Articles: React.FC<ArticlesProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const lang = language as ArticleLang;
  const tr = (en: string, ru: string, uz: string) => (lang === 'ru' ? ru : lang === 'uz' ? uz : en);

  const [openId, setOpenId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const open = LEARNING_ARTICLES.find((a) => a.id === openId) ?? null;

  useEffect(() => {
    setShowAnswer(false);
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [openId]);

  // Uzbek has its own full text; an article without it falls back to Russian for the body.
  const textOf = (a: LearningArticle) => {
    if (lang === 'uz') return { ...a.ru, ...(ARTICLES_UZ[a.id] ?? {}), title: a.uz.title, summary: a.uz.summary, labTopic: a.uz.labTopic };
    return a[lang === 'ru' ? 'ru' : 'en'];
  };

  const exploreInLab = (a: LearningArticle) => {
    try {
      sessionStorage.setItem(LAB_TOPIC_KEY, textOf(a).labTopic);
    } catch {
      /* storage blocked: the Lab just opens empty */
    }
    onNavigate?.('genius_lab');
  };

  if (open) {
    const text = textOf(open);
    const { icon: Icon, color } = SUBJECT_STYLE[open.subject];
    return (
      <article ref={topRef} className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 scroll-mt-4">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="inline-flex items-center gap-2 h-11 px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {tr('All articles', 'Все статьи', 'Barcha maqolalar')}
        </button>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--input)] ${color}`}>
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {SUBJECT_LABELS[open.subject][lang]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {open.minutes} {tr('min read', 'мин чтения', "daq o'qish")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text)] leading-tight">{text.title}</h1>
        </header>

        {lang === 'uz' && !ARTICLES_UZ[open.id] && (
          <p className="text-sm text-[var(--muted)] p-4 rounded-2xl bg-[var(--input)]">
            O‘zbekcha to‘liq matn tayyorlanmoqda, hozircha maqola rus tilida.
          </p>
        )}

        <div className="space-y-5">
          {text.body.map((p, i) => (
            <p key={i} className="text-base md:text-lg leading-relaxed text-[var(--text)]">{p}</p>
          ))}
        </div>

        <Card className="p-6 md:p-8 rounded-[2rem] border border-indigo-500/20 space-y-5">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {tr('Try it', 'Попробуйте', "Sinab ko'ring")}
          </h2>
          <p className="text-base md:text-lg font-semibold text-[var(--text)] leading-relaxed">{text.tryIt.question}</p>
          <Button
            variant="outline"
            onClick={() => setShowAnswer((v) => !v)}
            aria-expanded={showAnswer}
            className="h-11 px-5 rounded-xl"
          >
            {showAnswer ? <EyeOff className="w-4 h-4 mr-2" aria-hidden="true" /> : <Eye className="w-4 h-4 mr-2" aria-hidden="true" />}
            <span className="font-black uppercase text-xs tracking-wider">
              {showAnswer ? tr('Hide answer', 'Скрыть ответ', 'Javobni yashirish') : tr('Show answer', 'Показать ответ', "Javobni ko'rsatish")}
            </span>
          </Button>
          {showAnswer && (
            <p className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold leading-relaxed">
              {text.tryIt.answer}
            </p>
          )}
        </Card>

        {onNavigate && (
          <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl shadow-indigo-500/20">
            <div className="space-y-1">
              <h2 className="text-lg font-black">{tr('Want to go deeper?', 'Хотите разобраться глубже?', "Chuqurroq o'rganmoqchimisiz?")}</h2>
              <p className="text-sm text-white/80">
                {tr('The Lab builds a knowledge map on this topic around your interests.', 'Лаборатория построит по этой теме карту знаний с учётом ваших интересов.', "Laboratoriya bu mavzu bo'yicha qiziqishlaringizga mos bilim xaritasini quradi.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => exploreInLab(open)}
              className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white text-indigo-700 font-black uppercase text-xs tracking-wider hover:bg-indigo-50 transition-colors"
            >
              {tr('Explore in the Lab', 'Разобрать в Лаборатории', 'Laboratoriyada ochish')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <div ref={topRef} className="max-w-6xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700 scroll-mt-4">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {tr('Articles', 'Статьи', 'Maqolalar')}
          </h1>
          <p className="text-[var(--muted)] font-medium mt-2 max-w-2xl">
            {tr(
              'Short reads of 3–4 minutes, each with a question to try yourself.',
              'Короткие тексты на 3–4 минуты, в каждом есть вопрос, чтобы проверить себя.',
              "3–4 daqiqalik qisqa matnlar, har birida o'zingizni sinash uchun savol bor."
            )}
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 bg-indigo-600/10 rounded-[1.5rem] items-center justify-center text-indigo-500 shrink-0">
          <FileText className="w-8 h-8" aria-hidden="true" />
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {LEARNING_ARTICLES.map((a) => {
          const text = textOf(a);
          const { icon: Icon, color } = SUBJECT_STYLE[a.subject];
          return (
            <li key={a.id} className="flex">
              <button
                type="button"
                onClick={() => setOpenId(a.id)}
                className="group w-full text-left flex flex-col p-6 md:p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-[var(--input)] rounded-2xl flex items-center justify-center">
                    <Icon className={`w-7 h-7 ${color}`} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)] bg-[var(--input)] px-3 py-1.5 rounded-full">
                    {SUBJECT_LABELS[a.subject][lang]}
                  </span>
                </div>
                <h2 className="text-xl font-black mb-3 text-[var(--text)] leading-snug group-hover:text-indigo-500 transition-colors">{text.title}</h2>
                <p className="text-[var(--muted)] text-sm leading-relaxed flex-1">{text.summary}</p>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {a.minutes} {tr('min', 'мин', 'daq')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-indigo-500 font-black uppercase tracking-wider">
                    {tr('Read', 'Читать', "O'qish")}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
