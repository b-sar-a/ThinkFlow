import React, { useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  FlaskConical,
  Gift,
  LayoutList,
  Lightbulb,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { Avatar, Button, IconButton, ProgressBar, cn } from '../ds';
import { levelInfo } from '../../lib/progress';
import { hashFor, type ViewId } from '../../lib/nav';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: ViewId) => void;
}

type Item = { id: ViewId; label: string; icon: LucideIcon };

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onViewChange }) => {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const tr = useTr();

  // Esc closes the drawer on small screens.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const learn: Item[] = [
    { id: 'genius_lab', label: t.geniusLab, icon: FlaskConical },
    { id: 'tasks', label: t.tasks, icon: LayoutList },
    { id: 'progress', label: t.progress, icon: BarChart3 },
  ];
  const people: Item[] = [
    { id: 'community', label: t.community, icon: Users },
    { id: 'messages', label: t.messages, icon: MessageSquare },
  ];
  const library: Item[] = [
    { id: 'articles', label: t.articles, icon: BookOpen },
    { id: 'tips', label: t.tips, icon: Lightbulb },
    { id: 'reviews', label: t.reviews, icon: Star },
    { id: 'leaderboard', label: tr('Bonuses & codes', 'Бонусы и коды', 'Bonus va kodlar'), icon: Gift },
  ];
  if (profile?.role === 'admin') library.push({ id: 'admin', label: t.admin, icon: ShieldCheck });

  const used = profile?.aiTokensUsed ?? 0;
  const limit = profile?.aiTokenLimit ?? 15000;
  const quotaPercent = Math.min(100, Math.round((used / limit) * 100));
  const { level } = levelInfo(profile?.xp ?? 0);

  const renderGroup = (title: string | null, items: Item[]) => (
    <div className="space-y-0.5">
      {title && <p className="px-3 pb-1 pt-3 text-xs font-medium text-fg-muted">{title}</p>}
      {items.map(({ id, label, icon: Icon }) => {
        const active = currentView === id;
        return (
          <a
            key={id}
            href={hashFor(id)}
            onClick={onClose}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] transition-colors duration-150 lg:min-h-10 lg:text-sm',
              active ? 'bg-brand-soft font-medium text-brand' : 'text-fg-muted hover:bg-panel-2 hover:text-fg'
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </a>
        );
      })}
    </div>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        aria-label={tr('Sidebar', 'Боковое меню', 'Yon menyu')}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-line bg-panel transition-transform duration-200 lg:static lg:z-auto lg:w-[248px] lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <a href={hashFor('genius_lab')} onClick={onClose} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-on-brand" aria-hidden="true">
              T
            </span>
            <span translate="no" className="text-base font-semibold text-fg">ThinkFlow</span>
          </a>
          <IconButton label={tr('Close menu', 'Закрыть меню', 'Menyuni yopish')} onClick={onClose} className="lg:hidden">
            <X className="size-5" />
          </IconButton>
        </div>

        <nav aria-label={tr('Main', 'Основное', 'Asosiy')} className="scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {renderGroup(null, learn)}
          {renderGroup(tr('People', 'Люди', 'Odamlar'), people)}
          {renderGroup(tr('Library', 'Материалы', 'Materiallar'), library)}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-line p-3">
          <div className="rounded-lg bg-panel-2 p-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-fg">{tr('AI tokens', 'ИИ-токены', 'AI tokenlar')}</span>
              <span className="tabular text-fg-muted">
                {used.toLocaleString()} / {limit >= 1_000_000 ? '∞' : limit.toLocaleString()}
              </span>
            </div>
            <ProgressBar
              value={quotaPercent}
              tone={quotaPercent > 85 ? 'bad' : 'brand'}
              label={tr('AI token usage', 'Расход ИИ-токенов', 'AI token sarfi')}
              className="mt-2"
            />
            <a
              href={hashFor('leaderboard')}
              onClick={onClose}
              className="mt-1 inline-flex min-h-10 cursor-pointer items-center text-sm font-medium text-brand hover:underline"
            >
              {tr('Get more tokens', 'Получить ещё токены', 'Ko‘proq token olish')}
            </a>
          </div>

          <a
            href={hashFor('profile')}
            onClick={onClose}
            aria-current={currentView === 'profile' ? 'page' : undefined}
            className={cn(
              'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left transition-colors duration-150 lg:min-h-10',
              currentView === 'profile' ? 'bg-brand-soft' : 'hover:bg-panel-2'
            )}
          >
            <Avatar name={profile?.name} src={profile?.photoURL} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-fg">{profile?.name}</span>
              <span className="block text-xs text-fg-muted">{tr('Level', 'Уровень', 'Daraja')} {level}</span>
            </span>
          </a>

          <div className="flex gap-2">
            <a
              href={hashFor('settings')}
              onClick={onClose}
              aria-current={currentView === 'settings' ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150 hover:bg-panel-2 hover:text-fg sm:h-9 sm:text-sm',
                currentView === 'settings' ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Settings className="size-4" aria-hidden="true" />
              {t.settings}
            </a>
            <Button variant="ghost" size="sm" className="flex-1 justify-start" onClick={() => signOut()}>
              <LogOut className="size-4" aria-hidden="true" />
              {t.logout}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
