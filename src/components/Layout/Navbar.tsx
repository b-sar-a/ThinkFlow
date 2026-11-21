import React from 'react';
import { Flame, Menu, Moon, Sun, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTr } from '../../context/LanguageContext';
import { Badge, IconButton } from '../ds';
import { levelInfo } from '../../lib/progress';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const tr = useTr();
  const { level, total } = levelInfo(profile?.xp ?? 0);
  const streak = profile?.streakDays ?? 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-3 sm:px-5">
      <IconButton label={tr('Open menu', 'Открыть меню', 'Menyuni ochish')} onClick={onMenuClick} className="lg:hidden">
        <Menu className="size-5" />
      </IconButton>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Badge tone="neutral" className="h-8 gap-1.5 px-2.5 text-sm" title={tr('Daily streak', 'Серия дней', 'Kunlik seriya')}>
          <Flame className="size-4" aria-hidden="true" />
          <span className="tabular">{streak}</span>
          <span className="sr-only">{tr('days in a row', 'дней подряд', 'kun ketma-ket')}</span>
        </Badge>
        <Badge tone="hl" className="h-8 gap-1.5 px-2.5 text-sm" title={tr('Experience points', 'Опыт', 'Tajriba')}>
          <Zap className="size-4" aria-hidden="true" />
          <span className="tabular">{total.toLocaleString()} XP</span>
          <span className="hidden sm:inline">· {tr('Lv', 'Ур.', 'Dr.')} {level}</span>
        </Badge>
        <IconButton
          label={theme === 'dark' ? tr('Light theme', 'Светлая тема', 'Yorug‘ mavzu') : tr('Dark theme', 'Тёмная тема', 'Qorong‘u mavzu')}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </IconButton>
      </div>
    </header>
  );
};
