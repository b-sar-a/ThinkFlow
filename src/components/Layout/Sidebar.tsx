
import React, { useEffect } from 'react';
import {
  LayoutGrid,
  Brain,
  MessageSquare,
  Zap,
  Gift,
  Settings,
  LogOut,
  Moon,
  Sun,
  FileText,
  Lightbulb,
  MessageCircle,
  BarChart3,
  X,
  ShieldAlert,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { levelInfo } from '../../lib/progress';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentView, onViewChange }) => {
  const { profile, signOut, geniusMode, setGeniusMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  // Esc closes the menu on phones.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.innerWidth < 1024) onToggle();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onToggle]);

  // Profile and Settings live next to the avatar below, so the list has room for the learning sections.
  const menuItems = [
    { id: 'genius_lab', label: t.geniusLab, icon: Brain },
    { id: 'programs', label: tr('Programs', 'Программы', 'Dasturlar'), icon: GraduationCap },
    { id: 'community', label: t.community, icon: Users },
    { id: 'messages', label: t.messages, icon: MessageSquare },
    { id: 'tasks', label: t.tasks, icon: LayoutGrid },
    { id: 'progress', label: t.progress, icon: BarChart3 },
    { id: 'articles', label: t.articles, icon: FileText },
    { id: 'tips', label: t.tips, icon: Lightbulb },
    { id: 'reviews', label: t.reviews, icon: MessageCircle },
    { id: 'leaderboard', label: tr('Bonuses & Codes', 'Бонусы и коды', 'Bonus va kodlar'), icon: Gift },
  ];

  // The parent cabinet shows up once an account has connected a child (or opened the cabinet from Settings).
  let isParent = false;
  let isTeacher = false;
  try {
    isParent = localStorage.getItem('tf_parent_mode') === '1';
    isTeacher = localStorage.getItem('tf_teacher_mode') === '1';
  } catch {
    /* storage blocked */
  }
  if (isParent || currentView === 'family') {
    menuItems.push({ id: 'family', label: tr('Parent cabinet', 'Кабинет родителя', 'Ota-ona kabineti'), icon: Users });
  }

  if (isTeacher || currentView === 'teacher') {
    menuItems.push({ id: 'teacher', label: tr('Teacher cabinet', 'Кабинет учителя', "O'qituvchi kabineti"), icon: GraduationCap });
  }

  if (profile?.role === 'admin') {
    menuItems.push({ id: 'admin', label: t.admin, icon: ShieldAlert });
  }

  const go = (id: string) => {
    onViewChange(id);
    if (window.innerWidth < 1024) onToggle();
  };

  const used = profile?.aiTokensUsed ?? 0;
  const limit = profile?.aiTokenLimit ?? 15000;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const level = levelInfo(profile?.xp ?? 0).level;

  return (
    <>
      <aside
        aria-label={tr('Sidebar', 'Боковое меню', 'Yon menyu')}
        className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[var(--card)] z-50
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 border-r border-[var(--border)]
        flex flex-col py-5 shadow-2xl overflow-hidden
      `}>
        <div className="px-6 mb-5 flex items-center justify-between">
          <button type="button" className="flex items-center gap-3 cursor-pointer" onClick={() => go('genius_lab')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">TF</div>
            <span translate="no" className="font-black text-2xl tracking-tighter uppercase italic text-[var(--text)]">ThinkFlow</span>
          </button>
          <button type="button" onClick={onToggle} aria-label={tr('Close menu', 'Закрыть меню', 'Menyuni yopish')} className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--text)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav aria-label={tr('Main', 'Основное', 'Asosiy')} className="flex-1 min-h-0 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={currentView === item.id ? 'page' : undefined}
              className={`
                w-full flex items-center gap-4 px-5 py-2.5 rounded-2xl transition-all group
                ${currentView === item.id
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                  : 'text-[var(--muted)] hover:text-indigo-500 hover:bg-[var(--input)]'}
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${currentView === item.id ? 'text-white' : 'group-hover:text-indigo-500'}`} aria-hidden="true" />
              <span className="min-w-0 text-left text-xs font-black uppercase tracking-[0.15em] leading-tight break-words">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 mt-3 border-t border-[var(--border)] space-y-3">
          {profile && (
            <div className="p-3 rounded-2xl bg-[var(--input)] border border-[var(--border)] space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs font-black uppercase text-[var(--text)] tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  {tr('AI tokens', 'ИИ-токены', 'AI tokenlar')}
                </span>
                <span className={percent > 85 ? 'text-rose-500' : 'text-[var(--muted)]'}>{percent}%</span>
              </div>

              <div
                role="progressbar"
                aria-label={tr('AI token usage', 'Расход ИИ-токенов', 'AI token sarfi')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-1.5 w-full bg-[var(--input)] rounded-full overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${percent > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-[var(--muted)] tabular-nums">
                <span>{used.toLocaleString()} / {limit >= 1000000 ? '∞' : limit.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => go('leaderboard')}
                  className="font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors py-2.5 -my-2.5 px-2 -mx-2 rounded-lg"
                >
                  {tr('Get more', 'Получить ещё', 'Ko‘proq olish')}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGeniusMode(!geniusMode)}
              aria-pressed={geniusMode}
              className={`h-11 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] transition-all hover:bg-[var(--input)] ${geniusMode ? 'text-indigo-400' : 'text-[var(--muted)]'}`}
            >
              <Sparkles className={`w-4 h-4 ${geniusMode ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-wider">{t.geniusMode}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="h-11 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-[var(--muted)] transition-all hover:bg-[var(--input)] hover:text-[var(--text)]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              <span className="text-xs font-black uppercase tracking-wider">{tr('Theme', 'Тема', 'Mavzu')}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-2 bg-[var(--input)] rounded-2xl border border-[var(--border)]">
            <button
              type="button"
              onClick={() => go('profile')}
              aria-current={currentView === 'profile' ? 'page' : undefined}
              className={`flex-1 min-w-0 flex items-center gap-3 p-1.5 rounded-xl text-left transition-all hover:bg-[var(--input)] ${currentView === 'profile' ? 'ring-1 ring-indigo-500/50' : ''}`}
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.[0] || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate text-[var(--text)]">{profile?.name}</p>
                <p className="text-xs text-[var(--muted)]">{tr('Level', 'Уровень', 'Daraja')} {level}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => go('settings')}
              aria-label={t.settings}
              title={t.settings}
              aria-current={currentView === 'settings' ? 'page' : undefined}
              className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all hover:bg-[var(--input)] ${currentView === 'settings' ? 'text-indigo-400 bg-[var(--input)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label={t.logout}
              title={t.logout}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-[var(--muted)] transition-all hover:bg-[var(--input)] hover:text-red-400"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};
