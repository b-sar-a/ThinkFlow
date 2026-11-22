import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, Calculator, Target, PenTool, Atom, ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Sparkles, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { levelInfo } from '../../lib/progress';
import { track } from '../../lib/analytics';
import { PROGRAMS, LESSON_XP, checkAnswer, Bi, Lesson, Program, PracticeItem } from '../../data/programs';

const ICONS = { calculator: Calculator, target: Target, pen: PenTool, atom: Atom } as const;

const ACCENT = {
  indigo: { text: 'text-indigo-500', soft: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  emerald: { text: 'text-emerald-500', soft: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  amber: { text: 'text-amber-500', soft: 'bg-amber-500/10', border: 'border-amber-500/30' },
  rose: { text: 'text-rose-500', soft: 'bg-rose-500/10', border: 'border-rose-500/30' },
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
  const topRef = useRef<HTMLDivElement>(null);

  const program = PROGRAMS.find((p) => p.id === programId) ?? null;
  const lesson = program?.lessons.find((l) => l.id === lessonId) ?? null;
  const doneKey = (p: Program, l: Lesson) => `${p.id}/${l.id}`;

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [programId, lessonId]);

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
    setJustEarned(key);
    track('first_lesson_completed');
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
          <p className="text-[var(--text)] leading-relaxed">{language === 'uz' && lesson.uz ? lesson.uz.example : text(lesson.example)}</p>
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
          />
        </section>

        {justEarned === doneKey(program, lesson) && (
          <div role="status" className="p-5 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            {tr(`Lesson complete! +${LESSON_XP} XP`, `Урок пройден! +${LESSON_XP} XP`, `Dars tugadi! +${LESSON_XP} XP`)}
          </div>
        )}

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
          'Your progress is saved on this device. Lessons are written by the ThinkFlow team; more programs are coming.',
          'Прогресс сохраняется на этом устройстве. Уроки написаны командой ThinkFlow, новые программы появятся позже.',
          "Progress shu qurilmada saqlanadi. Darslarni ThinkFlow jamoasi yozgan, yangi dasturlar keyin qo'shiladi."
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
}

const Practice: React.FC<PracticeProps> = ({ items, text, uz, tr, alreadyDone, onAllDone }) => {
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

  const check = (i: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!values[i].trim()) return;
    setStatus((s) => set(s, i, checkAnswer(items[i], values[i]) === 'correct' ? 'correct' : 'wrong'));
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
              <p className="font-semibold text-[var(--text)] leading-relaxed">
                <span className="text-[var(--muted)] mr-2">{i + 1}.</span>
                {qOf(item)}
              </p>

              {self ? (
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
