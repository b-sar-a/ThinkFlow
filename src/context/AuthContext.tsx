
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, Language } from '../types';
import { captureReferral, claimPendingReferral } from '../lib/referral';
import { track } from '../lib/analytics';
import { authedPost } from '../services/http';

const DEMO_UID = 'demo-uid-123';

/** The language the visitor already chose on the landing page (defaults to Russian). */
const savedLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('tf_lang');
    if (saved === 'ru' || saved === 'en' || saved === 'uz') return saved;
  } catch { /* storage blocked */ }
  return 'ru';
};

/** Local calendar day as YYYY-MM-DD (a streak follows the student's own midnight). */
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  geniusMode: boolean;
  setGeniusMode: (mode: boolean) => void;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const geniusMode = profile?.geniusMode ?? true;

  const setGeniusMode = async (mode: boolean) => {
    if (!user) return;
    await updateProfileData({ geniusMode: mode });
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    if (user.uid === DEMO_UID) {
      // The demo account has no Firestore document; keep changes in memory only.
      setProfile(prev => (prev ? { ...prev, ...data } : prev));
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // PRIORITY BYPASS: Demo Mode
    if (email === 'demo@thinkflow.ai' && password === 'demo123456') {
      console.log('Entering Demo Genius Mode...');
      const mockUser = {
        uid: 'demo-uid-123',
        email: 'demo@thinkflow.ai',
        displayName: 'Demo Genius'
      } as unknown as User;
      
      setUser(mockUser);
      setProfile({
        uid: 'demo-uid-123',
        name: 'Demo Genius',
        email: 'demo@thinkflow.ai',
        age: 15,
        interests: ['AI', 'Physics', 'Gaming'],
        xp: 1250,
        level: 12,
        role: 'student',
        language: 'en',
        theme: 'dark',
        geniusMode: true,
        bio: 'Exploring the ThinkFlow universe in Genius Mode.'
      });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName: name });
      
      const profileData: UserProfile = {
        uid: newUser.uid,
        email,
        name,
        age: 15,
        interests: [],
        xp: 0,
        level: 1,
        role: 'student',
        language: savedLanguage(),
        theme: 'light',
        bio: '',
        geniusMode: true,
        onboarded: false,
        aiTokensUsed: 0,
        aiTokenLimit: 15000,
        learningDepth: 'Deep',
        explanationStyle: 'Metaphorical'
      };
      
      await setDoc(doc(db, 'users', newUser.uid), profileData);
      track('signup_completed', { method: 'email' });
    } catch (error) {
      console.error("Sign-Up Error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    // The demo user is set by hand (it is not a Firebase session), so it has to be cleared by hand too.
    if (user?.uid === DEMO_UID) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    await firebaseSignOut(auth);
  };

  // Real deletion: the server removes the data and the login (see server/accountDeletion.ts).
  // Throws Error('REAUTH_REQUIRED' | 'DELETE_UNAVAILABLE' | ...) so the screen can explain what to do.
  const deleteAccount = async () => {
    if (!user) return;
    if (user.uid !== DEMO_UID) {
      await authedPost('/api/account/delete', { confirm: 'DELETE' });
      // Forget this device too (language and theme are harmless and stay).
      try {
        Object.keys(localStorage)
          .filter((k) => (k.startsWith('tf_') && k !== 'tf_lang' && k !== 'tf_theme') || k.startsWith('tf_programs_'))
          .forEach((k) => localStorage.removeItem(k));
      } catch {
        /* storage blocked */
      }
    }
    await signOut();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.uid !== 'demo-uid-123') {
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure critical fields exist for leaderboard and genius mode
          const isOwner = data.email === "skwinskwinskwin@gmail.com";
          if (
            data.xp === undefined || 
            data.level === undefined || 
            data.geniusMode === undefined ||
            data.uid === undefined ||
            data.aiTokensUsed === undefined ||
            data.aiTokenLimit === undefined ||
            (isOwner && (data.role !== "admin" || !data.geniusMode || data.aiTokenLimit !== 1000000))
          ) {
            const updates: Record<string, any> = {};
            if (data.xp === undefined) updates.xp = 0;
            if (data.level === undefined) updates.level = 1;
            if (data.geniusMode === undefined) updates.geniusMode = true;
            if (data.uid === undefined) updates.uid = user.uid;

            if (data.aiTokensUsed === undefined) updates.aiTokensUsed = 0;
            if (data.aiTokenLimit === undefined) updates.aiTokenLimit = isOwner ? 1000000 : 15000;

            if (isOwner) {
              updates.role = "admin";
              updates.geniusMode = true;
              updates.aiTokenLimit = 1000000;
            }
            
            setDoc(userDocRef, updates, { merge: true }).catch(err => {
              console.warn("Could not patch profile with missing fields:", err);
            });
            setProfile({ ...data, ...updates } as UserProfile);
          } else {
            setProfile(data as UserProfile);
          }
        } else {
          // Profile doesn't exist, create a fallback
          const isOwner = user.email === "skwinskwinskwin@gmail.com";
          const newUser: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || 'New User',
            age: 15,
            interests: [],
            xp: 0,
            level: 1,
            role: isOwner ? 'admin' : 'student',
            language: savedLanguage(),
            theme: 'light',
            bio: '',
            geniusMode: true,
            onboarded: false,
            aiTokensUsed: 0,
            aiTokenLimit: isOwner ? 1000000 : 15000,
            learningDepth: 'Deep',
            explanationStyle: 'Metaphorical'
          };
          
          setDoc(userDocRef, newUser).then(() => track('signup_completed', { method: 'google' })).catch(err => {
            console.warn("Could not create initial profile in Firestore:", err);
          });
          
          setProfile(newUser);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile fetch error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Real daily streak: +1 on the first visit of each day, back to 1 after a missed day.
  const streakWriting = useRef(false);
  useEffect(() => {
    if (!user || !profile || user.uid === DEMO_UID || streakWriting.current) return;
    const today = dayKey(new Date());
    if (profile.lastActiveDate === today) return;
    const yesterday = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const streakDays = profile.lastActiveDate === yesterday ? (profile.streakDays ?? 0) + 1 : 1;
    streakWriting.current = true;
    setDoc(
      doc(db, 'users', user.uid),
      { lastActiveDate: today, streakDays, longestStreak: Math.max(profile.longestStreak ?? 0, streakDays) },
      { merge: true }
    )
      .catch(err => console.warn('Could not update streak:', err))
      .finally(() => { streakWriting.current = false; });
  }, [user, profile?.lastActiveDate]);

  // Other students find you by name and see your photo. This public card is all they can read:
  // the full profile (email, age, class) is private to you.
  const publicSynced = useRef('');
  useEffect(() => {
    if (!user || !profile || user.uid === DEMO_UID) return;
    const signature = `${profile.name}|${profile.photoURL ?? ''}`;
    if (publicSynced.current === signature) return;
    publicSynced.current = signature;
    setDoc(
      doc(db, 'publicProfiles', user.uid),
      { uid: user.uid, name: profile.name, photoURL: profile.photoURL ?? null, updatedAt: Date.now() },
      { merge: true }
    ).catch((err) => {
      publicSynced.current = '';
      console.warn('Could not update the public profile:', err);
    });
  }, [user, profile?.name, profile?.photoURL]);

  // Invite links: remember ?ref= on arrival, credit it once the account exists.
  useEffect(() => { captureReferral(); }, []);
  const referralTried = useRef(false);
  useEffect(() => {
    if (!user || !profile || user.uid === DEMO_UID || referralTried.current) return;
    referralTried.current = true;
    claimPendingReferral(user.uid);
  }, [user, profile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthReady, 
      geniusMode, 
      setGeniusMode, 
      updateProfileData,
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut, 
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
