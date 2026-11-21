
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from './src/context/AuthContext';
import { useLanguage } from './src/context/LanguageContext';
import { useTheme } from './src/context/ThemeContext';
import { Sidebar } from './src/components/Layout/Sidebar';
import { Navbar } from './src/components/Layout/Navbar';
import { Landing } from './src/components/Landing/Landing';
import { AuthModal } from './src/components/Auth/AuthModal';
import { Onboarding } from './src/components/Onboarding/Onboarding';
import { Spinner } from './src/components/ds';
import { hashFor, viewFromHash, type ViewId } from './src/lib/nav';

/**
 * Lazy view that survives a new deployment: if the browser still holds an old page and a
 * chunk it asks for no longer exists, reload once instead of showing an error.
 */
const lazyView = <T extends React.ComponentType<any>>(load: () => Promise<{ default: T }>) =>
  lazy(async () => {
    try {
      return await load();
    } catch (error) {
      const key = 'tf_chunk_reload';
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
        sessionStorage.removeItem(key);
      } catch { /* storage blocked: fall through to the error screen */ }
      throw error;
    }
  });

const Tasks = lazyView(() => import('./src/components/Dashboard/Tasks').then(m => ({ default: m.Tasks })));
const PromoHub = lazyView(() => import('./src/components/Dashboard/PromoHub').then(m => ({ default: m.PromoHub })));
const Articles = lazyView(() => import('./src/components/Dashboard/Articles').then(m => ({ default: m.Articles })));
const Tips = lazyView(() => import('./src/components/Dashboard/Tips').then(m => ({ default: m.Tips })));
const Reviews = lazyView(() => import('./src/components/Dashboard/Reviews').then(m => ({ default: m.Reviews })));
const ProfileEditor = lazyView(() => import('./src/components/Dashboard/ProfileEditor').then(m => ({ default: m.ProfileEditor })));
const Progress = lazyView(() => import('./src/components/Dashboard/Progress').then(m => ({ default: m.Progress })));
const Community = lazyView(() => import('./src/components/Dashboard/Community').then(m => ({ default: m.Community })));
const Messages = lazyView(() => import('./src/components/Dashboard/Messages').then(m => ({ default: m.Messages })));
const Settings = lazyView(() => import('./src/components/Dashboard/Settings').then(m => ({ default: m.Settings })));
const Admin = lazyView(() => import('./src/components/Dashboard/Admin').then(m => ({ default: m.Admin })));
const GeniusLab = lazyView(() => import('./src/components/Dashboard/GeniusLab').then(m => ({ default: m.GeniusLab })));

const App: React.FC = () => {
  const { user, profile, loading, isAuthReady, updateProfileData } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewId>(() => viewFromHash(window.location.hash) ?? 'genius_lab');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  // The browser toolbar takes the workspace colour while signed in (the landing page keeps its own).
  useEffect(() => {
    if (!user) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = meta?.content;
    if (meta) meta.content = theme === 'dark' ? '#151a21' : '#ffffff';
    return () => { if (meta && previous) meta.content = previous; };
  }, [user, theme]);

  // Addresses like /#/progress: the browser Back button and shared links work.
  useEffect(() => {
    const onHashChange = () => setCurrentView(viewFromHash(window.location.hash) ?? 'genius_lab');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const changeView = (view: ViewId) => {
    if (window.location.hash !== hashFor(view)) window.location.hash = hashFor(view);
    setCurrentView(view);
  };

  // After a screen change, move focus to the content so keyboard and screen-reader users start there.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [currentView]);

  // One source of truth for language: the saved profile wins at login, and later changes
  // made in the UI are written back (the AI answers in profile.language).
  const languageSynced = useRef(false);
  useEffect(() => {
    if (!profile) { languageSynced.current = false; return; }
    if (!languageSynced.current) {
      languageSynced.current = true;
      if (profile.language && profile.language !== language) setLanguage(profile.language);
    }
  }, [profile]);
  useEffect(() => {
    if (profile && languageSynced.current && profile.language !== language) {
      updateProfileData({ language }).catch(() => {});
    }
  }, [language]);

  // Close modal when user logs in
  useEffect(() => {
    if (user) setIsAuthModalOpen(false);
  }, [user]);

  if (!isAuthReady || loading) {
    return (
      <div className="app-shell flex min-h-dvh items-center justify-center">
        <Spinner label={t.initializing} />
      </div>
    );
  }

  // Not signed in: the landing page and sign-in modal keep their own design.
  if (!user) {
    return (
      <>
        <Landing onGetStarted={() => setIsAuthModalOpen(true)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  if (!profile) {
    return (
      <div className="app-shell flex min-h-dvh items-center justify-center">
        <Spinner label={t.settingUpProfile} />
      </div>
    );
  }

  const needsOnboarding = !profile.onboarded && (profile.interests?.length ?? 0) === 0;

  const renderView = () => {
    switch (currentView) {
      case 'community': return <Community />;
      case 'messages': return <Messages />;
      case 'tasks': return <Tasks />;
      case 'leaderboard': return <PromoHub />;
      case 'articles': return <Articles />;
      case 'tips': return <Tips />;
      case 'reviews': return <Reviews />;
      case 'profile': return <ProfileEditor />;
      case 'progress': return <Progress />;
      case 'settings': return <Settings />;
      case 'admin': return <Admin />;
      default: return <GeniusLab />;
    }
  };

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <a
        href="#main"
        onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); }}
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-on-brand focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {language === 'ru' ? 'К содержимому' : language === 'uz' ? 'Kontentga o‘tish' : 'Skip to content'}
      </a>

      {needsOnboarding && <Onboarding onDone={() => changeView('genius_lab')} />}

      <Sidebar
        currentView={currentView}
        onViewChange={changeView}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMenuOpen(true)} />

        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className="scroll-area paper min-h-0 flex-1 overflow-y-auto outline-none"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
            <Suspense fallback={<Spinner />}>{renderView()}</Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
