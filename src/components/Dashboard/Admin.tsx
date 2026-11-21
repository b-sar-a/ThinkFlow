
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, MessageSquare, Trash2, CheckCircle, Loader2, TrendingUp, Flame, Award, Calendar, DollarSign, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, Review } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reviews' | 'investor_analytics'>('users');

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
    });

    const reviewsRef = collection(db, 'reviews');
    const qReviews = query(reviewsRef, orderBy('timestamp', 'desc'));
    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(reviewsData);
      setLoading(false);
    });

    const activitiesRef = collection(db, 'genius_lab_activities');
    const unsubscribeActivities = onSnapshot(activitiesRef, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => doc.data());
      setActivities(activitiesData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeReviews();
      unsubscribeActivities();
    };
  }, [profile]);

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const toggleAdmin = async (uid: string, currentRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: currentRole === 'admin' ? 'student' : 'admin' 
      });
    } catch (error) {
      console.error("Toggle admin error:", error);
    }
  };

  const computeRetention = () => {
    const activeDataList = activities;

    const userDates: Record<string, { name: string; email: string; dates: Set<string> }> = {};
    activeDataList.forEach(act => {
      if (!act.userId) return;
      if (!userDates[act.userId]) {
        userDates[act.userId] = {
          name: act.userName || 'User',
          email: act.email || 'user@thinkflow.ai',
          dates: new Set<string>()
        };
      }
      if (act.dateString) {
        userDates[act.userId].dates.add(act.dateString);
      }
    });

    let retainedCount = 0;
    const totalUsers = Object.keys(userDates).length;
    const userStreaks: { name: string; email: string; streak: number; isRetained: boolean }[] = [];

    Object.keys(userDates).forEach(uid => {
      const u = userDates[uid];
      const sortedDates = Array.from(u.dates).sort();
      
      let currentStreak = 0;
      let maxStreak = 0;
      let has3ConsecutiveDays = false;
      
      if (sortedDates.length > 0) {
        currentStreak = 1;
        maxStreak = 1;
        
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const d1 = new Date(sortedDates[i]).getTime();
          const d2 = new Date(sortedDates[i+1]).getTime();
          const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
          
          if (Math.round(diff) === 1) {
            currentStreak++;
            if (currentStreak > maxStreak) {
              maxStreak = currentStreak;
            }
          } else if (Math.round(diff) > 1) {
            currentStreak = 1;
          }
        }
      }

      if (maxStreak >= 3) {
        has3ConsecutiveDays = true;
        retainedCount++;
      }

      userStreaks.push({
        name: u.name,
        email: u.email,
        streak: maxStreak,
        isRetained: has3ConsecutiveDays
      });
    });

    const retentionRate = totalUsers > 0 ? Math.round((retainedCount / totalUsers) * 100) : 0;
    
    // Growth KPIs based on real users (no revenue while the product is free)
    const totalUsersCount = users.length;
    const activatedCount = users.filter(u => (u.xp || 0) > 0).length;
    const activationRate = totalUsersCount > 0 ? Math.round((activatedCount / totalUsersCount) * 100) : 0;

    return {
      retentionRate,
      totalAuditedUsers: totalUsers,
      retainedUsers: retainedCount,
      activeRecords: activeDataList.length,
      userStreaks: userStreaks.sort((a, b) => b.streak - a.streak),
      totalUsersCount,
      activatedCount,
      activationRate
    };
  };

  const retentionData = computeRetention();

  if (profile?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text)]">Access Denied</h2>
        <p className="text-[var(--muted)] mt-2">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            Admin Panel
          </h2>
          <p className="text-[var(--muted)] font-medium mt-2">
            System management and oversight.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-505/20' : 'bg-[var(--input)] text-[var(--muted)]'}`}
          >
            Users ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-505/20' : 'bg-[var(--input)] text-[var(--muted)]'}`}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            onClick={() => setActiveTab('investor_analytics')}
            className={`px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'investor_analytics' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-505/20' : 'bg-[var(--input)] text-[var(--muted)]'}`}
          >
            📈 Investor Analytics (VC Metric)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
      ) : activeTab === 'users' ? (
        <div className="grid grid-cols-1 gap-4">
          {users.map(u => (
            <Card key={u.uid} className="p-6 rounded-3xl border border-[var(--border)] flex items-center justify-between animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center font-black text-indigo-500 border border-indigo-500/25">
                  {u.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm text-[var(--text)] flex items-center gap-2">
                    {u.name}
                  </h4>
                  <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest">{u.email} • {u.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-xs font-black text-[var(--text)]">{u.xp} XP</p>
                  <p className="text-[9px] font-black uppercase text-[var(--muted)]">Level {u.level}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAdmin(u.uid, u.role)}
                  className={`rounded-xl h-10 px-4 text-[10px] ${u.role === 'admin' ? 'border-rose-500 text-rose-500' : 'border-indigo-500 text-indigo-500'}`}
                >
                  {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map(r => (
            <Card key={r.id} className="p-6 rounded-3xl border border-[var(--border)] flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black uppercase text-xs text-[var(--text)]">{r.userName}</span>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: r.rating }).map((_, i) => <CheckCircle key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)] italic">"{r.text}"</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteReview(r.id!)}
                className="rounded-xl h-10 w-10 p-0 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        /* --- HIGH IMPACT INVESTOR RETENTION PANEL (VC COHORT metric) --- */
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Row - KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The Big Retention Circular Widget */}
            <Card className="p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden md:col-span-2 flex flex-col md:flex-row items-center gap-8">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-44 h-44">
                  <circle cx="88" cy="88" r="76" className="stroke-white/5" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    className="stroke-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                    strokeWidth="14" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={2 * Math.PI * 76 * (1 - retentionData.retentionRate / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 88 88)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white italic leading-none">{retentionData.retentionRate}%</span>
                  <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase mt-1">3-Day Retention</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" /> High-Habit Cohort
                </div>
                <h3 className="text-2xl font-black uppercase text-white italic tracking-tight">
                  Habitual Retention Metric
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                  Tracks the exact percentage of users who logged into Genius Lab for at least <b>3 consecutive days</b>. EdTech VCs buy this parameter because consecutive learning indicates a high habit formation index and near-zero churn rates.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-gray-500 block uppercase">Retained Kids</span>
                    <span className="text-lg font-black text-white">{retentionData.retainedUsers}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-gray-500 block uppercase">Audited Users</span>
                    <span className="text-lg font-black text-white">{retentionData.totalAuditedUsers}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* General VC pitch metric cards */}
            <div className="flex flex-col gap-4">
              <Card className="p-6 rounded-[2rem] border border-indigo-500/20 bg-indigo-950/5 relative overflow-hidden flex flex-col justify-between flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase">Registered Students</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-white italic">{retentionData.totalUsersCount}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Total accounts created on the platform.</p>
                </div>
              </Card>

              <Card className="p-6 rounded-[2rem] border border-amber-500/20 bg-amber-950/5 relative overflow-hidden flex flex-col justify-between flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-amber-400 tracking-wider uppercase">Activation Rate</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-white italic">{retentionData.activationRate}%</h4>
                  <p className="text-[10px] text-gray-400 mt-1">{retentionData.activatedCount} students earned XP at least once.</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Table - Cohort List and streaks */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest pl-2">
              🔥 USER DAILY ACTIVE STREAKS (GENIUS LAB)
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {retentionData.userStreaks.length > 0 ? (
                retentionData.userStreaks.map((u, i) => (
                  <Card key={i} className="p-5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        u.isRetained ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-400'
                      }`}>
                        {u.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h5 className="font-black uppercase text-xs text-white">{u.name}</h5>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-amber-400">
                          <Flame className="w-3.5 h-3.5 fill-current animate-pulse" /> {u.streak} {profile?.language === 'ru' ? 'дн. подряд' : 'consecutive days'}
                        </div>
                      </div>
                      <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                        u.isRetained ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        {u.isRetained ? 'RETAINED' : 'ACTIVE'}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-[2.5rem] text-[var(--muted)]">
                  <Flame className="w-12 h-12 text-indigo-500/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No active student streaks recorded yet.</p>
                  <p className="text-[10px] mt-1 max-w-sm mx-auto">Real-time daily active streaks will sync here automatically once students start launching presets and completing knowledge trees in the Genius Lab.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
