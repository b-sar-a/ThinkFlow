
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
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
  type Unsubscribe,
} from 'firebase/firestore';
import { Avatar, Button, EmptyState, IconButton, Modal, Notice, PageHeader, Panel, Spinner, TextArea, cn } from '../ds';

export const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const commentsUnsub = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Posts fetch error:', error);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
      commentsUnsub.current?.();
    };
  }, []);

  const handleCreatePost = async () => {
    if (!user || !profile || !newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photoURL || null,
        content: newPostContent.trim(),
        likes: [],
        commentsCount: 0,
        createdAt: Date.now(),
      });
      setNewPostContent('');
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const isLiked = post.likes.includes(user.uid);
    try {
      await updateDoc(doc(db, 'posts', post.id), { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const toggleComments = (postId: string) => {
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
      setComments((prev) => ({ ...prev, [postId]: snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)) }));
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
        createdAt: Date.now(),
      });
      await updateDoc(doc(db, 'posts', postId), { commentsCount: (posts.find((p) => p.id === postId)?.commentsCount || 0) + 1 });
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete));
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setPostToDelete(null);
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={t.community}
        description={tr('Share ideas and questions with other students.', 'Делись идеями и вопросами с другими учениками.', 'G‘oya va savollaringizni boshqa o‘quvchilar bilan bo‘lishing.')}
      />

      <Panel className="p-4">
        <div className="flex gap-3">
          <Avatar name={profile?.name} src={profile?.photoURL} className="mt-1" />
          <div className="min-w-0 flex-1">
            <TextArea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              aria-label={tr('New post', 'Новая запись', 'Yangi yozuv')}
              placeholder={tr('What are you thinking about?', 'О чём ты думаешь?', 'Nima haqida o‘ylayapsiz?')}
              maxLength={2000}
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-fg-muted tabular">{newPostContent.length} / 2000</span>
              <Button onClick={handleCreatePost} disabled={!newPostContent.trim()} loading={isSubmitting}>
                {!isSubmitting && <Send className="size-4" aria-hidden="true" />}
                {tr('Post', 'Опубликовать', 'Joylash')}
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {loadError && (
        <Notice tone="bad" className="mt-4">
          {tr('Could not load the feed. Check your connection and reload the page.', 'Не удалось загрузить ленту. Проверь соединение и обнови страницу.', 'Lentani yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
        </Notice>
      )}

      {posts.length === 0 && !loadError ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users className="size-5" />}
            title={tr('No posts yet', 'Пока нет записей', 'Hozircha yozuvlar yo‘q')}
            text={tr('Write the first one: a question, a tip, or something you just learned.', 'Напиши первую: вопрос, совет или то, что только что узнал.', 'Birinchisini yozing: savol, maslahat yoki hozirgina o‘rgangan narsa.')}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {posts.map((post) => {
            const liked = post.likes.includes(user?.uid || '');
            const open = activePostId === post.id;
            return (
              <li key={post.id}>
                <Panel as="article" className="p-4 sm:p-5">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={post.userName} src={post.userPhoto} />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-fg">{post.userName}</p>
                        <p className="text-sm text-fg-muted">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                    {user?.uid === post.userId && (
                      <IconButton label={tr('Delete post', 'Удалить запись', 'Yozuvni o‘chirish')} onClick={() => setPostToDelete(post.id)}>
                        <Trash2 className="size-[18px]" />
                      </IconButton>
                    )}
                  </header>

                  <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-fg">{post.content}</p>

                  <div className="mt-4 flex items-center gap-1 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => toggleLike(post)}
                      aria-pressed={liked}
                      aria-label={tr('Like', 'Нравится', 'Yoqdi')}
                      className={cn(
                        'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-panel-2',
                        liked ? 'text-bad' : 'text-fg-muted hover:text-fg'
                      )}
                    >
                      <Heart className={cn('size-[18px]', liked && 'fill-current')} aria-hidden="true" />
                      <span className="tabular">{post.likes.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      aria-expanded={open}
                      aria-label={tr('Comments', 'Комментарии', 'Izohlar')}
                      className={cn(
                        'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-panel-2',
                        open ? 'text-brand' : 'text-fg-muted hover:text-fg'
                      )}
                    >
                      <MessageCircle className="size-[18px]" aria-hidden="true" />
                      <span className="tabular">{post.commentsCount}</span>
                    </button>
                  </div>

                  {open && (
                    <div className="mt-3 space-y-3 border-t border-line pt-4">
                      {(comments[post.id] ?? []).map((comment) => (
                        <div key={comment.id} className="flex gap-2.5">
                          <Avatar name={comment.userName} src={comment.userPhoto} className="size-7 text-xs" />
                          <div className="min-w-0 flex-1 rounded-lg bg-panel-2 px-3 py-2">
                            <p className="text-sm font-medium text-fg">{comment.userName}</p>
                            <p className="whitespace-pre-wrap break-words text-[15px] text-fg">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      <form
                        className="flex items-end gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }}
                      >
                        <TextArea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          aria-label={tr('Your comment', 'Твой комментарий', 'Izohingiz')}
                          placeholder={tr('Write a comment…', 'Напиши комментарий…', 'Izoh yozing…')}
                          maxLength={1000}
                          rows={1}
                          className="min-h-11 flex-1 sm:min-h-10"
                        />
                        <Button type="submit" disabled={!newComment.trim()} aria-label={tr('Send comment', 'Отправить комментарий', 'Izohni yuborish')} className="size-11 shrink-0 px-0 sm:size-10">
                          <Send className="size-4" aria-hidden="true" />
                        </Button>
                      </form>
                    </div>
                  )}
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={postToDelete !== null} onClose={() => setPostToDelete(null)} title={tr('Delete this post?', 'Удалить запись?', 'Yozuv o‘chirilsinmi?')}>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPostToDelete(null)}>
            {tr('Cancel', 'Отмена', 'Bekor qilish')}
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            {tr('Delete', 'Удалить', 'O‘chirish')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
