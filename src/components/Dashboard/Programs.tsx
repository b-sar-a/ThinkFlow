import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, Calculator, Target, PenTool, Atom, FlaskConical, Code2, Dna, Landmark, Cpu, RotateCcw, Play, ThumbsUp, ThumbsDown, Flag, ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Sparkles, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { levelInfo } from '../../lib/progress';
import { track } from '../../lib/analytics';
import { PROGRAMS, LESSON_XP, checkAnswer, Bi, Lesson, Program, PracticeItem } from '../../data/programs';

const ICONS = { calculator: Calculator, target: Target, pen: PenTool, atom: Atom, flask: FlaskConical, code: Code2, dna: Dna, landmark: Landmark, cpu: Cpu } as const;

const ACCENT = {
  indigo: { text: 'text-indigo-500', soft: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  emerald: { text: 'text-emerald-500', soft: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  amber: { text: 'text-amber-500', soft: 'bg-amber-500/10', border: 'border-amber-500/30' },
  rose: { text: 'text-rose-500', soft: 'bg-rose-500/10', border: 'border-rose-500/30' },
  cyan: { text: 'text-cyan-500', soft: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  purple: { text: 'text-purple-500', soft: 'bg-purple-500/10', border: 'border-purple-500/30' },
  teal: { text: 'text-teal-500', soft: 'bg-teal-500/10', border: 'border-teal-500/30' },
  orange: { text: 'text-orange-500', soft: 'bg-orange-500/10', border: 'border-orange-500/30' },
  sky: { text: 'text-sky-500', soft: 'bg-sky-500/10', border: 'border-sky-500/30' },
} as const;

type ItemStatus = 'idle' | 'correct' | 'wrong' | 'shown' | 'selfdone';

const storageKey = (uid: string) => `tf_programs_${uid}`;

const MAX_LESSONS_SAVED = 200;
const KNOWN_LESSONS = new Set(PROGRAMS.flatMap((p) => p.lessons.map((l) => `${p.id}/${l.id}`)));
/** Only lessons that exist, each once, at most what the rules allow. */
const cleanDone = (list: unknown): string[] =>
  Array.from(new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string' && KNOWN_LESSONS.has(x)) : [])).slice(0, MAX_LESSONS_SAVED);

const readDone = (uid: string | undefined): string[] => {
  if (!uid) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(uid)) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

/** Tasks answered wrong, as "program/lesson/number". Kept on this device, oldest first. */
const mistakesKey = (uid: string) => `tf_mistakes_${uid}`;
const MAX_MISTAKES = 60;
const REVIEW_BATCH = 5;
const itemOf = (key: string): { item: PracticeItem; program: Program; lesson: Lesson } | null => {
  const [pid, lid, n] = key.split('/');
  const program = PROGRAMS.find((p) => p.id === pid);
  const lesson = program?.lessons.find((l) => l.id === lid);
  const item = lesson?.practice[Number(n)];
  return program && lesson && item && item.answer !== undefined ? { item, program, lesson } : null;
};
const cleanMistakes = (list: unknown): string[] =>
  Array.from(new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string' && itemOf(x) !== null) : [])).slice(-MAX_MISTAKES);
const readMistakes = (uid: string | undefined): string[] => {
  if (!uid) return [];
  try {
    return cleanMistakes(JSON.parse(localStorage.getItem(mistakesKey(uid)) || '[]'));
  } catch {
    return [];
  }
};

/** Lessons finished per day (local date), for the daily goal. Kept on this device. */
const DAILY_GOAL = 1;
const dailyKey = (uid: string) => `tf_daily_${uid}`;
const dayKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const cleanDaily = (raw: unknown): Record<string, number> => {
  const recent = new Set(Array.from({ length: 30 }, (_, i) => dayKey(i)));
  const out: Record<string, number> = {};
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (recent.has(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = Math.min(Math.floor(v), 99);
    }
  }
  return out;
};
const readDaily = (uid: string | undefined): Record<string, number> => {
  if (!uid) return {};
  try {
    return cleanDaily(JSON.parse(localStorage.getItem(dailyKey(uid)) || '{}'));
  } catch {
    return {};
  }
};

/** Progress ring used on the "continue" card. */
const Ring: React.FC<{ percent: number; label: string }> = ({ percent, label }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-[var(--input)]" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-indigo-500 transition-all duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, percent) / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-[var(--text)]">{Math.round(percent)}%</span>
    </div>
  );
};

interface ProgramsProps {
  onNavigate?: (view: string) => void;
}

export const Programs: React.FC<ProgramsProps> = ({ onNavigate }) => {
  const { user, profile, updateProfileData } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  // Lesson text exists in English and Russian; Uzbek readers get Russian.
  const text = (b: Bi<string>) => (language === 'en' ? b.en : b.ru);
  const texts = (b: Bi<string[]>) => (language === 'en' ? b.en : b.ru);

  const [done, setDone] = useState<string[]>(() => cleanDone(readDone(user?.uid)));
  const uploaded = useRef(false);
  const [programId, setProgramId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [justEarned, setJustEarned] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<string[]>(() => readMistakes(user?.uid));
  const [reviewKeys, setReviewKeys] = useState<string[] | null>(null);
  const [reviewFinished, setReviewFinished] = useState(false);
  // What the student told us about a lesson during this visit (the server keeps one answer per device and lesson).
  const [lessonVote, setLessonVote] = useState<Record<string, 'up' | 'down'>>({});
  const [lessonIssue, setLessonIssue] = useState<Record<string, boolean>>({});
  const [daily, setDaily] = useState<Record<string, number>>(() => readDaily(user?.uid));
  const topRef = useRef<HTMLDivElement>(null);

  const program = PROGRAMS.find((p) => p.id === programId) ?? null;
  const lesson = program?.lessons.find((l) => l.id === lessonId) ?? null;
  const doneKey = (p: Program, l: Lesson) => `${p.id}/${l.id}`;

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [programId, lessonId, reviewKeys]);

  useEffect(() => {
    if (!user?.uid) return;
    try {
      localStorage.setItem(mistakesKey(user.uid), JSON.stringify(mistakes));
    } catch {
      /* storage blocked: the list lasts for this visit only */
    }
  }, [mistakes, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    try {
      localStorage.setItem(dailyKey(user.uid), JSON.stringify(daily));
    } catch {
      /* storage blocked: the streak of days lasts for this visit only */
    }
  }, [daily, user?.uid]);

  const noteMistake = (key: string) => setMistakes((m) => cleanMistakes([...m.filter((k) => k !== key), key]));
  const clearMistake = (key: string) => setMistakes((m) => m.filter((k) => k !== key));

  useEffect(() => {
    if (!profile) return;
    const cloud = cleanDone(profile.lessonsDone);
    const merged = cleanDone([...cloud, ...done]);
    if (merged.length !== done.length) {
      setDone(merged);
      if (user?.uid) {
        try {
          localStorage.setItem(storageKey(user.uid), JSON.stringify(merged));
        } catch {
          /* storage blocked */
        }
      }
    }
    // Progress made before the cloud copy existed (or offline) goes up once.
    if (!uploaded.current && merged.length > cloud.length) {
      uploaded.current = true;
      updateProfileData({ lessonsDone: merged }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.lessonsDone]);

  const saveDone = (next: string[]) => {
    setDone(next);
    if (!user?.uid) return;
    try {
      localStorage.setItem(storageKey(user.uid), JSON.stringify(next));
    } catch {
      /* storage blocked: progress lasts for this visit only */
    }
  };

  const completeLesson = async (p: Program, l: Lesson) => {
    const key = doneKey(p, l);
    if (done.includes(key)) return;
    const next = cleanDone([...done, key]);
    saveDone(next);
    setDaily((d) => cleanDaily({ ...d, [dayKey()]: (d[dayKey()] ?? 0) + 1 }));
    setJustEarned(key);
    track('first_lesson_completed');
    track('lesson_completed', { lesson: `${p.id}.${l.id}` });
    if (!profile) return;
    try {
      const newXP = (profile.xp || 0) + LESSON_XP;
      // XP, level and the finished-lessons list go up in one write.
      await updateProfileData({ xp: newXP, level: Math.max(levelInfo(newXP).level, profile.level), lessonsDone: next });
    } catch (e) {
      console.warn('Could not save lesson progress:', e);
    }
  };

  const exploreInLab = (l: Lesson) => {
    try {
      sessionStorage.setItem('tf_lab_topic', text(l.labTopic));
    } catch {
      /* the Lab just opens empty */
    }
    onNavigate?.('genius_lab');
  };

  const progressOf = (p: Program) => p.lessons.filter((l) => done.includes(doneKey(p, l))).length;

  // -------- review of missed tasks --------
  if (reviewKeys) {
    const batch = reviewKeys.map((key) => ({ key, found: itemOf(key) })).filter((x): x is { key: string; found: NonNullable<ReturnType<typeof itemOf>> } => x.found !== null);
    const leave = () => {
      setReviewKeys(null);
      setReviewFinished(false);
    };
    return (
      <div ref={topRef} className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 scroll-mt-4">
        <button type="button" onClick={leave} className="inline-flex items-center gap-2 h-11 px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {tr('All programs', 'Все программы', 'Barcha dasturlar')}
        </button>
        <header className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-rose-500">{tr('Review', 'Повторение', 'Takrorlash')}</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text)] leading-tight">{tr('Tasks you missed before', 'Задания, в которых были ошибки', "Avval xato qilingan topshiriqlar")}</h1>
          <p className="text-[var(--muted)]">
            {tr(
              'Solve them again. A task leaves the list when you answer it correctly. No XP here, this is just for you to remember.',
              'Решите их ещё раз. Задание уходит из списка, когда вы ответили верно. XP здесь нет, это нужно, чтобы запомнить.',
              "Ularni qayta yeching. To'g'ri javob bergach topshiriq ro'yxatdan chiqadi. Bu yerda XP yo'q, bu eslab qolish uchun."
            )}
          </p>
        </header>
        <Practice
          key={reviewKeys.join('|')}
          items={batch.map((b) => b.found.item)}
          text={text}
          uz={language === 'uz'}
          tr={tr}
          alreadyDone={false}
          onAllDone={() => setReviewFinished(true)}
          onSolved={(i) => clearMistake(batch[i].key)}
          source={(i) => `${batch[i].found.program.title[language]}: ${language === 'uz' && batch[i].found.lesson.title.uz ? batch[i].found.lesson.title.uz : text(batch[i].found.lesson.title)}`}
        />
        {reviewFinished && (
          <div role="status" className="p-5 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            {tr('All reviewed. Well done!', 'Всё повторено. Отлично!', "Hammasi takrorlandi. Barakalla!")}
          </div>
        )}
        <Button onClick={leave} className="h-12 px-6 rounded-2xl w-full sm:w-auto">
          <span className="font-black uppercase text-xs tracking-wider">{tr('Back to programs', 'К программам', 'Dasturlarga qaytish')}</span>
        </Button>
      </div>
    );
  }

  // -------- lesson --------
  if (program && lesson) {
    const idx = program.lessons.findIndex((l) => l.id === lesson.id);
    const next = program.lessons[idx + 1];
    const accent = ACCENT[program.accent];
    return (
      <div ref={topRef} className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 scroll-mt-4">
        <button
          type="button"
          onClick={() => setLessonId(null)}
          className="inline-flex items-center gap-2 h-11 px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {program.title[language]}
        </button>

        <header className="space-y-3">
          <p className={`text-xs font-black uppercase tracking-wider ${accent.text}`}>
            {tr('Lesson', 'Урок', 'Dars')} {idx + 1} / {program.lessons.length}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text)] leading-tight">
            {language === 'uz' && lesson.title.uz ? lesson.title.uz : text(lesson.title)}
          </h1>
        </header>

        {language === 'uz' && !lesson.uz && (
          <p className="text-sm text-[var(--muted)] p-4 rounded-2xl bg-[var(--input)]">
            O‘zbekcha to‘liq matn tayyorlanmoqda, hozircha dars rus tilida.
          </p>
        )}

        <div className="space-y-4">
          {(language === 'uz' && lesson.uz ? lesson.uz.teach : texts(lesson.teach)).map((p, i) => (
            <p key={i} className="text-base md:text-lg leading-relaxed text-[var(--text)]">{p}</p>
          ))}
        </div>

        <div className={`p-5 md:p-6 rounded-[1.5rem] border ${accent.border} ${accent.soft}`}>
          <h2 className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${accent.text}`}>{tr('Worked example', 'Разобранный пример', 'Yechilgan misol')}</h2>
          <p className="text-[var(--text)] leading-relaxed whitespace-pre-line">{language === 'uz' && lesson.uz ? lesson.uz.example : text(lesson.example)}</p>
        </div>

        <section className="space-y-4" aria-labelledby="practice-title">
          <h2 id="practice-title" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {tr('Practice', 'Практика', 'Mashq')}
          </h2>
          <Practice
            key={`${program.id}/${lesson.id}`}
            items={lesson.practice}
            text={text}
            uz={language === 'uz'}
            tr={tr}
            alreadyDone={done.includes(doneKey(program, lesson))}
            onAllDone={() => completeLesson(program, lesson)}
            onWrong={(i) => noteMistake(`${program.id}/${lesson.id}/${i}`)}
          />
        </section>

        {justEarned === doneKey(program, lesson) && (
          <div role="status" className="p-5 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            {tr(`Lesson complete! +${LESSON_XP} XP`, `Урок пройден! +${LESSON_XP} XP`, `Dars tugadi! +${LESSON_XP} XP`)}
          </div>
        )}

        {(() => {
          const key = doneKey(program, lesson);
          const id = `${program.id}.${lesson.id}`;
          const vote = lessonVote[key];
          const reported = lessonIssue[key];
          const round = 'w-11 h-11 rounded-full border border-[var(--border)] bg-[var(--input)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-indigo-500/50 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500';
          return (
            <div className="rounded-2xl border border-[var(--border)] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-sm text-[var(--muted)] leading-relaxed">
                {tr(
                  'Lessons are prepared with AI and are being checked by teachers. Was this one useful?',
                  'Уроки подготовлены с помощью ИИ и проверяются учителями. Был ли этот урок полезен?',
                  "Darslar AI yordamida tayyorlangan va o'qituvchilar tomonidan tekshirilmoqda. Bu dars foydali bo'ldimi?"
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                {vote ? (
                  <span role="status" className="text-sm font-bold text-emerald-500">{tr('Thank you!', 'Спасибо!', 'Rahmat!')}</span>
                ) : (
                  <>
                    <button type="button" className={round} aria-label={tr('Useful', 'Полезно', 'Foydali')} onClick={() => { setLessonVote((v) => ({ ...v, [key]: 'up' })); track('lesson_feedback', { lesson: id, vote: 'up' }); }}>
                      <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" className={round} aria-label={tr('Not useful', 'Не полезно', 'Foydasiz')} onClick={() => { setLessonVote((v) => ({ ...v, [key]: 'down' })); track('lesson_feedback', { lesson: id, vote: 'down' }); }}>
                      <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                {reported ? (
                  <span role="status" className="text-sm font-bold text-emerald-500">{tr('Thanks, we will check it.', 'Спасибо, мы проверим.', 'Rahmat, tekshiramiz.')}</span>
                ) : (
                  <button
                    type="button"
                    className="h-11 px-4 rounded-full border border-[var(--border)] bg-[var(--input)] flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--text)] hover:border-rose-500/50 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500"
                    onClick={() => { setLessonIssue((v) => ({ ...v, [key]: true })); track('lesson_issue', { lesson: id }); }}
                  >
                    <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    {tr('Report a mistake', 'Сообщить об ошибке', "Xato haqida xabar berish")}
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        <div className="flex flex-col sm:flex-row gap-3">
          {onNavigate && (
            <Button variant="outline" onClick={() => exploreInLab(lesson)} className="h-12 px-6 rounded-2xl flex-1">
              <span className="font-black uppercase text-xs tracking-wider">{tr('Go deeper in the Lab', 'Разобрать глубже в Лаборатории', 'Laboratoriyada chuqurroq')}</span>
            </Button>
          )}
          {next ? (
            <Button onClick={() => setLessonId(next.id)} className="h-12 px-6 rounded-2xl flex-1 gap-2">
              <span className="font-black uppercase text-xs tracking-wider">{tr('Next lesson', 'Следующий урок', 'Keyingi dars')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={() => setLessonId(null)} className="h-12 px-6 rounded-2xl flex-1">
              <span className="font-black uppercase text-xs tracking-wider">{tr('Back to the program', 'К программе', 'Dasturga qaytish')}</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // -------- program --------
  if (program) {
    const Icon = ICONS[program.icon];
    const accent = ACCENT[program.accent];
    const count = progressOf(program);
    return (
      <div ref={topRef} className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 scroll-mt-4">
        <button
          type="button"
          onClick={() => setProgramId(null)}
          className="inline-flex items-center gap-2 h-11 px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {tr('All programs', 'Все программы', 'Barcha dasturlar')}
        </button>

        <header className="flex items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${accent.soft}`}>
            <Icon className={`w-8 h-8 ${accent.text}`} aria-hidden="true" />
          </div>
          <div className="space-y-2 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text)] leading-tight">{program.title[language]}</h1>
            <p className="text-[var(--muted)]">{program.summary[language]}</p>
            <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
              {program.audience[language]} · {count}/{program.lessons.length} {tr('lessons done', 'уроков пройдено', 'dars tugagan')}
            </p>
          </div>
        </header>

        <ol className="space-y-3">
          {program.lessons.map((l, i) => {
            const isDone = done.includes(doneKey(program, l));
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setLessonId(l.id)}
                  className="w-full text-left flex items-center gap-4 p-5 rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] hover:border-indigo-500/40 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" aria-label={tr('Done', 'Пройден', 'Tugagan')} /> : <Circle className="w-6 h-6 text-[var(--border)] shrink-0" aria-hidden="true" />}
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Lesson', 'Урок', 'Dars')} {i + 1}</span>
                    <span className="block font-black text-[var(--text)]">{language === 'uz' && l.title.uz ? l.title.uz : text(l.title)}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // -------- list --------
  const groups: { kind: Program['kind']; label: string }[] = [
    { kind: 'school', label: tr('School subjects', 'Школьные предметы', 'Maktab fanlari') },
    { kind: 'exam', label: tr('Exam preparation', 'Подготовка к экзаменам', 'Imtihonga tayyorgarlik') },
  ];
  const totalLessons = PROGRAMS.reduce((n, p) => n + p.lessons.length, 0);
  const totalDone = PROGRAMS.reduce((n, p) => n + progressOf(p), 0);
  const nextUp = (() => {
    const p = PROGRAMS.find((x) => progressOf(x) > 0 && progressOf(x) < x.lessons.length) ?? PROGRAMS.find((x) => progressOf(x) < x.lessons.length);
    const l = p?.lessons.find((x) => !done.includes(doneKey(p, x)));
    return p && l ? { p, l, n: p.lessons.indexOf(l) + 1 } : null;
  })();
  const missed = mistakes.filter((k) => itemOf(k) !== null);
  const todayCount = daily[dayKey()] ?? 0;
  const week = Array.from({ length: 7 }, (_, i) => 6 - i).map((offset) => ({ key: dayKey(offset), n: daily[dayKey(offset)] ?? 0 }));
  const weekDays = week.filter((d) => d.n > 0).length;
  return (
    <div ref={topRef} className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 scroll-mt-4">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Programs', 'Программы', 'Dasturlar')}</h1>
          <p className="text-[var(--muted)] font-medium mt-2 max-w-2xl">
            {tr(
              'Step-by-step courses. Each lesson has a short explanation, a worked example and practice that checks your answers right away.',
              'Курсы по шагам. В каждом уроке короткое объяснение, разобранный пример и практика, которая сразу проверяет ответы.',
              "Bosqichma-bosqich kurslar. Har bir darsda qisqa tushuntirish, yechilgan misol va javoblarni darhol tekshiradigan mashq bor."
            )}
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 bg-indigo-600/10 rounded-[1.5rem] items-center justify-center text-indigo-500 shrink-0">
          <GraduationCap className="w-8 h-8" aria-hidden="true" />
        </div>
      </div>

      {(nextUp || missed.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {nextUp && (
            <button
              type="button"
              onClick={() => {
                setProgramId(nextUp.p.id);
                setLessonId(nextUp.l.id);
              }}
              className={`group text-left flex items-center gap-5 p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-[var(--card)] to-purple-500/10 border border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all focus-visible:outline-2 focus-visible:outline-indigo-500 ${missed.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            >
              <Ring percent={(totalDone / totalLessons) * 100} label={tr(`${totalDone} of ${totalLessons} lessons done`, `Пройдено ${totalDone} из ${totalLessons} уроков`, `${totalLessons} darsdan ${totalDone} tasi tugagan`)} />
              <span className="flex-1 min-w-0 space-y-1">
                <span className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-500">{totalDone === 0 ? tr('Start here', 'Начните отсюда', 'Shu yerdan boshlang') : tr('Continue where you stopped', 'Продолжить с того места', "To'xtagan joyingizdan davom eting")}</span>
                <span className="block text-lg md:text-xl font-black text-[var(--text)] leading-snug">{language === 'uz' && nextUp.l.title.uz ? nextUp.l.title.uz : text(nextUp.l.title)}</span>
                <span className="block text-sm text-[var(--muted)]">{nextUp.p.title[language]} · {tr('Lesson', 'Урок', 'Dars')} {nextUp.n} · {totalDone}/{totalLessons} {tr('lessons done', 'уроков пройдено', 'dars tugagan')}</span>
                <span className="flex items-center gap-3 pt-2">
                  <span
                    className="flex items-center gap-1.5"
                    role="img"
                    aria-label={tr(`Lessons on ${weekDays} of the last 7 days`, `Уроки в ${weekDays} из последних 7 дней`, `So'nggi 7 kunning ${weekDays} tasida darslar`)}
                  >
                    {week.map((d) => (
                      <span key={d.key} className={`w-2.5 h-2.5 rounded-full ${d.n > 0 ? 'bg-emerald-500' : 'bg-[var(--input)]'}`} />
                    ))}
                  </span>
                  <span className={`text-xs font-bold ${todayCount >= DAILY_GOAL ? 'text-emerald-500' : 'text-[var(--muted)]'}`}>
                    {todayCount >= DAILY_GOAL
                      ? tr("Today's goal is done", 'Цель на сегодня выполнена', "Bugungi maqsad bajarildi")
                      : tr("Today's goal: finish 1 lesson", 'Цель на сегодня: пройти 1 урок', "Bugungi maqsad: 1 ta dars tugatish")}
                  </span>
                </span>
              </span>
              <span className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-500 text-white items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5" aria-hidden="true" />
              </span>
            </button>
          )}
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setReviewFinished(false);
                setReviewKeys(missed.slice(0, REVIEW_BATCH));
              }}
              className={`group text-left flex items-center gap-4 p-6 rounded-[2rem] bg-[var(--card)] border border-rose-500/30 hover:border-rose-500/60 hover:shadow-xl hover:shadow-rose-500/10 transition-all focus-visible:outline-2 focus-visible:outline-rose-500 ${nextUp ? '' : 'lg:col-span-3'}`}
            >
              <span className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0 space-y-1">
                <span className="block text-xs font-black uppercase tracking-[0.2em] text-rose-500">{tr('Review', 'Повторение', 'Takrorlash')}</span>
                <span className="block font-black text-[var(--text)]">{tr(`${missed.length} ${missed.length === 1 ? 'task' : 'tasks'} to review`, `Заданий для повторения: ${missed.length}`, `Takrorlash uchun topshiriqlar: ${missed.length}`)}</span>
                <span className="block text-sm text-[var(--muted)]">{tr('Tasks you got wrong. Solve them again to remember.', 'Задания с ошибками. Решите их снова, чтобы запомнить.', "Xato qilingan topshiriqlar. Eslab qolish uchun qayta yeching.")}</span>
              </span>
            </button>
          )}
        </div>
      )}

      {groups.map((g) => {
        const list = PROGRAMS.filter((p) => p.kind === g.kind);
        if (!list.length) return null;
        return (
          <section key={g.kind} className="space-y-4" aria-label={g.label}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">{g.label}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {list.map((p) => {
                const Icon = ICONS[p.icon];
                const accent = ACCENT[p.accent];
                const count = progressOf(p);
                const pct = (count / p.lessons.length) * 100;
                return (
                  <li key={p.id} className="flex">
                    <button
                      type="button"
                      onClick={() => setProgramId(p.id)}
                      className="group w-full text-left flex flex-col gap-4 p-6 md:p-7 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all focus-visible:outline-2 focus-visible:outline-indigo-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent.soft}`}>
                          <Icon className={`w-6 h-6 ${accent.text}`} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)] bg-[var(--input)] px-3 py-1.5 rounded-full">{p.audience[language]}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-xl font-black text-[var(--text)] leading-snug group-hover:text-indigo-500 transition-colors">{p.title[language]}</h3>
                        <p className="text-sm text-[var(--muted)] leading-relaxed">{p.summary[language]}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                          <span>{count}/{p.lessons.length} {tr('lessons', 'уроков', 'dars')}</span>
                          <span className="inline-flex items-center gap-1 text-indigo-500 font-black uppercase tracking-wider">
                            {count === 0 ? tr('Start', 'Начать', 'Boshlash') : count === p.lessons.length ? tr('Review', 'Повторить', 'Takrorlash') : tr('Continue', 'Продолжить', 'Davom etish')}
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--input)] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="text-xs text-[var(--muted)]">
        {tr(
          'Finished lessons are saved to your account and follow you to any device; the list of tasks to review stays on this device. Lessons are written by the ThinkFlow team; more programs are coming.',
          'Пройденные уроки сохраняются в аккаунте и доступны на любом устройстве; список заданий для повторения хранится на этом устройстве. Уроки написаны командой ThinkFlow, новые программы появятся позже.',
          "Tugagan darslar akkauntingizda saqlanadi va istalgan qurilmada ko'rinadi; takrorlash ro'yxati shu qurilmada qoladi. Darslarni ThinkFlow jamoasi yozgan, yangi dasturlar keyin qo'shiladi."
        )}
      </p>
    </div>
  );
};

interface PracticeProps {
  items: PracticeItem[];
  text: (b: Bi<string>) => string;
  uz: boolean;
  tr: (en: string, ru: string, uz: string) => string;
  alreadyDone: boolean;
  onAllDone: () => void;
  /** Called when a typed answer is wrong. */
  onWrong?: (i: number) => void;
  /** Called when a typed answer is right. */
  onSolved?: (i: number) => void;
  /** Shows where a task comes from (used when tasks of several lessons are mixed). */
  source?: (i: number) => string;
}

const Practice: React.FC<PracticeProps> = ({ items, text, uz, tr, alreadyDone, onAllDone, onWrong, onSolved, source }) => {
  const qOf = (it: PracticeItem) => (uz && it.uz ? it.uz.q : text(it.q));
  const explainOf = (it: PracticeItem) => (uz && it.uz ? it.uz.explain : text(it.explain));
  const [status, setStatus] = useState<ItemStatus[]>(() => items.map(() => 'idle'));
  const [values, setValues] = useState<string[]>(() => items.map(() => ''));
  const fired = useRef(false);

  const set = <T,>(arr: T[], i: number, v: T) => arr.map((x, j) => (j === i ? v : x));

  const allDone = useMemo(() => status.every((s) => s === 'correct' || s === 'selfdone'), [status]);
  useEffect(() => {
    if (allDone && !fired.current) {
      fired.current = true;
      if (!alreadyDone) onAllDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  // Multiple choice: tapping an option checks it at once; a wrong pick can be changed.
  const pick = (i: number, choice: string) => {
    if (status[i] === 'correct') return;
    setValues((v) => set(v, i, choice));
    const right = checkAnswer(items[i], choice) === 'correct';
    setStatus((st) => set(st, i, right ? 'correct' : 'wrong'));
    if (right) onSolved?.(i);
    else onWrong?.(i);
  };

  const check = (i: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!values[i].trim()) return;
    const right = checkAnswer(items[i], values[i]) === 'correct';
    setStatus((s) => set(s, i, right ? 'correct' : 'wrong'));
    if (right) onSolved?.(i);
    else onWrong?.(i);
  };

  return (
    <ol className="space-y-4">
      {items.map((item, i) => {
        const s = status[i];
        const self = item.answer === undefined;
        const solved = s === 'correct' || s === 'selfdone';
        return (
          <li key={i}>
            <Card className={`p-5 md:p-6 rounded-[1.5rem] border ${solved ? 'border-emerald-500/30' : 'border-[var(--border)]'} space-y-4`}>
              {source && <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{source(i)}</p>}
              <p className="font-semibold text-[var(--text)] leading-relaxed whitespace-pre-line">
                <span className="text-[var(--muted)] mr-2">{i + 1}.</span>
                {qOf(item)}
              </p>

              {item.choices ? (
                <div className="space-y-3">
                  <div role="radiogroup" aria-label={qOf(item)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.choices.map((choice, k) => {
                      const picked = values[i] === choice;
                      const tone =
                        s === 'correct' && picked
                          ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500'
                          : s === 'wrong' && picked
                            ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                            : 'border-[var(--border)] bg-[var(--input)] text-[var(--text)] hover:border-indigo-500/50';
                      return (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={picked}
                          disabled={s === 'correct'}
                          onClick={() => pick(i, choice)}
                          className={`min-h-12 px-4 py-2 rounded-2xl border text-left flex items-center gap-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${tone}`}
                        >
                          <span aria-hidden="true" className="w-6 h-6 rounded-full border border-current text-xs flex items-center justify-center shrink-0 opacity-80">{'ABCDEF'[k]}</span>
                          <span className="min-w-0 break-words">{choice}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div aria-live="polite">
                    {s === 'correct' && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          {tr('Correct!', 'Верно!', "To'g'ri!")}
                        </p>
                        <p className="text-sm text-[var(--muted)]">{explainOf(item)}</p>
                      </div>
                    )}
                    {(s === 'wrong' || s === 'shown') && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-rose-500">{tr('Not quite. Pick another answer.', 'Пока неверно. Выберите другой ответ.', "Hali noto'g'ri. Boshqa javobni tanlang.")}</p>
                        {s === 'shown' ? (
                          <p className="text-sm text-[var(--text)] p-3 rounded-xl bg-[var(--input)]">{explainOf(item)}</p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus((st) => set(st, i, 'shown'))}
                            className="h-10 text-xs font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                          >
                            {tr('Show the solution', 'Показать решение', "Yechimni ko'rsatish")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : self ? (
                <div className="space-y-3">
                  {s === 'idle' && (
                    <>
                      <textarea
                        value={values[i]}
                        onChange={(e) => setValues((v) => set(v, i, e.target.value))}
                        aria-label={tr('Your answer', 'Ваш ответ', 'Sizning javobingiz')}
                        placeholder={tr('Write your answer here (optional)', 'Напишите ответ здесь (по желанию)', 'Javobingizni shu yerga yozing (ixtiyoriy)')}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 h-24 resize-none text-[var(--text)] placeholder:text-[var(--muted)] placeholder:opacity-60"
                      />
                      <Button variant="outline" onClick={() => setStatus((st) => set(st, i, 'shown'))} className="h-11 px-5 rounded-xl">
                        <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="font-black uppercase text-xs tracking-wider">{tr('Show model answer', 'Показать образец', "Namunani ko'rsatish")}</span>
                      </Button>
                    </>
                  )}
                  {(s === 'shown' || s === 'selfdone') && (
                    <>
                      <p className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[var(--text)] leading-relaxed">{explainOf(item)}</p>
                      {s === 'shown' && (
                        <Button onClick={() => setStatus((st) => set(st, i, 'selfdone'))} className="h-11 px-5 rounded-xl">
                          <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                          <span className="font-black uppercase text-xs tracking-wider">{tr('I compared my answer', 'Я сравнил со своим ответом', "Javobim bilan solishtirdim")}</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={(e) => check(i, e)} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={values[i]}
                      disabled={solved}
                      onChange={(e) => {
                        setValues((v) => set(v, i, e.target.value));
                        if (s === 'wrong') setStatus((st) => set(st, i, 'idle'));
                      }}
                      aria-label={tr('Your answer', 'Ваш ответ', 'Sizning javobingiz')}
                      placeholder={tr('Your answer', 'Ваш ответ', 'Javobingiz')}
                      className="flex-1 min-w-0 h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm outline-none focus:border-indigo-500 text-[var(--text)] disabled:opacity-70"
                    />
                    <Button type="submit" disabled={solved || !values[i].trim()} className="h-12 px-5 rounded-2xl shrink-0">
                      <span className="font-black uppercase text-xs tracking-wider">{tr('Check', 'Проверить', 'Tekshirish')}</span>
                    </Button>
                  </div>

                  <div aria-live="polite">
                    {s === 'correct' && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          {tr('Correct!', 'Верно!', "To'g'ri!")}
                        </p>
                        <p className="text-sm text-[var(--muted)]">{explainOf(item)}</p>
                      </div>
                    )}
                    {(s === 'wrong' || s === 'shown') && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-rose-500">{tr('Not quite. Check your calculation and try again.', 'Пока неверно. Проверьте вычисления и попробуйте ещё раз.', "Hali noto'g'ri. Hisoblashni tekshirib, qayta urinib ko'ring.")}</p>
                        {s === 'shown' ? (
                          <p className="text-sm text-[var(--text)] p-3 rounded-xl bg-[var(--input)]">{explainOf(item)}</p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus((st) => set(st, i, 'shown'))}
                            className="h-10 text-xs font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                          >
                            {tr('Show the solution', 'Показать решение', "Yechimni ko'rsatish")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
};
