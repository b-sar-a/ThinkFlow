
import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Shield, Trash2, LogOut, Sparkles, Layers, MessageSquareText, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useSafety } from '../../lib/safety';
import { ParentAccess } from '../Family/ParentAccess';

const TELEGRAM = 'https://t.me/b_sar_a';

/** On/off switch that tells screen readers its state. */
const Toggle: React.FC<{ checked: boolean; onChange: (value: boolean) => void; label: string; color?: string }> = ({ checked, onChange, label, color = 'bg-gradient-to-r from-indigo-500 to-purple-600' }) => (
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
      <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white ${tint}`} aria-hidden="true">{icon}</div>
      <div className="min-w-0">
        <h4 className="font-black uppercase text-sm tracking-tighter text-[var(--text)]">{title}</h4>
        <p className="text-xs font-bold text-[var(--muted)] tracking-wide mt-0.5">{hint}</p>
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const Settings: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { signOut, deleteAccount, geniusMode, setGeniusMode, profile, updateProfileData } = useAuth();
  const { blocked, unblock } = useSafety();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<'reauth' | 'unavailable' | 'generic' | null>(null);
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

  // Real deletion: the server removes the data and the login. Needs a recent sign-in.
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
    } catch (error) {
      const code = String((error as Error)?.message || '');
      setDeleteError(code === 'REAUTH_REQUIRED' ? 'reauth' : code === 'DELETE_UNAVAILABLE' ? 'unavailable' : 'generic');
      setIsDeleting(false);
    }
  };

  const choice = (active: boolean, activeClass = 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25') =>
    `px-4 min-h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all motion-safe:active:scale-95 ${active ? activeClass : 'bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--border)]'}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.settings}
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            {tr("Appearance, language and how the AI explains things.", "Внешний вид, язык и то, как ИИ объясняет темы.", "Ko‘rinish, til va AI tushuntirish uslubi.")}
          </p>
        </div>
        <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl shadow-indigo-500/30 rounded-[2rem] flex items-center justify-center text-white" aria-hidden="true">
          <SettingsIcon className="w-10 h-10" />
        </div>
      </div>

      <div className="space-y-8">
        <Card className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">{tr('Interface', 'Интерфейс', 'Interfeys')}</h3>

          <Row
            icon={theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            tint="from-indigo-400 to-indigo-600 shadow-indigo-500/30"
            title={t.theme}
            hint={theme === 'dark' ? tr('Dark mode is on', 'Включена тёмная тема', 'Qorong‘u rejim yoqilgan') : tr('Light mode is on', 'Включена светлая тема', 'Yorug‘ rejim yoqilgan')}
          >
            <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} label={t.theme} />
          </Row>

          <div className="h-px bg-[var(--border)]" />

          <Row
            icon={<Globe className="w-6 h-6" />}
            tint="from-emerald-400 to-teal-600 shadow-emerald-500/30"
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
            tint="from-amber-400 to-orange-500 shadow-amber-500/30"
            title={t.geniusMode}
            hint={tr('Animated background and glow effects. Turn it off on a slow device.', 'Анимированный фон и неоновые эффекты. Выключи, если устройство тормозит.', 'Animatsion fon va yorug‘lik effektlari. Sekin qurilmada o‘chiring.')}
          >
            <Toggle checked={geniusMode} onChange={setGeniusMode} label={t.geniusMode} color="bg-gradient-to-r from-amber-400 to-orange-500" />
          </Row>
        </Card>

        <Card className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">{tr('How the AI explains', 'Как ИИ объясняет', 'AI qanday tushuntiradi')}</h3>

          <Row
            icon={<Layers className="w-6 h-6" />}
            tint="from-purple-400 to-fuchsia-600 shadow-purple-500/30"
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
            tint="from-cyan-400 to-sky-600 shadow-cyan-500/30"
            title={tr('Explanation Style', 'Стиль объяснений', 'Tushuntirish uslubi')}
            hint={tr('Examples from your interests, precise terms, or plain words', 'Примеры из твоих интересов, точные термины или простые слова', 'Qiziqishlaringizdan misollar, aniq atamalar yoki oddiy so‘zlar')}
          >
            <div role="group" aria-label={tr('Style', 'Стиль', 'Uslub')} className="flex flex-wrap gap-2">
              {['Metaphorical', 'Technical', 'Simple'].map((s) => (
                <button key={s} type="button" aria-pressed={profile?.explanationStyle === s} onClick={() => updateProfileData({ explanationStyle: s as any })} className={choice(profile?.explanationStyle === s, 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/25')}>
                  {STYLE_LABEL[s]?.[language] ?? s}
                </button>
              ))}
            </div>
          </Row>
        </Card>

        <ParentAccess onNavigate={onNavigate} />

        {Object.keys(blocked).length > 0 && (
          <Card className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--border)] space-y-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-600" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">{tr('Blocked people', 'Заблокированные', 'Bloklanganlar')}</h3>
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

        <Card className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-rose-500/20 bg-rose-500/5 space-y-6">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-600" />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg shadow-rose-500/30 rounded-2xl flex items-center justify-center text-white" aria-hidden="true">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black uppercase text-sm tracking-tighter text-rose-500">{tr('Account', 'Аккаунт', 'Hisob')}</h4>
              <p className="text-xs font-bold text-rose-500/70 tracking-wide mt-0.5">{tr('Sign out or delete your account', 'Выход и удаление аккаунта', 'Chiqish va hisobni o‘chirish')}</p>
            </div>
          </div>

          {confirmDelete ? (
            <div role="alertdialog" aria-label={tr('Delete the account?', 'Удалить аккаунт?', 'Hisob o‘chirilsinmi?')} className="p-5 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4">
              <p className="text-sm font-bold text-[var(--text)]">{tr('This permanently deletes:', 'Это навсегда удалит:', 'Bu butunlay o‘chiradi:')}</p>
              <ul className="list-disc pl-5 text-sm text-[var(--muted)] leading-relaxed space-y-1">
                <li>{tr('your profile, progress, XP and streaks', 'профиль, прогресс, XP и серии', 'profil, progress, XP va seriyalar')}</li>
                <li>{tr('your tasks, AI chats, reviews, posts and comments', 'задания, чаты с ИИ, отзывы, посты и комментарии', 'vazifalar, AI suhbatlari, sharhlar, postlar va izohlar')}</li>
                <li>{tr('your messages (your name is hidden in chats with others)', 'твои сообщения (в чатах с другими твоё имя скрывается)', 'xabarlaringiz (boshqalar bilan chatlarda ismingiz yashiriladi)')}</li>
                <li>{tr('parent access and your sign-in', 'доступ родителей и вход в аккаунт', 'ota-ona kirishi va akkauntga kirish')}</li>
              </ul>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {tr(
                  'Abuse reports are kept to protect other students. This cannot be undone.',
                  'Жалобы на нарушения сохраняются для защиты других учеников. Отменить это нельзя.',
                  'Qoidabuzarlik haqidagi shikoyatlar boshqa o‘quvchilarni himoya qilish uchun saqlanadi. Buni bekor qilib bo‘lmaydi.'
                )}
              </p>
              <div className="space-y-2">
                <label htmlFor="delete-confirm" className="text-xs font-black uppercase tracking-wider text-[var(--muted)] block">
                  {tr('Type DELETE to confirm', 'Введи DELETE для подтверждения', 'Tasdiqlash uchun DELETE yozing')}
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm font-mono tracking-widest text-[var(--text)] outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                />
              </div>
              <div role="status" aria-live="polite">
                {deleteError === 'reauth' && (
                  <p role="alert" className="text-sm font-bold text-rose-500 space-y-2">
                    {tr(
                      'For your safety the sign-in must be recent. Sign out, sign in again and delete the account within 10 minutes.',
                      'Для безопасности вход должен быть свежим. Выйди, войди заново и удали аккаунт в течение 10 минут.',
                      'Xavfsizlik uchun kirish yaqinda bo‘lishi kerak. Chiqing, qayta kiring va 10 daqiqa ichida hisobni o‘chiring.'
                    )}
                  </p>
                )}
                {deleteError === 'unavailable' && (
                  <p role="alert" className="text-sm font-bold text-rose-500">
                    {tr('Deletion is not available right now. ', 'Удаление сейчас недоступно. ', 'O‘chirish hozir mavjud emas. ')}
                    <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {tr('Ask us to delete everything', 'Попросить удалить всё', 'Hammasini o‘chirishni so‘rash')}
                    </a>
                  </p>
                )}
                {deleteError === 'generic' && (
                  <p role="alert" className="flex items-center gap-2 text-sm font-bold text-rose-500">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {tr('Something went wrong. Nothing else was changed; try again.', 'Что-то пошло не так. Попробуй ещё раз.', 'Xatolik yuz berdi. Qayta urinib ko‘ring.')}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting || confirmText.trim() !== 'DELETE'}
                  className="border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white h-14 rounded-2xl gap-3 flex-1 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  {isDeleting ? tr('Deleting...', 'Удаляем...', 'O‘chirilmoqda...') : tr('Delete forever', 'Удалить навсегда', 'Butunlay o‘chirish')}
                </Button>
                {deleteError === 'reauth' ? (
                  <Button variant="outline" onClick={() => signOut()} className="h-14 rounded-2xl flex-1">
                    {tr('Sign out', 'Выйти', 'Chiqish')}
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => { setConfirmDelete(false); setConfirmText(''); setDeleteError(null); }} disabled={isDeleting} className="h-14 rounded-2xl flex-1">
                    {tr('Cancel', 'Отмена', 'Bekor qilish')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white flex-1 h-16 rounded-2xl gap-3 transition-all"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-5 h-5" />
                {tr('Delete account', 'Удалить аккаунт', 'Hisobni o‘chirish')}
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
