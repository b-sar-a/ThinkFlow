
import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Shield, Trash2, LogOut, Sparkles, Layers, MessageSquareText, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useSafety } from '../../lib/safety';

const TELEGRAM = 'https://t.me/b_sar_a';

/** On/off switch that tells screen readers its state. */
const Toggle: React.FC<{ checked: boolean; onChange: (value: boolean) => void; label: string; color?: string }> = ({ checked, onChange, label, color = 'bg-indigo-600' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`w-16 h-8 shrink-0 rounded-full transition-all relative p-1 after:content-[''] after:absolute after:-inset-x-1 after:-inset-y-2 ${checked ? color : 'bg-[var(--muted)]/40'}`}
  >
    <span className={`block w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${checked ? 'translate-x-8' : 'translate-x-0'}`} />
  </button>
);

/** One setting: icon + title + hint on the left, the control on the right (stacked on phones). */
const Row: React.FC<{ icon: React.ReactNode; tint: string; title: string; hint: string; children: React.ReactNode }> = ({ icon, tint, title, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-5 min-w-0">
      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${tint}`} aria-hidden="true">{icon}</div>
      <div className="min-w-0">
        <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{title}</h4>
        <p className="text-xs font-bold text-[var(--muted)] tracking-wide mt-0.5">{hint}</p>
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { signOut, deleteAccount, geniusMode, setGeniusMode, profile, updateProfileData } = useAuth();
  const { blocked, unblock } = useSafety();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const DEPTH_LABEL: Record<string, Record<string, string>> = {
    Surface: { en: 'Surface', ru: 'Кратко', uz: 'Qisqa' },
    Deep: { en: 'Deep', ru: 'Глубоко', uz: 'Chuqur' },
    Architect: { en: 'Architect', ru: 'Эксперт', uz: 'Ekspert' },
  };
  const STYLE_LABEL: Record<string, Record<string, string>> = {
    Metaphorical: { en: 'Metaphorical', ru: 'Через примеры', uz: 'Misollar orqali' },
    Technical: { en: 'Technical', ru: 'Технически', uz: 'Texnik' },
    Simple: { en: 'Simple', ru: 'Просто', uz: 'Oddiy' },
  };
  const LANGUAGES: { id: 'en' | 'ru' | 'uz'; name: string }[] = [
    { id: 'ru', name: 'Русский' },
    { id: 'en', name: 'English' },
    { id: 'uz', name: 'Oʻzbekcha' },
  ];

  // "Delete account" only hides the profile and signs out (the data stays until we remove it on request),
  // so the screen says exactly that.
  const handleDeactivate = async () => {
    setIsDeleting(true);
    setDeleteFailed(false);
    try {
      await deleteAccount();
    } catch (error) {
      setDeleteFailed(true);
      setIsDeleting(false);
    }
  };

  const choice = (active: boolean, activeClass = 'bg-indigo-600 text-white') =>
    `px-4 min-h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? activeClass : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.settings}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {tr("Appearance, language and how the AI explains things.", "Внешний вид, язык и то, как ИИ объясняет темы.", "Ko‘rinish, til va AI tushuntirish uslubi.")}
          </p>
        </div>
        <div className="w-20 h-20 shrink-0 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500">
          <SettingsIcon className="w-10 h-10" />
        </div>
      </div>

      <div className="space-y-8">
        <Card className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{tr('Interface', 'Интерфейс', 'Interfeys')}</h3>

          <Row
            icon={theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            tint="bg-indigo-600/10 text-indigo-500"
            title={t.theme}
            hint={theme === 'dark' ? tr('Dark mode is on', 'Включена тёмная тема', 'Qorong‘u rejim yoqilgan') : tr('Light mode is on', 'Включена светлая тема', 'Yorug‘ rejim yoqilgan')}
          >
            <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} label={t.theme} />
          </Row>

          <div className="h-px bg-[var(--border)]" />

          <Row
            icon={<Globe className="w-6 h-6" />}
            tint="bg-emerald-600/10 text-emerald-500"
            title={t.language}
            hint={tr('For the interface and for AI answers', 'Для интерфейса и ответов ИИ', 'Interfeys va AI javoblari uchun')}
          >
            <div role="group" aria-label={t.language} className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.id} type="button" aria-pressed={language === l.id} onClick={() => setLanguage(l.id)} className={choice(language === l.id)}>
                  {l.name}
                </button>
              ))}
            </div>
          </Row>

          <div className="h-px bg-[var(--border)]" />

          <Row
            icon={<Sparkles className="w-6 h-6" />}
            tint="bg-amber-600/10 text-amber-500"
            title={t.geniusMode}
            hint={tr('Animated background and glow effects. Turn it off on a slow device.', 'Анимированный фон и неоновые эффекты. Выключи, если устройство тормозит.', 'Animatsion fon va yorug‘lik effektlari. Sekin qurilmada o‘chiring.')}
          >
            <Toggle checked={geniusMode} onChange={setGeniusMode} label={t.geniusMode} color="bg-amber-500" />
          </Row>
        </Card>

        <Card className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{tr('How the AI explains', 'Как ИИ объясняет', 'AI qanday tushuntiradi')}</h3>

          <Row
            icon={<Layers className="w-6 h-6" />}
            tint="bg-indigo-600/10 text-indigo-500"
            title={tr('Depth', 'Глубина объяснений', 'Tushuntirish chuqurligi')}
            hint={tr('How far the AI goes into a concept', 'Насколько подробно ИИ разбирает тему', 'AI mavzuni qanchalik chuqur yoritadi')}
          >
            <div role="group" aria-label={tr('Depth', 'Глубина', 'Chuqurlik')} className="flex flex-wrap gap-2">
              {['Surface', 'Deep', 'Architect'].map((d) => (
                <button key={d} type="button" aria-pressed={profile?.learningDepth === d} onClick={() => updateProfileData({ learningDepth: d as any })} className={choice(profile?.learningDepth === d)}>
                  {DEPTH_LABEL[d]?.[language] ?? d}
                </button>
              ))}
            </div>
          </Row>

          <div className="h-px bg-[var(--border)]" />

          <Row
            icon={<MessageSquareText className="w-6 h-6" />}
            tint="bg-emerald-600/10 text-emerald-500"
            title={tr('Explanation Style', 'Стиль объяснений', 'Tushuntirish uslubi')}
            hint={tr('Examples from your interests, precise terms, or plain words', 'Примеры из твоих интересов, точные термины или простые слова', 'Qiziqishlaringizdan misollar, aniq atamalar yoki oddiy so‘zlar')}
          >
            <div role="group" aria-label={tr('Style', 'Стиль', 'Uslub')} className="flex flex-wrap gap-2">
              {['Metaphorical', 'Technical', 'Simple'].map((s) => (
                <button key={s} type="button" aria-pressed={profile?.explanationStyle === s} onClick={() => updateProfileData({ explanationStyle: s as any })} className={choice(profile?.explanationStyle === s, 'bg-emerald-600 text-white')}>
                  {STYLE_LABEL[s]?.[language] ?? s}
                </button>
              ))}
            </div>
          </Row>
        </Card>

        {Object.keys(blocked).length > 0 && (
          <Card className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{tr('Blocked people', 'Заблокированные', 'Bloklanganlar')}</h3>
            <ul className="space-y-3">
              {Object.entries(blocked).map(([uid, name]) => (
                <li key={uid} className="flex items-center justify-between gap-4">
                  <span className="font-bold text-[var(--text)] truncate">{name || uid.slice(0, 6)}</span>
                  <Button variant="outline" onClick={() => unblock(uid)} className="h-11 px-5 rounded-xl shrink-0">
                    <span className="font-black uppercase text-xs tracking-widest">{tr('Unblock', 'Разблокировать', 'Blokdan chiqarish')}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-rose-500/20 bg-rose-500/5 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 shrink-0 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500" aria-hidden="true">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black uppercase text-sm tracking-tighter text-rose-500">{tr('Account', 'Аккаунт', 'Hisob')}</h4>
              <p className="text-xs font-bold text-rose-500/70 tracking-wide mt-0.5">{tr('Sign out or deactivate your profile', 'Выход и деактивация профиля', 'Chiqish va profilni faolsizlantirish')}</p>
            </div>
          </div>

          {confirmDeactivate ? (
            <div role="alertdialog" aria-label={tr('Deactivate the account?', 'Деактивировать аккаунт?', 'Hisob faolsizlantirilsinmi?')} className="p-5 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4">
              <p className="text-sm font-medium text-[var(--text)] leading-relaxed">
                {tr(
                  'Your profile will be hidden and you will be signed out. Your data stays stored until you ask us to remove it.',
                  'Профиль будет скрыт, и ты выйдешь из аккаунта. Данные останутся, пока ты не попросишь удалить их.',
                  'Profil yashiriladi va siz hisobdan chiqasiz. Ma’lumotlar siz o‘chirishni so‘ramaguncha saqlanadi.'
                )}{' '}
                <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                  {tr('Ask us to delete everything', 'Попросить удалить всё', 'Hammasini o‘chirishni so‘rash')}
                </a>
              </p>
              {deleteFailed && (
                <p role="alert" className="flex items-center gap-2 text-sm font-bold text-rose-500">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {tr('Could not deactivate. Sign in again and retry.', 'Не удалось деактивировать. Войди заново и повтори.', 'Faolsizlantirib bo‘lmadi. Qayta kirib, urinib ko‘ring.')}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleDeactivate} disabled={isDeleting} className="border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white h-14 rounded-2xl gap-3 flex-1">
                  <Trash2 className="w-5 h-5" />
                  {isDeleting ? tr('Working...', 'Подожди...', 'Kuting...') : tr('Deactivate and sign out', 'Деактивировать и выйти', 'Faolsizlantirish va chiqish')}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDeactivate(false)} disabled={isDeleting} className="h-14 rounded-2xl flex-1">
                  {tr('Cancel', 'Отмена', 'Bekor qilish')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex-1 h-16 rounded-2xl gap-3 transition-all"
                onClick={() => setConfirmDeactivate(true)}
              >
                <Trash2 className="w-5 h-5" />
                {tr('Deactivate account', 'Деактивировать аккаунт', 'Hisobni faolsizlantirish')}
              </Button>
              <Button
                variant="outline"
                className="border-[var(--border)] flex-1 h-16 rounded-2xl gap-3 hover:bg-[var(--input)] transition-all text-[var(--text)]"
                onClick={() => signOut()}
              >
                <LogOut className="w-5 h-5" />
                {tr('Sign out', 'Выйти', 'Chiqish')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
