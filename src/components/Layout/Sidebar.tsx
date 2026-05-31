
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Brain, 
  MessageSquare, 
  Zap, 
  Gift, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  History,
  FileText,
  Lightbulb,
  Quote,
  MessageCircle,
  BarChart3,
  X,
  ShieldAlert,
  Sparkles,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../UI/Button';
import { PaymentModal } from '../UI/PaymentModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentView, onViewChange }) => {
  const { profile, signOut, geniusMode, setGeniusMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleGeniusClick = () => {
    if (!profile?.isPremium) {
      setIsPaymentOpen(true);
    } else {
      setGeniusMode(!geniusMode);
    }
  };

  const menuItems = [
    { id: 'genius_lab', label: t.geniusLab, icon: Brain },
    { id: 'community', label: t.community, icon: Users },
    { id: 'messages', label: t.messages, icon: MessageSquare },
    { id: 'tasks', label: t.tasks, icon: LayoutGrid },
    { id: 'progress', label: t.progress, icon: BarChart3 },
    { id: 'articles', label: t.articles, icon: FileText },
    { id: 'tips', label: t.tips, icon: Lightbulb },
    { id: 'reviews', label: t.reviews, icon: MessageCircle },
    { id: 'leaderboard', label: profile?.language === 'ru' ? 'Бонусы и Коды 🎁' : profile?.language === 'uz' ? 'Bonuslar & Kodlar 🎁' : 'Bonuses & Codes 🎁', icon: Gift },
    { id: 'profile', label: t.profile, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  if (profile?.role === 'admin') {
    menuItems.push({ id: 'admin', label: t.admin, icon: ShieldAlert });
  }

  return (
    <>
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[var(--card)] z-50 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
        transition-transform duration-300 border-r border-[var(--border)] 
        flex flex-col py-8 shadow-2xl overflow-hidden
      `}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('learn')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">TF</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic text-[var(--text)]">ThinkFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-[var(--muted)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`
                w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all group
                ${currentView === item.id 
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20' 
                  : 'text-[var(--muted)] hover:text-indigo-500 hover:bg-[var(--input)]'}
              `}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'group-hover:text-indigo-500'}`} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 mt-auto border-t border-[var(--border)] space-y-3">
          {/* AI Quota Meter */}
          {profile && (() => {
            const dbUsed = profile.aiTokensUsed ?? 0;
            const localUsed = (() => {
              try {
                return parseInt(localStorage.getItem('tf_device_burn_tokens') || '0', 10);
              } catch {
                return 0;
              }
            })();
            const used = profile.isPremium ? dbUsed : Math.max(dbUsed, localUsed);
            const limit = profile.aiTokenLimit ?? 15000;
            const percent = Math.min(100, Math.round((used / limit) * 100));
            const isPremium = profile.isPremium;
            return (
              <div className="p-3.5 rounded-2xl bg-[var(--input)] border border-[var(--border)] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-[var(--text)] tracking-wider">
                  <span className="flex items-center gap-1">
                    <Zap className={`w-3.5 h-3.5 ${isPremium ? 'text-amber-500 fill-amber-500/20' : 'text-indigo-500'}`} />
                    {profile.language === 'ru' ? 'Расход ИИ' : 'AI QUOTA USAGE'}
                  </span>
                  <span className={isPremium ? 'text-amber-400 font-black' : 'text-[var(--muted)]'}>
                    {isPremium ? (profile.language === 'ru' ? 'ПРЕМИУМ' : 'PREMIUM') : percent + '%'}
                  </span>
                </div>
                
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isPremium ? 'bg-gradient-to-r from-amber-500 via-indigo-500 to-indigo-600' : percent > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[8px] font-black text-[var(--muted)] uppercase tracking-wider">
                  <span>{used.toLocaleString()} {profile.language === 'ru' ? 'ток.' : 'tok.'}</span>
                  <span>{limit >= 1000000 ? '1,000,000' : limit.toLocaleString()}</span>
                </div>
                {!isPremium && (
                  <button 
                    onClick={() => setIsPaymentOpen(true)}
                    className="w-full text-center text-[8px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors pt-1 block"
                  >
                    {profile.language === 'ru' ? 'УВЕЛИЧИТЬ КВОТУ ⚡' : 'UPGRADE TO PREMIUM ⚡'}
                  </button>
                )}
              </div>
            );
          })()}

          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-4 transition-all ${geniusMode && profile?.isPremium ? 'text-indigo-400' : ''}`} 
            onClick={handleGeniusClick}
          >
            <Sparkles className={`w-5 h-5 ${geniusMode && profile?.isPremium ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t.geniusMode} {profile?.isPremium ? '👑' : '🔒'}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{t.theme}</span>
          </Button>

          <div 
            className="p-4 bg-[var(--input)] rounded-2xl border border-[var(--border)] flex items-center gap-3 cursor-pointer hover:border-indigo-500/30 transition-all"
            onClick={() => onViewChange('profile')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name?.[0] || 'U'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate text-[var(--text)]">{profile?.name}</p>
            </div>
          </div>

          <button 
            onClick={() => signOut()} 
            className="w-full text-[var(--muted)] text-[10px] font-black uppercase text-left pl-4 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onToggle} 
        />
      )}

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </>
  );
};
