
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  ArrowLeft,
  Loader2,
  User,
  Plus,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChatThread, DirectMessage } from '../../types';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  limit
} from 'firebase/firestore';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useSafety } from '../../lib/safety';
import { ConfirmDialog, ContentMenu, PersonalDataDialog, ReportDialog } from '../Safety/Safety';
import { detectPersonalData } from '../../lib/personalData';

/** What other students can see about a person: name and photo only (never email or age). */
interface PublicProfile {
  uid: string;
  name: string;
  photoURL?: string | null;
}

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
const avatarColor = (name: string) => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const { blocked, isBlocked, block, unblock, report } = useSafety();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendError, setSendError] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dialog, setDialog] = useState<null | 'report' | 'block' | 'unblock'>(null);
  // Contact details and passwords get a "are you sure?" before they are sent.
  const [personalPending, setPersonalPending] = useState<(() => void) | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatThread));
      setThreads(threadsData);
      setLoadError(false);
      setLoading(false);
    }, (error) => {
      console.error("Threads fetch error:", error);
      setLoadError(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedThread) return;

    const q = query(
      collection(db, 'chats', selectedThread.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedThread]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  // Search by name as the student types (debounced), in the public profiles only.
  useEffect(() => {
    const text = searchQuery.trim();
    if (!text) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query(
          collection(db, 'publicProfiles'),
          where('name', '>=', text),
          where('name', '<=', text + ''),
          limit(8)
        );
        const snapshot = await getDocs(q);
        setSearchResults(
          snapshot.docs
            .map(d => ({ uid: d.id, ...d.data() } as PublicProfile))
            .filter(u => u.uid !== user?.uid && !isBlocked(u.uid))
            .slice(0, 5)
        );
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user?.uid, blocked]);

  const startNewChat = async (targetUser: PublicProfile) => {
    if (!user || !profile) return;
    setChatError(false);
    try {
      // Check if thread exists
      const threadId = [user.uid, targetUser.uid].sort().join('_');
      const threadRef = doc(db, 'chats', threadId);
      const threadSnap = await getDoc(threadRef);

      if (!threadSnap.exists()) {
        const newThread: Partial<ChatThread> = {
          participants: [user.uid, targetUser.uid],
          participantNames: {
            [user.uid]: profile.name,
            [targetUser.uid]: targetUser.name
          },
          participantPhotos: {
            [user.uid]: profile.photoURL || null,
            [targetUser.uid]: targetUser.photoURL || null
          },
          lastMessage: tr('New conversation', 'Новый разговор', 'Yangi suhbat'),
          lastTimestamp: Date.now()
        };
        await setDoc(threadRef, newThread);
        setSelectedThread({ id: threadId, ...newThread } as ChatThread);
      } else {
        // Update photos if they exist but might be outdated
        const existingData = threadSnap.data() as ChatThread;
        const updatedPhotos = {
          ...existingData.participantPhotos,
          [user.uid]: profile.photoURL || null,
          [targetUser.uid]: targetUser.photoURL || null
        };
        await updateDoc(threadRef, { participantPhotos: updatedPhotos });
        setSelectedThread({ id: threadId, ...existingData, participantPhotos: updatedPhotos } as ChatThread);
      }
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error("Start chat error:", error);
      setChatError(true);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSendError(false);
    try {
      await addDoc(collection(db, 'chats', selectedThread.id, 'messages'), {
        chatId: selectedThread.id,
        senderId: user.uid,
        text,
        timestamp: Date.now()
      });
      await updateDoc(doc(db, 'chats', selectedThread.id), {
        lastMessage: text,
        lastTimestamp: Date.now()
      });
    } catch (error) {
      console.error("Send error:", error);
      setNewMessage(text);
      setSendError(true);
    }
  };

  const otherId = (thread: ChatThread) => thread.participants.find(id => id !== user?.uid);
  const getOtherParticipantName = (thread: ChatThread) => {
    const id = otherId(thread);
    return id ? thread.participantNames[id] : 'User';
  };
  const getOtherParticipantPhoto = (thread: ChatThread) => {
    const id = otherId(thread);
    return id ? thread.participantPhotos?.[id] : null;
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

  const Avatar: React.FC<{ name: string; photo?: string | null; size: string; light?: boolean }> = ({ name, photo, size, light }) => (
    <div className={`${size} shrink-0 flex items-center justify-center font-black overflow-hidden shadow-lg text-white ${light ? 'bg-white/20' : 'bg-gradient-to-br ' + avatarColor(name)}`} aria-hidden="true">
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : (name[0] || 'U').toUpperCase()}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-24" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')} />
      </div>
    );
  }

  const selectedPeer = selectedThread ? otherId(selectedThread) : undefined;
  const peerName = selectedThread ? getOtherParticipantName(selectedThread) : '';
  const peerBlocked = isBlocked(selectedPeer);
  const lastIncoming = messages.filter((m) => m.senderId !== user?.uid).slice(-3).map((m) => m.text).join(' | ');

  return (
    <div className="h-[calc(100dvh-12rem)] min-h-[440px] flex gap-6 animate-in fade-in duration-700">
      {/* Sidebar Threads List */}
      <div className={`
        flex-col w-full md:w-80 bg-[var(--card)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex
        ${selectedThread ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-5 md:p-6 border-b border-[var(--border)] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white shrink-0" aria-hidden="true">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text)]">{t.messages}</h2>
          </div>
          <label className="relative block">
            <span className="sr-only">{tr('Find a person by name', 'Найти человека по имени', 'Ism bo‘yicha qidirish')}</span>
            <input
              type="text"
              placeholder={tr('Find a person…', 'Найти человека…', 'Odam qidirish…')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          </label>

          {chatError && (
            <p role="alert" className="flex items-center gap-2 text-xs font-bold text-rose-500">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {tr('Could not start the chat.', 'Не удалось начать чат.', 'Chatni boshlab bo‘lmadi.')}
            </p>
          )}

          {searchQuery.trim() && (
            <ul className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              {searchResults.map(u => (
                <li key={u.uid}>
                  <button
                    type="button"
                    onClick={() => startNewChat(u)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-indigo-500/10 transition-all border-b border-[var(--border)] last:border-none"
                  >
                    <Avatar name={u.name} photo={u.photoURL} size="w-10 h-10 rounded-xl" />
                    <p className="font-bold text-sm text-[var(--text)] truncate text-left">{u.name}</p>
                    <Plus className="w-4 h-4 ml-auto shrink-0 text-indigo-500" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {!isSearching && searchResults.length === 0 && (
                <li className="p-4 text-sm font-bold text-[var(--muted)]">{tr('Nobody found.', 'Никого не нашли.', 'Hech kim topilmadi.')}</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loadError && (
            <p role="alert" className="p-4 text-sm font-bold text-rose-500">
              {tr('Could not load your chats. Reload the page.', 'Не удалось загрузить чаты. Обнови страницу.', 'Chatlarni yuklab bo‘lmadi. Sahifani yangilang.')}
            </p>
          )}
          {threads.map(thread => {
            const active = selectedThread?.id === thread.id;
            const isBlockedThread = isBlocked(otherId(thread));
            return (
              <button
                type="button"
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                aria-current={active ? 'true' : undefined}
                className={`
                  w-full p-4 rounded-[1.5rem] flex items-center gap-3 transition-all
                  ${active ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25' : 'hover:bg-[var(--input)] motion-safe:hover:translate-x-0.5 text-[var(--text)]'}
                `}
              >
                <Avatar name={getOtherParticipantName(thread)} photo={getOtherParticipantPhoto(thread)} size="w-12 h-12 rounded-2xl" light={active} />
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-black text-sm truncate">{getOtherParticipantName(thread)}</p>
                  <p className={`text-xs truncate ${active ? 'text-white/80' : 'text-[var(--muted)]'} font-bold`}>
                    {isBlockedThread ? tr('Blocked', 'Заблокирован', 'Bloklangan') : thread.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
          {threads.length === 0 && !loadError && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30" aria-hidden="true">
                <User className="w-8 h-8" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{tr('No chats yet', 'Нет активных чатов', 'Hozircha chat yo‘q')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] flex flex-col relative
        ${!selectedThread ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-[var(--border)] flex items-center gap-3 md:gap-4 rounded-t-[2rem] md:rounded-t-[2.5rem] bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
              <button
                type="button"
                onClick={() => setSelectedThread(null)}
                aria-label={tr('Back to chats', 'К чатам', 'Chatlarga')}
                className="md:hidden w-11 h-11 flex items-center justify-center text-gray-500"
              >
                <ArrowLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <Avatar name={peerName} photo={getOtherParticipantPhoto(selectedThread)} size="w-11 h-11 rounded-2xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[var(--text)] truncate">{peerName}</h3>
              </div>
              <ContentMenu
                label={tr('Chat actions', 'Действия с чатом', 'Chat amallari')}
                items={[
                  { label: tr('Report', 'Пожаловаться', 'Shikoyat qilish'), onClick: () => setDialog('report') },
                  peerBlocked
                    ? { label: tr('Unblock', 'Разблокировать', 'Blokdan chiqarish'), onClick: () => setDialog('unblock') }
                    : { label: tr('Block this person', 'Заблокировать', 'Bloklash'), danger: true, onClick: () => setDialog('block') },
                ]}
              />
            </div>

            <p className="px-4 md:px-6 py-2 flex items-start gap-2 text-xs font-bold text-[var(--muted)] border-b border-[var(--border)] bg-[var(--input)]/40">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              {tr('Never share passwords, your address, phone or photos of documents.', 'Не делись паролями, адресом, телефоном и фото документов.', 'Parollar, manzil, telefon va hujjat rasmlarini yubormang.')}
            </p>

            {/* Messages */}
            <div ref={logRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] md:max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed break-words
                    ${msg.senderId === user?.uid
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/25'
                      : 'bg-[var(--input)] text-[var(--text)] rounded-tl-none border border-[var(--border)]'}
                  `}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-xs mt-1 font-bold tabular-nums ${msg.senderId === user?.uid ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {peerBlocked ? (
              <div className="p-4 md:p-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-bold text-[var(--muted)]">{tr('You blocked this person.', 'Ты заблокировал этого человека.', 'Siz bu odamni blokladingiz.')}</p>
                <Button variant="outline" onClick={() => setDialog('unblock')} className="h-12 px-6 rounded-2xl">
                  <span className="font-black uppercase text-xs tracking-widest">{tr('Unblock', 'Разблокировать', 'Blokdan chiqarish')}</span>
                </Button>
              </div>
            ) : (
              <form
                className="p-4 md:p-6 border-t border-[var(--border)] bg-[var(--bg)]/50 backdrop-blur-md space-y-3"
                onSubmit={(e) => { e.preventDefault(); if (detectPersonalData(newMessage).length > 0) setPersonalPending(() => handleSendMessage); else handleSendMessage(); }}
              >
                {sendError && (
                  <p role="alert" className="flex items-center gap-2 text-sm font-bold text-rose-500">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {tr('Message not sent. The person may have blocked you.', 'Сообщение не отправлено. Возможно, тебя заблокировали.', 'Xabar yuborilmadi. Sizni bloklagan bo‘lishi mumkin.')}
                  </p>
                )}
                <div className="flex gap-3 md:gap-4">
                  <input
                    type="text"
                    aria-label={tr('Message', 'Сообщение', 'Xabar')}
                    placeholder={tr('Write a message…', 'Введите сообщение…', 'Xabar yozing…')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={2000}
                    autoComplete="off"
                    className="flex-1 min-w-0 bg-[var(--input)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    aria-label={tr('Send', 'Отправить', 'Yuborish')}
                    className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 p-0 shadow-lg shadow-indigo-500/30 group"
                  >
                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 shadow-2xl shadow-indigo-500/30 rounded-[2.5rem] flex items-center justify-center text-white mb-8 motion-safe:animate-bounce">
              <MessageSquare className="w-10 h-10" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text)] mb-2">{tr('Your messages', 'Ваши сообщения', 'Xabarlaringiz')}</h3>
            <p className="max-w-xs text-sm font-medium text-[var(--muted)]">{tr('Choose a chat from the list or find a person by name to start talking.', 'Выберите чат из списка или найдите пользователя по имени, чтобы начать общение.', 'Ro‘yxatdan chatni tanlang yoki ism bo‘yicha odam toping.')}</p>
          </div>
        )}
      </div>

      {personalPending && <PersonalDataDialog onSend={personalPending} onClose={() => setPersonalPending(null)} />}

      {dialog === 'report' && selectedPeer && (
        <ReportDialog
          subject={peerName}
          onClose={() => setDialog(null)}
          onSubmit={(reason, details) => report({ targetType: 'user', targetId: selectedPeer, targetUserId: selectedPeer, reason, details, text: lastIncoming })}
        />
      )}
      {dialog === 'block' && selectedPeer && (
        <ConfirmDialog
          title={tr('Block this person?', 'Заблокировать этого человека?', 'Bu odam bloklansinmi?')}
          text={tr('They will not be able to message you. You can unblock them here or in Settings.', 'Он не сможет писать тебе. Разблокировать можно здесь или в настройках.', 'U sizga yoza olmaydi. Bu yerda yoki sozlamalarda blokdan chiqarish mumkin.')}
          confirmLabel={tr('Block', 'Заблокировать', 'Bloklash')}
          danger
          onConfirm={() => block(selectedPeer, peerName)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'unblock' && selectedPeer && (
        <ConfirmDialog
          title={tr('Unblock this person?', 'Разблокировать?', 'Blokdan chiqarilsinmi?')}
          confirmLabel={tr('Unblock', 'Разблокировать', 'Blokdan chiqarish')}
          onConfirm={() => unblock(selectedPeer)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
};
