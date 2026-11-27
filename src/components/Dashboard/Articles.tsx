import React, { useEffect, useRef, useState } from 'react';
import { FileText, ArrowRight, ArrowLeft, Atom, Calculator, PenTool, Dna, FlaskConical, Landmark, Clock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LEARNING_ARTICLES, SUBJECT_LABELS, type LearningArticle, type Subject, type ArticleLang } from '../../data/articles';
import { ARTICLES_UZ } from '../../data/articlesUz';

export const LAB_TOPIC_KEY = 'tf_lab_topic';

const SUBJECT_STYLE: Record<Subject, { icon: React.ElementType; color: string; chip: string; tile: string; bar: string; hover: string }> = {
  physics: {
    icon: Atom,
    color: 'text-indigo-500',
    chip: 'bg-indigo-500/15 text-indigo-500',
    tile: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
    bar: 'from-indigo-400 to-indigo-600',
    hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/15',
  },
  algebra: {
    icon: Calculator,
    color: 'text-purple-500',
    chip: 'bg-purple-500/15 text-purple-500',
    tile: 'from-purple-400 to-purple-600 shadow-purple-500/30',
    bar: 'from-purple-400 to-purple-600',
    hover: 'hover:border-purple-500/40 hover:shadow-purple-500/15',
  },
  english: {
    icon: PenTool,
    color: 'text-emerald-500',
    chip: 'bg-emerald-500/15 text-emerald-500',
    tile: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
    hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/15',
  },
  biology: {
    icon: Dna,
    color: 'text-rose-500',
    chip: 'bg-rose-500/15 text-rose-500',
    tile: 'from-rose-400 to-rose-600 shadow-rose-500/30',
    bar: 'from-rose-400 to-rose-600',
    hover: 'hover:border-rose-500/40 hover:shadow-rose-500/15',
  },
  chemistry: {
    icon: FlaskConical,
    color: 'text-cyan-500',
    chip: 'bg-cyan-500/15 text-cyan-500',
    tile: 'from-cyan-400 to-cyan-600 shadow-cyan-500/30',
    bar: 'from-cyan-400 to-cyan-600',
    hover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/15',
  },
  history: {
    icon: Landmark,
    color: 'text-amber-500',
    chip: 'bg-amber-500/15 text-amber-500',
    tile: 'from-amber-400 to-amber-600 shadow-amber-500/30',
    bar: 'from-amber-400 to-amber-600',
    hover: 'hover:border-amber-500/40 hover:shadow-amber-500/15',
  },
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
    const { icon: Icon, chip, tile, bar } = SUBJECT_STYLE[open.subject];
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
          <span aria-hidden="true" className={`block h-1.5 w-24 rounded-full bg-gradient-to-r ${bar}`} />
          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider">
            <span className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full ${chip}`}>
              <span className={`w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white ${tile}`}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              {SUBJECT_LABELS[open.subject][lang]}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--input)] text-[var(--muted)]">
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

        <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-indigo-500/20 space-y-5">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 pt-1">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </span>
            {tr('Try it', 'Попробуйте', "Sinab ko'ring")}
          </h2>
          <p className="text-base md:text-lg font-semibold text-[var(--text)] leading-relaxed">{text.tryIt.question}</p>
          <Button
            onClick={() => setShowAnswer((v) => !v)}
            aria-expanded={showAnswer}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
          >
            {showAnswer ? <EyeOff className="w-4 h-4 mr-2" aria-hidden="true" /> : <Eye className="w-4 h-4 mr-2" aria-hidden="true" />}
            <span className="font-black uppercase text-xs tracking-wider">
              {showAnswer ? tr('Hide answer', 'Скрыть ответ', 'Javobni yashirish') : tr('Show answer', 'Показать ответ', "Javobni ko'rsatish")}
            </span>
          </Button>
          {showAnswer && (
            <p className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold leading-relaxed animate-in fade-in zoom-in-95 duration-300">
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
        <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl shadow-indigo-500/30 rounded-[1.5rem] items-center justify-center text-white shrink-0">
          <FileText className="w-8 h-8" aria-hidden="true" />
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {LEARNING_ARTICLES.map((a) => {
          const text = textOf(a);
          const { icon: Icon, chip, tile, bar, hover } = SUBJECT_STYLE[a.subject];
          return (
            <li key={a.id} className="flex">
              <button
                type="button"
                onClick={() => setOpenId(a.id)}
                className={`group relative overflow-hidden w-full text-left flex flex-col p-6 md:p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:shadow-xl motion-safe:hover:-translate-y-0.5 transition-all focus-visible:outline-2 focus-visible:outline-indigo-500 ${hover}`}
              >
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${bar}`} />
                <div className="flex items-center justify-between mb-5 pt-1">
                  <div className={`w-14 h-14 bg-gradient-to-br shadow-lg rounded-2xl flex items-center justify-center text-white ${tile}`}>
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${chip}`}>
                    {SUBJECT_LABELS[a.subject][lang]}
                  </span>
                </div>
                <h2 className="text-xl font-black mb-3 text-[var(--text)] leading-snug group-hover:text-indigo-500 transition-colors">{text.title}</h2>
                <p className="text-[var(--muted)] text-sm leading-relaxed flex-1">{text.summary}</p>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--input)]">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {a.minutes} {tr('min', 'мин', 'daq')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-indigo-500 font-black uppercase tracking-wider">
                    {tr('Read', 'Читать', "O'qish")}
                    <ArrowRight className="w-4 h-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
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
