
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from './src/context/AuthContext';
import { useTheme } from './src/context/ThemeContext';
import { useLanguage } from './src/context/LanguageContext';
import { Sidebar } from './src/components/Layout/Sidebar';
import { Navbar } from './src/components/Layout/Navbar';
import { track } from './src/lib/analytics';
const Chat = lazy(() => import('./src/components/Dashboard/Chat').then(m => ({ default: m.Chat })));
const Tasks = lazy(() => import('./src/components/Dashboard/Tasks').then(m => ({ default: m.Tasks })));
const PromoHub = lazy(() => import('./src/components/Dashboard/PromoHub').then(m => ({ default: m.PromoHub })));
const Programs = lazy(() => import('./src/components/Dashboard/Programs').then(m => ({ default: m.Programs })));
const Teacher = lazy(() => import('./src/components/Dashboard/Teacher').then(m => ({ default: m.Teacher })));
const Family = lazy(() => import('./src/components/Dashboard/Family').then(m => ({ default: m.Family })));
const Articles = lazy(() => import('./src/components/Dashboard/Articles').then(m => ({ default: m.Articles })));
const Tips = lazy(() => import('./src/components/Dashboard/Tips').then(m => ({ default: m.Tips })));
const Reviews = lazy(() => import('./src/components/Dashboard/Reviews').then(m => ({ default: m.Reviews })));
const ProfileEditor = lazy(() => import('./src/components/Dashboard/ProfileEditor').then(m => ({ default: m.ProfileEditor })));
const Progress = lazy(() => import('./src/components/Dashboard/Progress').then(m => ({ default: m.Progress })));
const Community = lazy(() => import('./src/components/Dashboard/Community').then(m => ({ default: m.Community })));
const Messages = lazy(() => import('./src/components/Dashboard/Messages').then(m => ({ default: m.Messages })));
const Settings = lazy(() => import('./src/components/Dashboard/Settings').then(m => ({ default: m.Settings })));
const Admin = lazy(() => import('./src/components/Dashboard/Admin').then(m => ({ default: m.Admin })));
const GeniusLab = lazy(() => import('./src/components/Dashboard/GeniusLab').then(m => ({ default: m.GeniusLab })));
import { Landing } from './src/components/Landing/Landing';
import { AuthModal } from './src/components/Auth/AuthModal';
import { GeniusBackground } from './src/components/UI/GeniusBackground';
import { Onboarding } from './src/components/Onboarding/Onboarding';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, profile, loading, isAuthReady, updateProfileData } = useAuth();
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState('genius_lab');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

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

  // Funnel: a visitor who is not signed in sees the landing page.
  useEffect(() => {
    if (isAuthReady && !user) track('landing_view');
  }, [isAuthReady, user]);

  // One signal per device per day when a signed-in student opens the app: it is what shows whether students come back.
  useEffect(() => {
    // The demo account is not a student, so it stays out of the numbers.
    if (isAuthReady && user && user.uid !== 'demo-uid-123') track('active_day');
  }, [isAuthReady, user?.uid]);

  // Close modal when user logs in
  useEffect(() => {
    if (user) {
      setIsAuthModalOpen(false);
    }
  }, [user]);

  // If auth is not ready or loading, show a loader
  if (!isAuthReady || loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl animate-pulse shadow-2xl shadow-indigo-500/20">
            T
          </div>
          <div className="flex items-center gap-3 text-[var(--muted)] font-black uppercase tracking-widest text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.initializing}
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  if (!user) {
    return (
      <>
        <Landing onGetStarted={() => setIsAuthModalOpen(true)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  // If logged in but no profile (shouldn't happen with our signUp), show a loader or setup
  if (!profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-[var(--muted)] font-black uppercase tracking-widest text-xs">{t.settingUpProfile}</p>
        </div>
      </div>
    );
  }

  const needsOnboarding = !profile.onboarded && (profile.interests?.length ?? 0) === 0;

  const renderView = () => {
    switch (currentView) {
      case 'genius_lab': return <GeniusLab onNavigate={setCurrentView} />;
      case 'community': return <Community />;
      case 'messages': return <Messages />;
      case 'tasks': return <Tasks />;
      case 'leaderboard': return <PromoHub />;
      case 'programs': return <Programs onNavigate={setCurrentView} />;
      case 'articles': return <Articles onNavigate={setCurrentView} />;
      case 'tips': return <Tips />;
      case 'reviews': return <Reviews />;
      case 'profile': return <ProfileEditor />;
      case 'progress': return <Progress onNavigate={setCurrentView} />;
      case 'settings': return <Settings onNavigate={setCurrentView} />;
      case 'family': return <Family />;
      case 'teacher': return <Teacher />;
      case 'admin': return <Admin />;
      default: return <GeniusLab onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="h-screen flex text-[var(--text)] transition-colors duration-500 relative overflow-hidden">
      <GeniusBackground />

      {needsOnboarding && <Onboarding onDone={() => setCurrentView('genius_lab')} />}
      
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'md:ml-0' : 'ml-0'} h-full relative z-10`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onViewChange={setCurrentView} />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col pb-24">
            <Suspense
              fallback={
                <div className="flex justify-center py-32" role="status" aria-label="Loading">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              }
            >
              {renderView()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
