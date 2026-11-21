import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INTERESTS } from '../../constants';
import type { Language } from '../../types';
import { Button, Chip, Field, Notice, Panel, Segmented, TextInput } from '../ds';
import { GOALS, GOAL_LABEL, GRADES, GRADE_LABEL, MAX_INTERESTS, interestLabel } from '../../lib/profileOptions';

interface OnboardingProps {
  onDone: () => void;
}

type Copy = {
  step: string;
  titles: [string, string, string];
  subs: [string, string, string];
  grade: string;
  age: string;
  goal: string;
  language: string;
  selected: string;
  next: string;
  back: string;
  finish: string;
  skip: string;
  error: string;
};

const COPY: Record<Language, Copy> = {
  ru: {
    step: 'Шаг',
    titles: ['Расскажи о себе', 'Что тебе интересно?', 'Зачем тебе ThinkFlow?'],
    subs: ['Так мы подберём объяснения под твой уровень.', `ИИ будет объяснять сложные темы через это. Выбери до ${MAX_INTERESTS}.`, 'Выбери главную цель и язык.'],
    grade: 'Класс',
    age: 'Возраст',
    goal: 'Главная цель',
    language: 'Язык',
    selected: 'Выбрано',
    next: 'Дальше',
    back: 'Назад',
    finish: 'Начать учиться',
    skip: 'Пропустить',
    error: 'Не удалось сохранить. Попробуй ещё раз.',
  },
  en: {
    step: 'Step',
    titles: ['Tell us about you', 'What are you into?', 'Why ThinkFlow?'],
    subs: ['So explanations fit your level.', `The AI will explain hard topics through these. Pick up to ${MAX_INTERESTS}.`, 'Choose your main goal and language.'],
    grade: 'Grade',
    age: 'Age',
    goal: 'Main goal',
    language: 'Language',
    selected: 'Selected',
    next: 'Next',
    back: 'Back',
    finish: 'Start learning',
    skip: 'Skip',
    error: 'Could not save. Please try again.',
  },
  uz: {
    step: 'Qadam',
    titles: ['O‘zingiz haqingizda', 'Nimalar qiziq?', 'ThinkFlow nima uchun?'],
    subs: ['Tushuntirishlarni darajangizga moslaymiz.', `AI murakkab mavzularni shular orqali tushuntiradi. ${MAX_INTERESTS} tagacha tanlang.`, 'Asosiy maqsad va tilni tanlang.'],
    grade: 'Sinf',
    age: 'Yosh',
    goal: 'Asosiy maqsad',
    language: 'Til',
    selected: 'Tanlandi',
    next: 'Keyingi',
    back: 'Orqaga',
    finish: 'O‘qishni boshlash',
    skip: 'O‘tkazib yuborish',
    error: 'Saqlab bo‘lmadi. Qayta urinib ko‘ring.',
  },
};

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
    setInterests((prev) => (prev.includes(name) ? prev.filter((i) => i !== name) : prev.length >= MAX_INTERESTS ? prev : [...prev, name]));

  const canContinue = step === 1 ? interests.length > 0 : true;

  const save = async (withAnswers: boolean) => {
    setSaving(true);
    setError('');
    try {
      await updateProfileData(withAnswers ? { studentClass, age, interests, goal, language, onboarded: true } : { language, onboarded: true });
      onDone();
    } catch {
      setError(c.error);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canvas/95 p-4 sm:items-center">
      <Panel role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="my-auto w-full max-w-xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-fg-muted" aria-live="polite">
            {c.step} {step + 1} / 3
          </p>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="cursor-pointer text-sm font-medium text-fg-muted hover:text-fg disabled:opacity-50"
          >
            {c.skip}
          </button>
        </div>

        <h1 id="onboarding-title" className="text-2xl font-semibold tracking-tight text-fg">{c.titles[step]}</h1>
        <p className="mb-6 mt-1 text-[15px] text-fg-muted">{c.subs[step]}</p>

        {step === 0 && (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg">{c.grade}</legend>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((g) => (
                  <Chip key={g} selected={studentClass === g} onClick={() => setStudentClass(g)}>
                    {GRADE_LABEL[language][g]}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <Field label={c.age} className="w-32">
              <TextInput
                type="number"
                inputMode="numeric"
                min={5}
                max={100}
                value={age}
                onChange={(e) => setAge(Math.min(100, Math.max(5, Number(e.target.value) || 5)))}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((name) => {
                const active = interests.includes(name);
                return (
                  <Chip key={name} selected={active} onClick={() => toggleInterest(name)}>
                    {active && <Check className="mr-1 inline size-4 align-[-3px]" aria-hidden="true" />}
                    {interestLabel(language, name)}
                  </Chip>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-fg-muted">{c.selected}: {interests.length} / {MAX_INTERESTS}</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg">{c.goal}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <Chip key={g} selected={goal === g} onClick={() => setGoal(g)} className="text-left">
                    {GOAL_LABEL[language][g]}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-medium text-fg">{c.language}</p>
              <Segmented<Language>
                label={c.language}
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'ru', label: 'Русский' },
                  { value: 'en', label: 'English' },
                  { value: 'uz', label: 'Oʻzbekcha' },
                ]}
              />
            </div>
          </div>
        )}

        {error && <Notice tone="bad" className="mt-6">{error}</Notice>}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={saving} className={step === 0 ? 'invisible' : ''}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {c.back}
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              {c.next}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={() => save(true)} loading={saving}>
              {c.finish}
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
};
