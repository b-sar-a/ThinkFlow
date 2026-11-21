
import React, { useRef, useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { INTERESTS } from '../../constants';
import { UserProfile } from '../../types';
import { Avatar, Button, Chip, Field, Notice, PageHeader, Panel, Select, TextArea, TextInput } from '../ds';
import { GOALS, GOAL_LABEL, GRADES, GRADE_LABEL, MAX_INTERESTS, interestLabel } from '../../lib/profileOptions';

const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('bad image'));
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = base64Str;
  });

export const ProfileEditor: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [photoURL, setPhotoURL] = useState<string | undefined>(profile?.photoURL);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ tone: 'bad', text: tr('The image is too large (max 5 MB).', 'Изображение слишком большое (максимум 5 МБ).', 'Rasm juda katta (eng ko‘pi 5 MB).') });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setPhotoURL(await compressImage(reader.result as string));
        setStatus(null);
      } catch {
        setStatus({ tone: 'bad', text: tr('Could not read this image.', 'Не удалось прочитать изображение.', 'Rasmni o‘qib bo‘lmadi.') });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) =>
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length >= MAX_INTERESTS ? prev : [...prev, interest]
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile || isSaving) return;
    setIsSaving(true);
    setStatus(null);

    const fd = new FormData(e.currentTarget);
    const ageVal = parseInt(fd.get('age') as string, 10);
    const updatedProfile: Partial<UserProfile> = {
      name: String(fd.get('name') || '').trim() || profile.name,
      bio: String(fd.get('bio') || ''),
      interests: selectedInterests,
      age: Number.isFinite(ageVal) ? Math.min(100, Math.max(5, ageVal)) : profile.age,
      studentClass: String(fd.get('studentClass') || '') || profile.studentClass,
      goal: String(fd.get('goal') || '') || profile.goal,
      photoURL,
    };

    try {
      await updateProfileData(updatedProfile);
      setStatus({ tone: 'ok', text: tr('Saved.', 'Сохранено.', 'Saqlandi.') });
    } catch (error) {
      console.error('Profile update error:', error);
      setStatus({
        tone: 'bad',
        text: tr('Could not save. Try a smaller photo or check your connection.', 'Не удалось сохранить. Попробуй фото поменьше или проверь соединение.', 'Saqlab bo‘lmadi. Kichikroq rasm tanlang yoki internetni tekshiring.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <PageHeader
        title={t.profile}
        description={tr('Tell us about you so the AI can explain better.', 'Расскажи о себе — так ИИ объясняет лучше.', 'O‘zingiz haqingizda yozing — AI yaxshiroq tushuntiradi.')}
      />

      <Panel className="divide-y divide-line">
        <div className="flex items-center gap-4 p-5">
          <Avatar name={profile.name} src={photoURL} className="size-16 text-xl" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-fg">{profile.name}</p>
            <p className="truncate text-sm text-fg-muted">{profile.email}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={handlePhotoUpload} />
          <Button variant="secondary" size="sm" className="ml-auto shrink-0" onClick={() => fileRef.current?.click()}>
            <Camera className="size-4" aria-hidden="true" />
            {tr('Change photo', 'Сменить фото', 'Rasmni almashtirish')}
          </Button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label={t.name}>
            <TextInput name="name" defaultValue={profile.name} required maxLength={80} autoComplete="name" />
          </Field>
          <Field label={tr('Age', 'Возраст', 'Yosh')}>
            <TextInput name="age" type="number" inputMode="numeric" min={5} max={100} defaultValue={profile.age} />
          </Field>
          <Field label={tr('Grade', 'Класс', 'Sinf')}>
            <Select name="studentClass" defaultValue={profile.studentClass || 'Grade 9'}>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>{GRADE_LABEL[language][grade]}</option>
              ))}
            </Select>
          </Field>
          <Field label={tr('Main goal', 'Главная цель', 'Asosiy maqsad')}>
            <Select name="goal" defaultValue={profile.goal || 'curiosity'}>
              {GOALS.map((goal) => (
                <option key={goal} value={goal}>{GOAL_LABEL[language][goal]}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.bio} className="sm:col-span-2">
            <TextArea name="bio" defaultValue={profile.bio} maxLength={500} rows={3} />
          </Field>
        </div>

        <fieldset className="p-5">
          <legend className="text-sm font-medium text-fg">{tr('Interests', 'Интересы', 'Qiziqishlar')}</legend>
          <p className="mb-3 mt-0.5 text-sm text-fg-muted">
            {tr('The AI explains topics through these.', 'ИИ объясняет темы через них.', 'AI mavzularni shular orqali tushuntiradi.')} {selectedInterests.length} / {MAX_INTERESTS}
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <Chip key={interest} selected={selected} onClick={() => toggleInterest(interest)}>
                  {selected && <Check className="mr-1 inline size-4 align-[-3px]" aria-hidden="true" />}
                  {interestLabel(language, interest)}
                </Chip>
              );
            })}
          </div>
        </fieldset>
      </Panel>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isSaving}>
          {t.update}
        </Button>
        {status && <Notice tone={status.tone} className="py-2">{status.text}</Notice>}
      </div>
    </form>
  );
};
