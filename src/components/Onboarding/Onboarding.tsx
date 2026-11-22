import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { track } from '../../lib/analytics';
import { INTERESTS } from '../../constants';
import type { Language } from '../../types';

interface OnboardingProps {
  onDone: () => void;
}

const GRADES = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'University'] as const;
const GOALS = ['grades', 'exams', 'olympiad', 'curiosity'] as const;
const MAX_INTERESTS = 6;

type Copy = {
  step: string;
  titles: [string, string, string];
  subs: [string, string, string];
  grades: Record<(typeof GRADES)[number], string>;
  age: string;
  goals: Record<(typeof GOALS)[number], string>;
  language: string;
  interestsHint: string;
  next: string;
  back: string;
  finish: string;
  skip: string;
  error: string;
  interests: Record<string, string>;
};

const COPY: Record<Language, Copy> = {
  ru: {
    step: 'Шаг',
    titles: ['Расскажи о себе', 'Что тебе интересно?', 'Зачем тебе ThinkFlow?'],
    subs: [
      'Так мы подберём объяснения под твой уровень.',
      'ИИ будет объяснять сложные темы через это. Выбери до 6.',
      'Выбери главную цель и язык.',
    ],
    grades: { 'Grade 5': '5 класс', 'Grade 6': '6 класс', 'Grade 7': '7 класс', 'Grade 8': '8 класс', 'Grade 9': '9 класс', 'Grade 10': '10 класс', 'Grade 11': '11 класс', University: 'Колледж / вуз' },
    age: 'Возраст',
    goals: { grades: 'Подтянуть оценки', exams: 'Подготовиться к экзаменам', olympiad: 'Олимпиады и конкурсы', curiosity: 'Просто интересно' },
    language: 'Язык',
    interestsHint: 'Выбрано',
    next: 'Дальше',
    back: 'Назад',
    finish: 'Начать учиться',
    skip: 'Пропустить',
    error: 'Не удалось сохранить. Попробуй ещё раз.',
    interests: { Sports: 'Спорт', Football: 'Футбол', Chess: 'Шахматы', Anime: 'Аниме', Music: 'Музыка', Design: 'Дизайн', Coding: 'Программирование', Cooking: 'Кулинария', Cars: 'Машины', Business: 'Бизнес', Gaming: 'Игры', Movies: 'Кино', Art: 'Искусство', Fitness: 'Фитнес', Science: 'Наука' },
  },
  en: {
    step: 'Step',
    titles: ['Tell us about you', 'What are you into?', 'Why ThinkFlow?'],
    subs: [
      'So explanations fit your level.',
      'The AI will explain hard topics through these. Pick up to 6.',
      'Choose your main goal and language.',
    ],
    grades: { 'Grade 5': 'Grade 5', 'Grade 6': 'Grade 6', 'Grade 7': 'Grade 7', 'Grade 8': 'Grade 8', 'Grade 9': 'Grade 9', 'Grade 10': 'Grade 10', 'Grade 11': 'Grade 11', University: 'College / university' },
    age: 'Age',
    goals: { grades: 'Raise my grades', exams: 'Prepare for exams', olympiad: 'Olympiads & contests', curiosity: 'Just curious' },
    language: 'Language',
    interestsHint: 'Selected',
    next: 'Next',
    back: 'Back',
    finish: 'Start learning',
    skip: 'Skip',
    error: 'Could not save. Please try again.',
    interests: Object.fromEntries(INTERESTS.map((i) => [i, i])),
  },
  uz: {
    step: 'Qadam',
    titles: ['O‘zingiz haqingizda', 'Nimalar qiziq?', 'ThinkFlow nima uchun?'],
    subs: [
      'Tushuntirishlarni darajangizga moslaymiz.',
      'AI murakkab mavzularni shular orqali tushuntiradi. 6 tagacha tanlang.',
      'Asosiy maqsad va tilni tanlang.',
    ],
    grades: { 'Grade 5': '5-sinf', 'Grade 6': '6-sinf', 'Grade 7': '7-sinf', 'Grade 8': '8-sinf', 'Grade 9': '9-sinf', 'Grade 10': '10-sinf', 'Grade 11': '11-sinf', University: 'Kollej / universitet' },
    age: 'Yosh',
    goals: { grades: 'Baholarni yaxshilash', exams: 'Imtihonlarga tayyorlanish', olympiad: 'Olimpiada va tanlovlar', curiosity: 'Shunchaki qiziq' },
    language: 'Til',
    interestsHint: 'Tanlandi',
    next: 'Keyingi',
    back: 'Orqaga',
    finish: 'O‘qishni boshlash',
    skip: 'O‘tkazib yuborish',
    error: 'Saqlab bo‘lmadi. Qayta urinib ko‘ring.',
    interests: { Sports: 'Sport', Football: 'Futbol', Chess: 'Shaxmat', Anime: 'Anime', Music: 'Musiqa', Design: 'Dizayn', Coding: 'Dasturlash', Cooking: 'Pazandachilik', Cars: 'Mashinalar', Business: 'Biznes', Gaming: 'O‘yinlar', Movies: 'Kino', Art: 'San’at', Fitness: 'Fitnes', Science: 'Fan' },
  },
};

const LANGS: { id: Language; label: string }[] = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'uz', label: 'UZ' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onDone }) => {
  const { profile, updateProfileData } = useAuth();
  const { language, setLanguage } = useLanguage();
  const c = COPY[language];

  const [step, setStep] = useState(0);
  const [studentClass, setStudentClass] = useState<string>(profile?.studentClass || 'Grade 9');
  const [age, setAge] = useState<number>(profile?.age && profile.age >= 5 ? profile.age : 15);
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [goal, setGoal] = useState<string>(profile?.goal || 'curiosity');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (name: string) =>
    setInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : prev.length >= MAX_INTERESTS ? prev : [...prev, name]
    );

  const canContinue = step === 1 ? interests.length > 0 : true;

  const save = async (withAnswers: boolean) => {
    setSaving(true);
    setError('');
    try {
      await updateProfileData(
        withAnswers
          ? { studentClass, age, interests, goal, language, onboarded: true }
          : { language, onboarded: true }
      );
      track('onboarding_completed');
      onDone();
    } catch {
      setError(c.error);
      setSaving(false);
    }
  };

  const chip = (active: boolean) =>
    `px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all ${
      active
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
        : 'bg-[var(--input)] border-[var(--border)] text-[var(--text)] hover:border-indigo-500/50'
    }`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[var(--bg)]/95 backdrop-blur-md overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-xl my-auto rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 md:p-10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2" aria-label={`${c.step} ${step + 1} / 3`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-[var(--border)]'}`} />
            ))}
          </div>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="text-xs font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
          >
            {c.skip}
          </button>
        </div>

        <h2 id="onboarding-title" className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text)]">{c.titles[step]}</h2>
        <p className="text-[var(--muted)] mt-2 mb-8">{c.subs[step]}</p>

        {step === 0 && (
          <div className="space-y-8">
            <div role="radiogroup" aria-label="Grade" className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button key={g} role="radio" aria-checked={studentClass === g} onClick={() => setStudentClass(g)} className={chip(studentClass === g)}>
                  {c.grades[g]}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{c.age}</span>
              <input
                type="number"
                inputMode="numeric"
                min={5}
                max={100}
                value={age}
                onChange={(e) => setAge(Math.min(100, Math.max(5, Number(e.target.value) || 5)))}
                className="mt-2 w-28 rounded-2xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--text)] font-bold focus:outline-none focus:border-indigo-500"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((name) => (
                <button key={name} aria-pressed={interests.includes(name)} onClick={() => toggleInterest(name)} className={chip(interests.includes(name))}>
                  {interests.includes(name) && <Check className="inline w-4 h-4 mr-1 -mt-0.5" />}
                  {c.interests[name] ?? name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-4">{c.interestsHint}: {interests.length} / {MAX_INTERESTS}</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div role="radiogroup" aria-label="Goal" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button key={g} role="radio" aria-checked={goal === g} onClick={() => setGoal(g)} className={`${chip(goal === g)} text-left`}>
                  {c.goals[g]}
                </button>
              ))}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{c.language}</span>
              <div role="radiogroup" aria-label={c.language} className="flex gap-2 mt-2">
                {LANGS.map((l) => (
                  <button key={l.id} role="radio" aria-checked={language === l.id} onClick={() => setLanguage(l.id)} className={chip(language === l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-6 text-sm font-bold text-rose-500">{error}</p>}

        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4" /> {c.back}
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs transition-all"
            >
              {c.next} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="flex items-center gap-2 h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black uppercase tracking-widest text-xs transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {c.finish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
