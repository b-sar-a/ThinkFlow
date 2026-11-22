
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Bell, Search, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { levelInfo } from '../../lib/progress';

interface NavbarProps {
  onMenuClick: () => void;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onViewChange }) => {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const bellBoxRef = useRef<HTMLDivElement>(null);

  // Quick jump: the search box finds a section by name or by what it is about, in any language.
  const destinations = useMemo(() => {
    const list = [
      { id: 'genius_lab', label: t.geniusLab, keywords: 'lab laboratory course map topic лаборатория курс карта тема laboratoriya kurs' },
      { id: 'programs', label: tr('Programs', 'Программы', 'Dasturlar'), keywords: 'programs courses lessons sat ielts algebra physics exam программы курсы уроки алгебра физика экзамен dastur kurs dars' },
      { id: 'family', label: tr('Parent cabinet', 'Кабинет родителя', 'Ota-ona kabineti'), keywords: 'parent family child code progress родитель семья ребёнок код ota-ona farzand' },
      { id: 'teacher', label: tr('Teacher cabinet', 'Кабинет учителя', "O'qituvchi kabineti"), keywords: 'teacher class classroom students код класса учитель класс ученики oqituvchi sinf' },
      { id: 'tasks', label: t.tasks, keywords: 'tasks problems practice задания задачи практика vazifa masala' },
      { id: 'progress', label: t.progress, keywords: 'progress xp level streak прогресс уровень серия daraja' },
      { id: 'community', label: t.community, keywords: 'community posts feed сообщество посты лента jamoa' },
      { id: 'messages', label: t.messages, keywords: 'messages chat dm сообщения чат xabar' },
      { id: 'articles', label: t.articles, keywords: 'articles read статьи читать maqola' },
      { id: 'tips', label: t.tips, keywords: 'tips sat ielts exam советы экзамен maslahat imtihon' },
      { id: 'reviews', label: t.reviews, keywords: 'reviews feedback отзывы sharh' },
      { id: 'leaderboard', label: tr('Bonuses & Codes', 'Бонусы и коды', 'Bonus va kodlar'), keywords: 'bonus codes promo invite referral tokens бонусы промокод пригласить токены' },
      { id: 'profile', label: t.profile, keywords: 'profile interests photo name профиль интересы фото имя profil' },
      { id: 'settings', label: t.settings, keywords: 'settings language theme depth style настройки язык тема sozlamalar til' },
    ];
    if (profile?.role === 'admin') list.push({ id: 'admin', label: t.admin, keywords: 'admin users analytics админ пользователи аналитика' });
    return list;
  }, [t, language, profile?.role]);

  const text = query.trim().toLowerCase();
  const results = text ? destinations.filter((d) => `${d.label} ${d.keywords}`.toLowerCase().includes(text)).slice(0, 5) : [];

  const choose = (id: string) => {
    onViewChange(id);
    setQuery('');
    setActive(0);
    searchRef.current?.blur();
  };

  // Hints instead of a bell that always showed an unread dot: only real, useful things.
  const used = profile?.aiTokensUsed ?? 0;
  const limit = profile?.aiTokenLimit ?? 15000;
  const toNext = levelInfo(profile?.xp ?? 0).remaining;
  const hints: { text: string; view: string }[] = [];
  if ((profile?.interests?.length ?? 0) === 0) {
    hints.push({ text: tr('Add your interests so explanations feel like yours.', 'Добавь интересы, чтобы объяснения были про тебя.', 'Tushuntirishlar o‘zingiznikidek bo‘lishi uchun qiziqishlarni qo‘shing.'), view: 'profile' });
  }
  if (limit > 0 && limit < 1_000_000 && used / limit >= 0.85) {
    hints.push({ text: tr('AI tokens are almost used up. Get more with codes or invites.', 'ИИ-токены почти закончились. Получи ещё по промокоду или за приглашение.', 'AI tokenlar tugab qoldi. Promo kod yoki taklif orqali oling.'), view: 'leaderboard' });
  }
  if (toNext > 0 && toNext <= 50) {
    hints.push({ text: tr(`Only ${toNext} XP to the next level.`, `До нового уровня всего ${toNext} XP.`, `Keyingi darajagacha atigi ${toNext} XP.`), view: 'genius_lab' });
  }

  // Ctrl/Cmd+K jumps to the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Click outside (or Esc) closes the hints.
  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!bellBoxRef.current?.contains(e.target as Node)) setBellOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setBellOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [bellOpen]);

  const level = levelInfo(profile?.xp ?? 0).level;
  const listboxId = 'nav-search-results';

  return (
    <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-10 bg-[var(--card)]/80 backdrop-blur-xl z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={tr('Open menu', 'Открыть меню', 'Menyuni ochish')}
          className="lg:hidden p-2.5 text-[var(--muted)] hover:bg-[var(--input)] rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div ref={searchBoxRef} className="hidden md:block relative">
          <div className="flex items-center gap-2 bg-[var(--input)] px-4 py-2 rounded-xl border border-[var(--border)] focus-within:border-indigo-500/50 transition-colors">
            <Search className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listboxId}
              aria-label={tr('Go to a section', 'Перейти в раздел', 'Bo‘limga o‘tish')}
              placeholder={tr('Go to… (Ctrl+K)', 'Перейти… (Ctrl+K)', 'O‘tish… (Ctrl+K)')}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active].id); }
                else if (e.key === 'Escape') { setQuery(''); searchRef.current?.blur(); }
              }}
              autoComplete="off"
              className="bg-transparent border-none outline-none text-sm font-medium w-48 text-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>
          {text && (
            <ul id={listboxId} role="listbox" className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl z-50">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--muted)]">{tr('Nothing found', 'Ничего не найдено', 'Hech narsa topilmadi')}</li>
              ) : (
                results.map((r, i) => (
                  <li key={r.id} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(r.id)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${i === active ? 'bg-indigo-600 text-white' : 'text-[var(--text)] hover:bg-[var(--input)]'}`}
                    >
                      {r.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div ref={bellBoxRef} className="relative">
            <button
              type="button"
              onClick={() => setBellOpen((o) => !o)}
              aria-expanded={bellOpen}
              aria-haspopup="true"
              aria-label={hints.length > 0 ? tr(`Hints: ${hints.length}`, `Подсказки: ${hints.length}`, `Maslahatlar: ${hints.length}`) : tr('Hints', 'Подсказки', 'Maslahatlar')}
              className="relative p-2.5 text-[var(--muted)] hover:bg-[var(--input)] rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              {hints.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[var(--card)]" />}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] p-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl z-50">
                {hints.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-[var(--muted)]">{tr('All clear. Nothing needs your attention right now.', 'Всё спокойно. Сейчас ничего не требует внимания.', 'Hammasi joyida. Hozir e’tibor talab qiladigan narsa yo‘q.')}</p>
                ) : (
                  hints.map((h) => (
                    <button
                      key={h.text}
                      type="button"
                      onClick={() => { onViewChange(h.view); setBellOpen(false); }}
                      className="w-full flex items-start gap-3 text-left px-3 py-3 rounded-xl hover:bg-[var(--input)] transition-colors"
                    >
                      <Lightbulb className="w-5 h-5 mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-[var(--text)] leading-snug">{h.text}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onViewChange('progress')}
              aria-label={`${profile?.xp || 0} XP, ${tr('level', 'уровень', 'daraja')} ${level}`}
              className="text-right hidden sm:block rounded-xl px-2 py-1 hover:bg-[var(--input)] transition-colors"
            >
              <p className="text-xs font-black text-[var(--muted)] uppercase tracking-widest">{t.globalXP}</p>
              <p className="text-lg font-black text-indigo-500 leading-none tabular-nums">{profile?.xp || 0}</p>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('profile')}
              aria-label={t.profile}
              className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 overflow-hidden"
            >
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.[0] || 'U'
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
