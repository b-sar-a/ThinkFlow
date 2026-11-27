
import React, { useState } from 'react';
import { Camera, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INTERESTS } from '../../constants';
import { UserProfile } from '../../types';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { GOALS, GOAL_LABEL, GRADES, GRADE_LABEL, MAX_INTERESTS, interestLabel } from '../../lib/profileOptions';

const FIELD = 'w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-colors';
const LABEL = 'text-xs font-black uppercase text-[var(--muted)] tracking-widest group-focus-within:text-indigo-500 transition-colors';

export const ProfileEditor: React.FC = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [photoURL, setPhotoURL] = useState<string | undefined>(profile?.photoURL);

  const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = () => reject(new Error('bad image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64Str;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Check file size (limit to 5MB for processing)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ ok: false, text: tr('The image is too large (max 5 MB).', 'Изображение слишком большое (максимум 5 МБ).', 'Rasm juda katta (eng ko‘pi 5 MB).') });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setPhotoURL(await compressImage(reader.result as string));
        setStatus(null);
      } catch {
        setStatus({ ok: false, text: tr('Could not read this image.', 'Не удалось прочитать изображение.', 'Rasmni o‘qib bo‘lmadi.') });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length >= MAX_INTERESTS ? prev : [...prev, interest]
    );
  };

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
      // The database accepts ages 5–100; keep the value inside that range.
      age: Number.isFinite(ageVal) ? Math.min(100, Math.max(5, ageVal)) : profile.age,
      studentClass: String(fd.get('studentClass') || '') || profile.studentClass,
      goal: String(fd.get('goal') || '') || profile.goal,
      photoURL: photoURL
    };

    try {
      await updateProfileData(updatedProfile);
      setStatus({ ok: true, text: tr('Saved.', 'Сохранено.', 'Saqlandi.') });
    } catch (error) {
      console.error("Profile update error:", error);
      setStatus({ ok: false, text: tr('Could not save. Try a smaller photo or check your connection.', 'Не удалось сохранить. Попробуй фото поменьше или проверь соединение.', 'Saqlab bo‘lmadi. Kichikroq rasm tanlang yoki internetni tekshiring.') });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.profile}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {tr('Tell us about you so the AI can explain better.', 'Расскажи о себе — так ИИ объясняет лучше.', 'O‘zingiz haqingizda yozing — AI yaxshiroq tushuntiradi.')}
          </p>
          <p className="text-xs font-bold text-[var(--muted)] tracking-wide mt-1 truncate">{profile.email}</p>
        </div>
        <div className="relative group shrink-0">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/20 overflow-hidden relative">
            {photoURL ? (
              <img src={photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              (profile.name[0] || 'U').toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" aria-hidden="true">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="sr-only peer"
            id="avatar-upload"
            onChange={handlePhotoUpload}
          />
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-xl shadow-indigo-500/30 border border-white/20 group-hover:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 transition-transform cursor-pointer"
          >
            <Camera className="w-4 h-4 text-white" aria-hidden="true" />
            <span className="sr-only">{tr('Change photo', 'Сменить фото', 'Rasmni almashtirish')}</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-[var(--border)] shadow-2xl overflow-hidden relative">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-6">
              <div className="group space-y-2">
                <label htmlFor="profile-name" className={LABEL}>{t.name}</label>
                <input id="profile-name" name="name" defaultValue={profile.name} required maxLength={80} autoComplete="name" className={FIELD} />
              </div>
              <div className="group space-y-2">
                <label htmlFor="profile-age" className={LABEL}>{tr('Age', 'Возраст', 'Yosh')}</label>
                <input id="profile-age" name="age" type="number" inputMode="numeric" min={5} max={100} defaultValue={profile.age} className={FIELD} />
              </div>
              <div className="group space-y-2">
                <label htmlFor="profile-class" className={LABEL}>{tr('Grade', 'Класс', 'Sinf')}</label>
                <select id="profile-class" name="studentClass" defaultValue={profile.studentClass || 'Grade 9'} className={`${FIELD} [&>option]:bg-[var(--card)] [&>option]:text-[var(--text)]`}>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>{GRADE_LABEL[language][grade]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="group space-y-2">
                <label htmlFor="profile-bio" className={LABEL}>{t.bio}</label>
                <textarea id="profile-bio" name="bio" defaultValue={profile.bio} maxLength={500} className={`${FIELD} h-[212px] resize-none`} />
              </div>
              <div className="group space-y-2">
                <label htmlFor="profile-goal" className={LABEL}>{tr('Main goal', 'Главная цель', 'Asosiy maqsad')}</label>
                <select id="profile-goal" name="goal" defaultValue={profile.goal || 'curiosity'} className={`${FIELD} [&>option]:bg-[var(--card)] [&>option]:text-[var(--text)]`}>
                  {GOALS.map((goal) => (
                    <option key={goal} value={goal}>{GOAL_LABEL[language][goal]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <fieldset className="mt-10 space-y-4">
            <legend className="flex w-full items-baseline justify-between gap-4">
              <span className="text-xs font-black uppercase text-[var(--muted)] tracking-widest">{tr('My Interests', 'Мои интересы', 'Qiziqishlarim')}</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black tabular-nums ${selectedInterests.length >= MAX_INTERESTS ? 'bg-amber-400/20 text-amber-500' : 'bg-indigo-500/15 text-[var(--text)]'}`}>{selectedInterests.length} / {MAX_INTERESTS}</span>
            </legend>
            <p className="text-sm text-[var(--muted)]">{tr('The AI explains topics through these.', 'ИИ объясняет темы через них.', 'AI mavzularni shular orqali tushuntiradi.')}</p>
            <div className="p-5 md:p-8 bg-[var(--input)] rounded-[2rem] md:rounded-[2.5rem] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {INTERESTS.map((i) => {
                const isSelected = selectedInterests.includes(i);
                const atLimit = !isSelected && selectedInterests.length >= MAX_INTERESTS;
                return (
                  <button
                    type="button"
                    key={i}
                    aria-pressed={isSelected}
                    disabled={atLimit}
                    onClick={() => toggleInterest(i)}
                    className={`
                      relative flex items-center justify-center p-4 min-h-14 rounded-2xl border cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40
                      ${isSelected
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 motion-safe:scale-[1.03]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-indigo-500/40 hover:text-[var(--text)] motion-safe:hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-center">{interestLabel(language, i)}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5" aria-hidden="true">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 h-20 rounded-[2rem] gap-3 text-lg relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/30"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {t.update}
          </Button>
          <div role="status" aria-live="polite" className="min-h-6">
            {status && (
              <div className={`flex items-start gap-2 px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs max-w-xs animate-in fade-in zoom-in-95 duration-300 ${status.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {status.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />}
                {status.text}
              </div>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};
