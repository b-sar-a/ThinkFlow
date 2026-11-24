
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Brain, Sparkles, Target, Zap, ArrowRight, Loader2, CheckCircle2, ChevronRight, MessageSquare, Star, AlertCircle, Play, Atom, Code2, Landmark } from 'lucide-react';
import { generateKnowledgeTree, verifyTask } from '../../services/gemini';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { KnowledgeTree, KnowledgeNode } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Chat } from './Chat';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { track } from '../../lib/analytics';
import { LAB_PRESETS, presetTree } from '../../data/labPresets';

// XP from ready-made courses is paid once: the first opening of a course and each challenge once.
// (It is remembered on this device; the AI-made trees cost tokens, which is their own limit.)
interface LabSeen {
  opened: string[];
  nodes: string[];
}
const labSeenKey = (uid: string) => `tf_lab_seen_${uid}`;
const readLabSeen = (uid: string | undefined): LabSeen => {
  if (!uid) return { opened: [], nodes: [] };
  try {
    const raw = JSON.parse(localStorage.getItem(labSeenKey(uid)) || '{}');
    const strings = (x: unknown) => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string').slice(0, 200) : []);
    return { opened: strings(raw.opened), nodes: strings(raw.nodes) };
  } catch {
    return { opened: [], nodes: [] };
  }
};
const writeLabSeen = (uid: string | undefined, seen: LabSeen) => {
  if (!uid) return;
  try {
    localStorage.setItem(labSeenKey(uid), JSON.stringify(seen));
  } catch {
    /* storage blocked: the rule then applies for this visit only */
  }
};

// Icons for the ready-made courses (instead of emoji).
const PRESET_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  physics_ege: Atom,
  python_basics: Code2,
  history_ca: Landmark,
};

// Interest names are stored in English; show them in the interface language.
const INTEREST_LABEL: Record<string, Record<string, string>> = {
  ru: { Sports: 'Спорт', Football: 'Футбол', Chess: 'Шахматы', Anime: 'Аниме', Music: 'Музыка', Design: 'Дизайн', Coding: 'Программирование', Cooking: 'Кулинария', Cars: 'Машины', Business: 'Бизнес', Gaming: 'Игры', Movies: 'Кино', Art: 'Искусство', Fitness: 'Фитнес', Science: 'Наука' },
  uz: { Sports: 'Sport', Football: 'Futbol', Chess: 'Shaxmat', Anime: 'Anime', Music: 'Musiqa', Design: 'Dizayn', Coding: 'Dasturlash', Cooking: 'Pazandachilik', Cars: 'Mashinalar', Business: 'Biznes', Gaming: 'O‘yinlar', Movies: 'Kino', Art: 'San’at', Fitness: 'Fitnes', Science: 'Fan' },
};

interface GeniusLabProps {
  /** Lets the Lab link to other screens (profile, bonuses). */
  onNavigate?: (view: string) => void;
}

export const GeniusLab: React.FC<GeniusLabProps> = ({ onNavigate }) => {
  const { profile, updateProfileData, user } = useAuth();
  const { language, t } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const reduceMotion = useReducedMotion();
  const interestName = (value: string) => INTEREST_LABEL[language]?.[value] ?? value;
  const interests = profile?.interests ?? [];
  // A topic sent from an article ("Explore in the Lab"). Read in the initializer, cleared on mount.
  const [topic, setTopic] = useState(() => {
    try {
      return sessionStorage.getItem('tf_lab_topic') ?? '';
    } catch {
      return '';
    }
  });
  useEffect(() => {
    try {
      sessionStorage.removeItem('tf_lab_topic');
    } catch {
      /* ignore */
    }
  }, []);
  const [tree, setTree] = useState<KnowledgeTree | null>(null);
  // The ready-made course that is open now (null for an AI-made tree).
  const presetRef = useRef<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [floatingXP, setFloatingXP] = useState<{ id: number; amount: number }[]>([]);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [errorIsLimit, setErrorIsLimit] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Real seconds while the AI builds the map (the old progress bar was a fixed 12-second animation).
  useEffect(() => {
    if (!isLoading) return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  const logActivity = async () => {
    if (!user || !profile) return;
    try {
      await addDoc(collection(db, 'genius_lab_activities'), {
        userId: user.uid,
        userName: profile.name || user.displayName || 'Anonymous User',
        email: user.email || '',
        timestamp: Date.now(),
        dateString: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.warn("Could not write daily activity log to cloud storage:", e);
    }
  };

  const handleLaunchPreset = async (presetId: string) => {
    const template = LAB_PRESETS.find(p => p.id === presetId);
    if (!template || !profile) return;
    
    setError(null);
    setErrorIsLimit(false);
    setDebugInfo(null);
    setVerifyFeedback(null);
    setChallengeAnswer('');

    try {
      const currentLabel = template.title[language];
      setTopic(currentLabel);
      
      // Inject preset tree
      const seen = readLabSeen(user?.uid);
      const copyTree = presetTree(template, language);
      // Challenges solved before stay solved.
      copyTree.nodes = copyTree.nodes.map((n) => ({ ...n, completed: seen.nodes.includes(`${template.id}/${n.id}`) }));
      presetRef.current = template.id;
      setTree(copyTree);
      setSelectedNode(copyTree.nodes[0]);
      if (!seen.opened.includes(template.id)) {
        writeLabSeen(user?.uid, { ...seen, opened: [...seen.opened, template.id] });
        await addXPAction(25);
      }
      await logActivity();
    } catch (err) {
      setError(tr('Could not open the course. Try again.', 'Не удалось открыть курс. Попробуй ещё раз.', 'Kursni ochib bo‘lmadi. Qayta urinib ko‘ring.'));
    }
  };

  // Particle Explosion Effect for XP
  const [xpParticles, setXpParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const addXPAction = async (amount: number) => {
    if (!profile || !user) return;
    const newXP = (profile.xp || 0) + amount;
    
    const newLevel = Math.floor(Math.sqrt(newXP) / 5) + 1;
    
    await updateProfileData({ 
      xp: newXP, 
      level: newLevel > profile.level ? newLevel : profile.level 
    });

    // XP Particle Explosion - RAINBOW ENERGT
    const particles = [...Array(15)].map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      color: i % 3 === 0 ? 'text-emerald-400' : i % 3 === 1 ? 'text-purple-400' : 'text-indigo-400'
    }));
    setXpParticles(particles);
    setTimeout(() => setXpParticles([]), 2000);

    const id = Date.now();
    setFloatingXP(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setFloatingXP(prev => prev.filter(x => x.id !== id));
    }, 2000);
  };

  const handleInitialize = async () => {
    if (!topic.trim() || !profile) return;
    setIsLoading(true);
    setError(null);
    setErrorIsLimit(false);
    setDebugInfo(null);
    setVerifyFeedback(null);
    setChallengeAnswer('');
    try {
      presetRef.current = null;
      const generatedTree = await generateKnowledgeTree(topic, profile);
      if (generatedTree && Array.isArray(generatedTree.nodes) && generatedTree.nodes.length > 0) {
        setTree(generatedTree);
        setSelectedNode(generatedTree.nodes[0]);
        track('first_lab_topic');
        addXPAction(25);
        await logActivity();
      } else {
        throw new Error("Invalid structure: AI returned empty tree.");
      }
    } catch (err: any) {
      console.error("Genius Lab Error:", err);
      let msg = err instanceof Error ? err.message : "Failed to initialize lab";
      if (err?.message === "PRO_LIMIT_REACHED") {
        setErrorIsLimit(true);
        if (profile?.language === 'ru') {
          msg = "⚠️ Лимит токенов ИИ исчерпан! Загляни в «Бонусы и Коды», чтобы получить дополнительную квоту для новых карт знаний.";
        } else if (profile?.language === 'uz') {
          msg = "⚠️ AI tokenlar limiti tugadi! Yangi bilim xaritalari uchun qo'shimcha kvotani «Bonuslar & Kodlar» bo'limidan oling.";
        } else {
          msg = "⚠️ AI token quota reached! Check “Bonuses & Codes” to get extra quota for new knowledge trees.";
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setChallengeAnswer('');
    setVerifyFeedback(null);
  };

  const handleCompleteChallenge = async () => {
    if (!selectedNode || !selectedNode.points || !challengeAnswer.trim() || !profile) return;
    
    setIsVerifying(true);
    setVerifyFeedback(null);
    
    try {
      const result = await verifyTask(selectedNode, challengeAnswer, profile);
      
      const nodeKey = presetRef.current ? `${presetRef.current}/${selectedNode.id}` : null;
      const seen = readLabSeen(user?.uid);
      // A challenge pays XP once, however many times it is solved again.
      const alreadyPaid = Boolean(selectedNode.completed) || (nodeKey !== null && seen.nodes.includes(nodeKey));
      const noExtra = tr('(You already completed this challenge, so there is no extra XP.)', '(Это задание уже пройдено, поэтому дополнительных XP нет.)', "(Bu topshiriq avval bajarilgan, shuning uchun qo'shimcha XP yo'q.)");
      setVerifyFeedback({ isCorrect: result.isCorrect, text: result.isCorrect && alreadyPaid ? result.feedback + ' ' + noExtra : result.feedback });

      if (result.isCorrect) {
        const totalAward = (selectedNode.points || 0) + (result.bonusXP || 0);
        if (!alreadyPaid) {
          if (nodeKey) writeLabSeen(user?.uid, { ...seen, nodes: [...seen.nodes, nodeKey] });
          await addXPAction(totalAward);
        }
        
        if (tree) {
          setTree({
            ...tree,
            nodes: tree.nodes.map(n => n.id === selectedNode.id ? { ...n, completed: true } : n)
          });
          setSelectedNode({ ...selectedNode, completed: true });
        }
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      let msg = "AI Verification failed. Try again.";
      if (err?.message === "PRO_LIMIT_REACHED") {
        setErrorIsLimit(true);
        if (profile?.language === 'ru') {
          msg = "⚠️ Лимит токенов ИИ исчерпан! Для проверки решений получи дополнительную квоту в «Бонусы и Коды».";
        } else if (profile?.language === 'uz') {
          msg = "⚠️ AI tokenlar limiti tugadi! Javoblarni tekshirish uchun «Bonuslar & Kodlar» bo'limidan kvota oling.";
        } else {
          msg = "⚠️ AI token quota reached! Get extra quota in “Bonuses & Codes” to verify challenges.";
        }
      }
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetLab = () => {
    setTree(null);
    setSelectedNode(null);
    setTopic('');
    setShowChat(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#020205] overflow-hidden" role="status" aria-live="polite">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(79,70,229,0.15)_0%,_transparent_60%)]" />

        <div className="w-full max-w-3xl space-y-12 relative">
          <div className="relative flex flex-col items-center h-72 justify-center">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={reduceMotion ? undefined : { rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 14 + i * 8, repeat: Infinity, ease: 'linear' }}
                className="absolute border border-indigo-500/30 rounded-full"
                style={{ width: `${260 + i * 90}px`, height: `${260 + i * 90}px`, borderStyle: i % 2 === 0 ? 'solid' : 'dashed' }}
              />
            ))}
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center border border-white/20 shadow-[0_0_60px_rgba(79,70,229,0.45)] relative"
            >
              <Brain className="w-20 h-20 text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,1)]" aria-hidden="true" />
            </motion.div>
          </div>

          <div className="space-y-8 text-center relative z-10">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-[0.2em] uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {t.constructingKnowledge}
              </h2>
              <p className="text-indigo-300 text-sm font-bold tracking-widest uppercase">
                {t.synthesizingNode} <span className="text-white border-b-2 border-indigo-500 pb-1 px-2 normal-case tracking-normal">{topic}</span>
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex justify-between text-xs text-indigo-300 font-bold tracking-widest uppercase">
                <span>{t.systemOptimizing}</span>
                <span className="tabular-nums">{elapsed} {tr('s', 'с', 's')}</span>
              </div>
              <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  animate={reduceMotion ? undefined : { x: ['-100%', '300%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-400">
                {tr('Usually takes 10–20 seconds.', 'Обычно это занимает 10–20 секунд.', 'Odatda 10–20 soniya davom etadi.')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[t.deepUnderstanding, t.personalizedMetaphors, t.skillMastery, t.knowledgeMap].map((label) => (
                <div key={label} className="p-4 rounded-3xl bg-white/5 border border-white/10 text-xs text-gray-300 font-bold uppercase tracking-widest">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center px-6 pt-8 md:pt-14 pb-16 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-10 text-center"
        >
          <div className="space-y-6 relative">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/10">
                <Zap className="w-5 h-5 fill-current" aria-hidden="true" />
                {interests.length > 0
                  ? `${tr('Through your interests', 'Через твои интересы', 'Qiziqishlaringiz orqali')}: ${interests.slice(0, 3).map(interestName).join(' · ')}`
                  : t.nextGenAI}
              </div>
              {profile?.geniusMode && (
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/10">
                  <Sparkles className="w-5 h-5 fill-current" aria-hidden="true" />
                  {t.geniusModeActive}
                </div>
              )}
            </div>

              <h1 className="relative inline-block text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                <span className="relative z-10 text-white mix-blend-overlay">Genius</span>
                <span className="text-indigo-500 drop-shadow-[0_0_50px_rgba(99,102,241,0.8)] px-4">Lab</span>
                
              </h1>
            
            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              {t.geniusLabSub}
            </p>
          </div>

          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Card className="p-3 rounded-[3rem] bg-black/40 border border-white/10 backdrop-blur-2xl relative">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInitialize()}
                  placeholder={t.masterTopic}
                  aria-label={t.masterTopic}
                  maxLength={200}
                  autoComplete="off"
                  className="flex-1 bg-transparent px-8 py-6 outline-none text-xl md:text-2xl font-black text-white placeholder:text-gray-500"
                />
                <Button 
                  onClick={handleInitialize}
                  disabled={isLoading || !topic.trim()}
                  className="h-auto py-6 px-10 rounded-[2.5rem] text-lg gap-4 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      {t.initialize} <Sparkles className="w-6 h-6" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {interests.length === 0 && onNavigate && (
            <p className="text-sm text-gray-400 -mt-4">
              {tr('Add your interests so explanations feel like yours.', 'Добавь интересы, чтобы объяснения были про тебя.', 'Tushuntirishlar o‘zingiznikidek bo‘lishi uchun qiziqishlarni qo‘shing.')}{' '}
              <button type="button" onClick={() => onNavigate('profile')} className="text-indigo-300 underline underline-offset-4 hover:text-white">
                {tr('Add interests', 'Добавить интересы', 'Qiziqish qo‘shish')}
              </button>
            </p>
          )}

          {/* Quick-Start Preset Courses Section */}
          <div className="space-y-6 max-w-4xl mx-auto pt-6">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block text-center">
              {tr('Ready-made courses · no AI tokens spent', 'Готовые курсы · токены не тратятся', 'Tayyor kurslar · token sarflanmaydi')}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LAB_PRESETS.map((tmpl) => (
                <motion.button
                  type="button"
                  key={tmpl.id}
                  whileHover={reduceMotion ? undefined : { scale: 1.05, y: -4 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleLaunchPreset(tmpl.id)}
                  className={`p-6 rounded-[2rem] border min-h-[160px] w-full text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${tmpl.theme}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                  <div className="flex justify-between items-start">
                    {(() => {
                      const PresetIcon = PRESET_ICON[tmpl.id] ?? Atom;
                      return <PresetIcon className="w-9 h-9" aria-hidden="true" />;
                    })()}
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-current opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="space-y-1.5 z-10">
                    <h2 className="font-black text-sm uppercase tracking-tight text-white leading-tight">
                      {tmpl.title[language]}
                    </h2>
                    <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                      {tmpl.nodes.length} {tr('modules', 'модуля', 'modul')} • {tmpl.nodes.reduce((acc, current) => acc + (current.points || 0), 0)} XP
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>


          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 text-rose-400 text-sm font-bold flex flex-col items-center gap-6 max-w-xl mx-auto backdrop-blur-xl"
            >
              <div className="flex items-start gap-4 text-left w-full">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-white text-xl uppercase tracking-tighter font-black">{t.systemFailure}</p>
                  <p className="opacity-80 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
              
              <Button
                onClick={() => (errorIsLimit && onNavigate ? onNavigate('leaderboard') : setError(null))}
                className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl h-14 font-black uppercase tracking-widest text-xs"
              >
                {errorIsLimit && onNavigate ? tr('Get more tokens', 'Получить токены', 'Token olish') : t.tryAgain}
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { icon: Brain, label: t.deepUnderstanding, desc: t.deepUnderstandingDesc },
              { icon: Sparkles, label: t.personalizedMetaphors, desc: t.personalizedMetaphorsDesc },
              { icon: Target, label: t.skillMastery, desc: t.skillMasteryDesc }
            ].map((item, i) => (
              <div key={i} className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5">
                <item.icon className="w-6 h-6 text-indigo-500 mx-auto" />
                <h2 className="text-xs font-black uppercase tracking-widest text-white">{item.label}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const doneCount = tree.nodes.filter((n) => n.completed).length;
  const currentIndex = selectedNode ? tree.nodes.findIndex((n) => n.id === selectedNode.id) : -1;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 p-4 md:p-8 relative">
      {/* Background Neural Overlay for Lab */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(79,70,229,0.1)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
      </div>

      {/* Floating XP Context for Main View */}
      <AnimatePresence>
        {floatingXP.map(xp => (
          <motion.div
            key={xp.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -200 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-32 right-12 z-[100] text-emerald-400 font-black text-6xl pointer-events-none drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]"
          >
            +{xp.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Knowledge Map Sidebar */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4 relative z-10">
        <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-xl mb-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300">{tr('Course progress', 'Прогресс курса', 'Kurs jarayoni')}</span>
            <span className="text-sm font-black text-white tabular-nums">{doneCount} / {tree.nodes.length}</span>
          </div>
          <div
            role="progressbar"
            aria-label={tr('Course progress', 'Прогресс курса', 'Kurs jarayoni')}
            aria-valuemin={0}
            aria-valuemax={tree.nodes.length}
            aria-valuenow={doneCount}
            className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${(doneCount / tree.nodes.length) * 100}%` }} />
          </div>
          {doneCount === tree.nodes.length && (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              {tr('Course completed', 'Курс пройден', 'Kurs yakunlandi')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-400/60">{t.knowledgeMap}</h3>
            <div className="h-0.5 w-12 bg-indigo-500 rounded-full" />
          </div>
          <button 
            onClick={resetLab} 
            className="px-4 py-1.5 rounded-full border border-indigo-500/30 text-xs font-black uppercase text-indigo-400 hover:bg-indigo-500/10 transition-colors shadow-lg shadow-indigo-500/5 backdrop-blur-md"
          >
            {t.newTopic}
          </button>
        </div>
        
        <div className="space-y-4 relative">
          {/* SVG Connection Lines - NEURAL WEB */}
          <div className="absolute left-[34px] top-8 bottom-8 w-px border-l border-dashed border-indigo-500/20 z-0" />

          {tree?.nodes?.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              onClick={() => {
                handleNodeClick(node);
                setShowChat(false);
              }}
              aria-current={selectedNode?.id === node.id ? 'step' : undefined}
              className={`
                w-full p-6 rounded-[2.2rem] border text-left transition-all relative overflow-hidden group z-10
                ${selectedNode?.id === node.id 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_25px_50px_rgba(79,70,229,0.4)] scale-[1.03]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:scale-[1.01] backdrop-blur-md'}
              `}
            >
              {/* Scanline effect for active node */}
              {selectedNode?.id === node.id && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%),_linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%]" />
              )}

              <div className="flex items-center gap-5 relative z-10">
                <div className={`
                  w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500
                  ${selectedNode?.id === node.id ? 'bg-white text-indigo-600 rotate-12' : 'bg-indigo-600/20 text-indigo-400'}
                  shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]
                `}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-sm tracking-tight truncate uppercase italic">{node.label}</span>
                  {node.points && <span className={`text-xs font-bold tracking-widest ${selectedNode?.id === node.id ? 'text-white/80' : 'text-indigo-300'}`}>+{node.points} XP</span>}
                </div>
                {selectedNode?.id === node.id && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-auto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
              {node.completed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* XP Particle Explosion Overlay */}
        <AnimatePresence>
          {xpParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 2, x: p.x, y: p.y }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 top-1/2 z-[200] pointer-events-none ${p.color}`}
            >
              <Zap className="w-8 h-8 fill-current blur-[0.5px]" />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="h-full bg-black/20 rounded-[3rem] border border-white/5 backdrop-blur-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowChat(false)} 
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl"
                  >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                  </Button>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-indigo-300 uppercase tracking-widest leading-none">{tr('AI assistant', 'ИИ-ассистент', 'AI yordamchi')}</p>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">{t.askAbout} {selectedNode?.label}</h2>
                  </div>
                </div>
              </div>
              <Chat type="genius" context={selectedNode?.label} />
            </motion.div>
          ) : selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col space-y-8"
            >
              <Card className="p-6 md:p-10 rounded-[3rem] bg-black/40 border border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl group/main">
                {/* Rainbow Energy Border Animation */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20 blur-2xl group-hover/main:opacity-40 transition-opacity duration-700 animate-gradient-x" />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                  <Brain className="w-80 h-80" />
                </div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/30" />
                      <div className="text-xs font-black uppercase tracking-[0.6em] text-indigo-500 drop-shadow-sm">{t.nodeExplanation}</div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/30" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic text-center break-words">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                      >
                        {selectedNode.label}
                      </motion.span>
                    </h2>
                  </div>
 
                  <div className="grid grid-cols-1 min-[1800px]:grid-cols-2 gap-10 items-start">
                    <div className="space-y-10">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 md:p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/20 space-y-6 relative overflow-hidden group shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 text-indigo-400 relative z-10">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-[0.3em]">{t.theMetaphor}</span>
                        </div>
                        <p className="text-2xl font-bold text-white italic leading-relaxed relative z-10 drop-shadow-md">
                          "{selectedNode.metaphor}"
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{tr('In detail', 'Подробнее', 'Batafsil')}</div>
                        <p className="text-gray-400 leading-relaxed text-xl font-medium px-1">
                          {selectedNode.description}
                        </p>
                      </motion.div>
                    </div>
 
                    <div className="space-y-8">
                      <div className="relative group/card">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur opacity-10 group-hover/card:opacity-20 transition duration-500" />
                        <div className="p-6 md:p-8 rounded-[2.5rem] bg-emerald-600/5 border border-emerald-500/20 space-y-8 relative backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <div className="flex items-center gap-3">
                              <Target className="w-6 h-6" />
                              <span className="text-xs font-black uppercase tracking-[0.3em]">{t.geniusChallenge}</span>
                            </div>
                            {selectedNode.points && (
                              <div className="px-5 py-2 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-black tracking-widest border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
                                {t.rewardLabel} <span className="text-white ml-2">+{selectedNode.points} XP</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-white text-lg font-bold leading-relaxed">
                            {selectedNode.challenge}
                          </p>

                          <div aria-live="polite">
                                <AnimatePresence>
                                  {verifyFeedback && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className={`p-6 rounded-3xl text-sm font-bold border flex gap-4 ${
                                        verifyFeedback.isCorrect 
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                      }`}
                                    >
                                      <div className="shrink-0 pt-1">
                                        {verifyFeedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                      </div>
                                      <p className="leading-relaxed">{verifyFeedback.text}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                          </div>

                          {!selectedNode.completed && (
                            <div className="space-y-6">
                              <div className="relative">
                                <textarea
                                  value={challengeAnswer}
                                  onChange={(e) => setChallengeAnswer(e.target.value)}
                                  placeholder={t.geniusAnswerPlaceholder}
                                  aria-label={t.geniusChallenge}
                                  maxLength={1000}
                                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCompleteChallenge(); }}
                                  className="w-full h-32 bg-black/40 border border-white/10 rounded-3xl p-6 text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all custom-scrollbar resize-none font-medium shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4 text-xs font-black text-gray-600 tracking-widest uppercase">
                                  {challengeAnswer.length} / 1000
                                </div>
                              </div>
                              
                              <Button 
                                onClick={handleCompleteChallenge}
                                disabled={isVerifying || !challengeAnswer.trim()}
                                className="w-full h-16 gap-3 bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-600/30 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100"
                              >
                                {isVerifying ? (
                                  <><Loader2 className="w-6 h-6 animate-spin" /> {t.verifyingAI}</>
                                ) : (
                                  <><CheckCircle2 className="w-6 h-6" /> {t.submitVerification}</>
                                )}
                              </Button>
                            </div>
                          )}

                          {selectedNode.completed && (
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="p-6 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.2em] shadow-xl"
                            >
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7" />
                              </div>
                              {t.nodeMastered}
                            </motion.div>
                          )}
                        </div>
                      </div>
 
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChat(true)}
                        className="w-full h-20 rounded-[2rem] border-white/10 hover:bg-white/5 gap-4 shadow-xl text-lg font-black uppercase tracking-widest group"
                      >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" /> {t.askSidekick}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
 
              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 px-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 bg-indigo-500 rounded-full border border-black animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">{t.architectingMind}</span>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    disabled={currentIndex <= 0}
                    onClick={() => handleNodeClick(tree.nodes[currentIndex - 1])}
                    className="rounded-2xl px-6 h-12 bg-white/5 hover:bg-white/10 text-xs font-black tracking-widest uppercase border border-white/5"
                  >
                    {t.previous}
                  </Button>
                  <Button 
                    variant="ghost"
                    disabled={currentIndex === -1 || currentIndex >= tree.nodes.length - 1}
                    onClick={() => handleNodeClick(tree.nodes[currentIndex + 1])}
                    className="rounded-2xl px-8 h-12 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-black tracking-widest uppercase border border-indigo-500/20 gap-3"
                  >
                    {t.next} <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
