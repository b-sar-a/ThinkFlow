
import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Send,
  Loader2,
  Trash2,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Post, Comment } from '../../types';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit,
  type Unsubscribe
} from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafety } from '../../lib/safety';
import { ConfirmDialog, ContentMenu, PersonalDataDialog, ReportDialog } from '../Safety/Safety';
import { detectPersonalData } from '../../lib/personalData';

// Each person gets a stable avatar colour (class names written out in full for Tailwind).
const AVATAR_COLORS = [
  'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
  'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
  'from-amber-400 to-orange-500 shadow-amber-500/30',
  'from-rose-400 to-pink-600 shadow-rose-500/30',
  'from-cyan-400 to-sky-600 shadow-cyan-500/30',
  'from-purple-400 to-fuchsia-600 shadow-purple-500/30',
  'from-teal-400 to-teal-600 shadow-teal-500/30',
] as const;
const avatarColor = (name?: string) => {
  const text = name || 'U';
  let sum = 0;
  for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

type Pending =
  | { kind: 'report'; targetType: 'post' | 'comment'; id: string; postId?: string; userId: string; userName: string; text: string }
  | { kind: 'block'; userId: string; userName: string }
  | { kind: 'delete'; id: string };

export const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const { isBlocked, block, report } = useSafety();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  // Contact details and passwords get a "are you sure?" before they are posted.
  const [personalPending, setPersonalPending] = useState<(() => void) | null>(null);
  const guarded = (text: string, run: () => void) => {
    if (detectPersonalData(text).length > 0) setPersonalPending(() => run);
    else run();
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const commentsUnsub = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoadError(false);
      setLoading(false);
    }, (error) => {
      console.error("Posts fetch error:", error);
      setLoadError(true);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      commentsUnsub.current?.();
    };
  }, []);

  const handleCreatePost = async () => {
    if (!user || !profile || !newPostContent.trim()) return;
    setIsSubmitting(true);
    setPostError(false);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photoURL || null,
        content: newPostContent.trim(),
        likes: [],
        commentsCount: 0,
        createdAt: Date.now()
      });
      setNewPostContent('');
    } catch (error) {
      console.error("Post creation error:", error);
      setPostError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    const isLiked = post.likes.includes(user.uid);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // One live comment list at a time (the old code left every opened list listening forever).
  const loadComments = (postId: string) => {
    commentsUnsub.current?.();
    commentsUnsub.current = null;
    setNewComment('');
    if (activePostId === postId) {
      setActivePostId(null);
      return;
    }
    setActivePostId(postId);
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    commentsUnsub.current = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !profile || !newComment.trim()) return;
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photoURL || null,
        content: newComment.trim(),
        createdAt: Date.now()
      });
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: (posts.find(p => p.id === postId)?.commentsCount || 0) + 1
      });
      setNewComment('');
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

  const Avatar: React.FC<{ name?: string; photo?: string | null; size?: string }> = ({ name, photo, size = 'w-12 h-12 rounded-2xl' }) => (
    <div className={`${size} bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center text-white font-black flex-shrink-0 overflow-hidden shadow-lg`} aria-hidden="true">
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : (name?.[0] || 'U').toUpperCase()}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')} />
      </div>
    );
  }

  const visiblePosts = posts.filter((p) => !isBlocked(p.userId));

  // Menu for someone else's content: report it, or block the author.
  const othersMenu = (item: { id: string; userId: string; userName: string; text: string; targetType: 'post' | 'comment'; postId?: string }) => (
    <ContentMenu
      label={tr('More actions', 'Ещё действия', 'Boshqa amallar')}
      items={[
        { label: tr('Report', 'Пожаловаться', 'Shikoyat qilish'), onClick: () => setPending({ kind: 'report', targetType: item.targetType, id: item.id, postId: item.postId, userId: item.userId, userName: item.userName, text: item.text }) },
        { label: tr('Block this person', 'Заблокировать автора', 'Muallifni bloklash'), danger: true, onClick: () => setPending({ kind: 'block', userId: item.userId, userName: item.userName }) },
      ]}
    />
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center gap-5">
        <div className="hidden sm:flex w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-600 text-white items-center justify-center shrink-0 shadow-xl shadow-indigo-500/30" aria-hidden="true">
          <Users className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">
            {t.community}
          </h2>
          <p className="text-[var(--muted)] font-medium">
            {tr('Share ideas and questions with other students.', 'Делись идеями и вопросами с другими учениками.', 'G‘oya va savollaringizni boshqa o‘quvchilar bilan bo‘lishing.')}
          </p>
        </div>
      </div>

      {/* Create Post */}
      <Card className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] shadow-xl relative overflow-hidden group focus-within:border-indigo-500/40 focus-within:shadow-indigo-500/10">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="flex gap-4 pt-1">
          <Avatar name={profile?.name} photo={profile?.photoURL} />
          <div className="flex-1 min-w-0 space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              aria-label={tr('New post', 'Новая запись', 'Yangi yozuv')}
              placeholder={tr('What are you thinking about?', 'О чём ты думаешь?', 'Nima haqida o‘ylayapsiz?')}
              maxLength={2000}
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg md:text-xl text-[var(--text)] placeholder:text-[var(--muted)] resize-none custom-scrollbar min-h-[100px]"
            />
            <p className="flex items-start gap-2 text-xs font-bold text-[var(--muted)] leading-relaxed">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {tr('Do not post your address, phone, school or passwords.', 'Не публикуй адрес, телефон, школу и пароли.', 'Manzil, telefon, maktab va parollarni yozmang.')}
            </p>
            {postError && (
              <p role="alert" className="flex items-center gap-2 text-sm font-bold text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {tr('Could not publish. Try again.', 'Не удалось опубликовать. Попробуй ещё раз.', 'Joylab bo‘lmadi. Qayta urinib ko‘ring.')}
              </p>
            )}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--muted)] tabular-nums">{newPostContent.length} / 2000</span>
              <Button
                onClick={() => guarded(newPostContent, handleCreatePost)}
                disabled={isSubmitting || !newPostContent.trim()}
                className="rounded-2xl px-8 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="font-black uppercase text-xs tracking-widest">{tr('Post', 'Опубликовать', 'Joylash')}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {loadError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          {tr('Could not load the feed. Check your connection and reload the page.', 'Не удалось загрузить ленту. Проверь соединение и обнови страницу.', 'Lentani yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
        </div>
      )}

      {visiblePosts.length === 0 && !loadError && (
        <div className="py-16 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-[1.75rem] bg-gradient-to-br from-purple-400 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 motion-safe:animate-bounce" aria-hidden="true">
            <Users className="w-10 h-10" />
          </div>
          <p className="text-xl font-black uppercase tracking-widest text-[var(--text)]">{tr('No posts yet', 'Пока нет записей', 'Hozircha yozuvlar yo‘q')}</p>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">{tr('Write the first one: a question, a tip, or something you just learned.', 'Напиши первую: вопрос, совет или то, что только что узнал.', 'Birinchisini yozing: savol, maslahat yoki hozirgina o‘rgangan narsa.')}</p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {visiblePosts.map((post) => {
          const liked = post.likes.includes(user?.uid || '');
          const open = activePostId === post.id;
          const mine = user?.uid === post.userId;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[var(--border)] hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 motion-safe:hover:-translate-y-0.5 transition-all group">
                <div className="flex justify-between items-start mb-6 gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar name={post.userName} photo={post.userPhoto} />
                    <div className="min-w-0">
                      <h4 className="font-black text-[var(--text)] tracking-tight truncate flex items-center gap-2">
                        <span className="truncate">{post.userName}</span>
                        {mine && <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 text-[10px] font-black uppercase tracking-widest">{tr('You', 'Вы', 'Siz')}</span>}
                      </h4>
                      <p className="text-xs font-bold text-[var(--muted)] tracking-wide">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {mine ? (
                    <button
                      type="button"
                      onClick={() => setPending({ kind: 'delete', id: post.id })}
                      aria-label={tr('Delete post', 'Удалить запись', 'Yozuvni o‘chirish')}
                      className="w-11 h-11 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-[var(--input)] transition-colors"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  ) : (
                    othersMenu({ id: post.id, userId: post.userId, userName: post.userName, text: post.content, targetType: 'post' })
                  )}
                </div>

                <div className="text-lg md:text-xl text-[var(--text)] leading-relaxed mb-8 whitespace-pre-wrap break-words">
                  {post.content}
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    aria-pressed={liked}
                    aria-label={tr('Like', 'Нравится', 'Yoqdi')}
                    className={`min-h-11 px-4 flex items-center gap-2 rounded-full transition-all motion-safe:active:scale-95 ${liked ? 'bg-rose-500/15 text-rose-500' : 'text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
                    <span className="text-sm font-black tabular-nums">{post.likes.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadComments(post.id)}
                    aria-expanded={open}
                    aria-label={tr('Comments', 'Комментарии', 'Izohlar')}
                    className={`min-h-11 px-4 flex items-center gap-2 rounded-full transition-all motion-safe:active:scale-95 ${open ? 'bg-indigo-500/15 text-indigo-500' : 'text-[var(--muted)] hover:bg-indigo-500/10 hover:text-indigo-500'}`}
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-black tabular-nums">{post.commentsCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 space-y-6 pt-6 border-t border-[var(--border)]">
                        <div className="space-y-4">
                          {(comments[post.id] ?? []).filter((c) => !isBlocked(c.userId)).map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar name={comment.userName} photo={comment.userPhoto} size="w-8 h-8 rounded-xl text-xs" />
                              <div className="flex-1 min-w-0 bg-[var(--input)] p-4 rounded-2xl rounded-tl-none">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-black uppercase text-indigo-500 tracking-widest mb-1 truncate">{comment.userName}</p>
                                  {user?.uid !== comment.userId && othersMenu({ id: comment.id, userId: comment.userId, userName: comment.userName, text: comment.content, targetType: 'comment', postId: post.id })}
                                </div>
                                <p className="text-sm text-[var(--text)] whitespace-pre-wrap break-words">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <form
                          className="flex gap-3"
                          onSubmit={(e) => { e.preventDefault(); guarded(newComment, () => handleAddComment(post.id)); }}
                        >
                          <textarea
                            aria-label={tr('Your comment', 'Твой комментарий', 'Izohingiz')}
                            placeholder={tr('Write a comment…', 'Напиши комментарий…', 'Izoh yozing…')}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            maxLength={1000}
                            rows={1}
                            className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 resize-none min-h-12 leading-tight"
                          />
                          <Button
                            type="submit"
                            disabled={!newComment.trim()}
                            aria-label={tr('Send comment', 'Отправить комментарий', 'Izohni yuborish')}
                            className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 p-0 flex items-center justify-center"
                          >
                            <Send className="w-5 h-5" />
                          </Button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {personalPending && <PersonalDataDialog onSend={personalPending} onClose={() => setPersonalPending(null)} />}

      {pending?.kind === 'report' && (
        <ReportDialog
          subject={`${pending.userName}: ${pending.text.slice(0, 60)}`}
          onClose={() => setPending(null)}
          onSubmit={(reason, details) =>
            report({ targetType: pending.targetType, targetId: pending.id, postId: pending.postId, targetUserId: pending.userId, reason, details, text: pending.text })
          }
        />
      )}
      {pending?.kind === 'block' && (
        <ConfirmDialog
          title={tr('Block this person?', 'Заблокировать этого человека?', 'Bu odam bloklansinmi?')}
          text={tr('You will stop seeing their posts and comments, and they cannot message you. You can unblock in Settings.', 'Ты перестанешь видеть его записи и комментарии, а он не сможет писать тебе. Разблокировать можно в настройках.', 'Siz uning yozuvlari va izohlarini ko‘rmaysiz, u sizga yoza olmaydi. Sozlamalarda blokdan chiqarish mumkin.')}
          confirmLabel={tr('Block', 'Заблокировать', 'Bloklash')}
          danger
          onConfirm={() => block(pending.userId, pending.userName)}
          onClose={() => setPending(null)}
        />
      )}
      {pending?.kind === 'delete' && (
        <ConfirmDialog
          title={tr('Delete this post?', 'Удалить запись?', 'Yozuv o‘chirilsinmi?')}
          confirmLabel={tr('Delete', 'Удалить', 'O‘chirish')}
          danger
          onConfirm={() => deletePost(pending.id)}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
};
