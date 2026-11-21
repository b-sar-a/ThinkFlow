
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, Search, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { ChatThread, DirectMessage, UserProfile } from '../../types';
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
  limit,
} from 'firebase/firestore';
import { Avatar, Button, EmptyState, IconButton, Notice, PageHeader, Panel, Spinner, TextInput, cn } from '../ds';

export const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendError, setSendError] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('lastTimestamp', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setThreads(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ChatThread)));
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Threads fetch error:', error);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedThread) return;
    const q = query(collection(db, 'chats', selectedThread.id, 'messages'), orderBy('timestamp', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DirectMessage)));
    });
    return () => unsubscribe();
  }, [selectedThread]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  // Search people by name as the student types (debounced).
  useEffect(() => {
    const text = searchQuery.trim();
    if (!text) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query(collection(db, 'users'), where('name', '>=', text), where('name', '<=', text + ''), limit(5));
        const snapshot = await getDocs(q);
        setSearchResults(snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)).filter((u) => u.uid !== user?.uid));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user?.uid]);

  const startNewChat = async (targetUser: UserProfile) => {
    if (!user || !profile) return;
    const threadId = [user.uid, targetUser.uid].sort().join('_');
    const threadRef = doc(db, 'chats', threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) {
      const newThread: Partial<ChatThread> = {
        participants: [user.uid, targetUser.uid],
        participantNames: { [user.uid]: profile.name, [targetUser.uid]: targetUser.name },
        participantPhotos: { [user.uid]: profile.photoURL || null, [targetUser.uid]: targetUser.photoURL || null },
        lastMessage: tr('New conversation', 'Новый разговор', 'Yangi suhbat'),
        lastTimestamp: Date.now(),
      };
      await setDoc(threadRef, newThread);
      setSelectedThread({ id: threadId, ...newThread } as ChatThread);
    } else {
      const existingData = threadSnap.data() as ChatThread;
      const updatedPhotos = {
        ...existingData.participantPhotos,
        [user.uid]: profile.photoURL || null,
        [targetUser.uid]: targetUser.photoURL || null,
      };
      await updateDoc(threadRef, { participantPhotos: updatedPhotos });
      setSelectedThread({ id: threadId, ...existingData, participantPhotos: updatedPhotos } as ChatThread);
    }
    setSearchQuery('');
    setSearchResults([]);
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
        timestamp: Date.now(),
      });
      await updateDoc(doc(db, 'chats', selectedThread.id), { lastMessage: text, lastTimestamp: Date.now() });
    } catch (error) {
      console.error('Send error:', error);
      setNewMessage(text);
      setSendError(true);
    }
  };

  const otherId = (thread: ChatThread) => thread.participants.find((id) => id !== user?.uid);
  const otherName = (thread: ChatThread) => (otherId(thread) ? thread.participantNames[otherId(thread)!] : 'User');
  const otherPhoto = (thread: ChatThread) => (otherId(thread) ? thread.participantPhotos?.[otherId(thread)!] : null) ?? undefined;

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title={t.messages} />
      {loadError && (
        <Notice tone="bad" className="mb-4">
          {tr('Could not load your chats. Check your connection and reload the page.', 'Не удалось загрузить чаты. Проверь соединение и обнови страницу.', 'Chatlarni yuklab bo‘lmadi. Internetni tekshirib, sahifani yangilang.')}
        </Notice>
      )}

      <div className="flex h-[calc(100dvh-15rem)] min-h-[440px] gap-4">
        {/* Conversations */}
        <Panel className={cn('flex w-full flex-col overflow-hidden md:w-80 md:shrink-0', selectedThread ? 'hidden md:flex' : 'flex')}>
          <div className="border-b border-line p-3">
            <label className="relative block">
              <span className="sr-only">{tr('Find a person', 'Найти человека', 'Odam qidirish')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
              <TextInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr('Find a person by name', 'Найти человека по имени', 'Ism bo‘yicha qidirish')}
                className="pl-9"
                autoComplete="off"
              />
            </label>
            {searchQuery.trim() && (
              <ul className="mt-2 space-y-0.5">
                {searchResults.map((result) => (
                  <li key={result.uid}>
                    <button
                      type="button"
                      onClick={() => startNewChat(result)}
                      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left transition-colors duration-150 hover:bg-panel-2"
                    >
                      <Avatar name={result.name} src={result.photoURL} />
                      <span className="truncate text-[15px] text-fg">{result.name}</span>
                    </button>
                  </li>
                ))}
                {!isSearching && searchResults.length === 0 && (
                  <li className="px-2 py-2 text-sm text-fg-muted">{tr('Nobody found.', 'Никого не нашли.', 'Hech kim topilmadi.')}</li>
                )}
              </ul>
            )}
          </div>

          <ul className="scroll-area min-h-0 flex-1 overflow-y-auto p-2">
            {threads.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-fg-muted">
                {tr('No chats yet. Find a person above to start one.', 'Чатов пока нет. Найди человека выше, чтобы начать.', 'Hozircha chat yo‘q. Boshlash uchun yuqorida odam qidiring.')}
              </li>
            )}
            {threads.map((thread) => {
              const active = selectedThread?.id === thread.id;
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedThread(thread)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150',
                      active ? 'bg-brand-soft' : 'hover:bg-panel-2'
                    )}
                  >
                    <Avatar name={otherName(thread)} src={otherPhoto(thread)} className="size-10" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-[15px] font-medium', active ? 'text-brand' : 'text-fg')}>{otherName(thread)}</span>
                        <span className="shrink-0 text-xs text-fg-muted tabular">{formatTime(thread.lastTimestamp)}</span>
                      </span>
                      <span className="block truncate text-sm text-fg-muted">{thread.lastMessage}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Conversation */}
        <Panel className={cn('min-w-0 flex-1 flex-col overflow-hidden', selectedThread ? 'flex' : 'hidden md:flex')}>
          {selectedThread ? (
            <>
              <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
                <IconButton label={tr('Back to chats', 'К чатам', 'Chatlarga')} onClick={() => setSelectedThread(null)} className="md:hidden">
                  <ArrowLeft className="size-5" />
                </IconButton>
                <Avatar name={otherName(selectedThread)} src={otherPhoto(selectedThread)} />
                <h2 className="truncate text-[15px] font-semibold text-fg">{otherName(selectedThread)}</h2>
              </div>

              <div ref={logRef} role="log" aria-live="polite" className="scroll-area min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((message) => {
                  const mine = message.senderId === user?.uid;
                  return (
                    <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[80%] break-words rounded-xl px-3.5 py-2 text-[15px]', mine ? 'bg-brand text-on-brand' : 'border border-line bg-panel-2 text-fg')}>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p className={cn('mt-0.5 text-right text-xs tabular', mine ? 'text-on-brand/70' : 'text-fg-muted')}>{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className="space-y-2 border-t border-line p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                {sendError && <Notice tone="bad">{tr('Message not sent. Try again.', 'Сообщение не отправлено. Попробуй ещё раз.', 'Xabar yuborilmadi. Qayta urinib ko‘ring.')}</Notice>}
                <div className="flex items-center gap-2">
                  <TextInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    aria-label={tr('Message', 'Сообщение', 'Xabar')}
                    placeholder={tr('Write a message…', 'Напиши сообщение…', 'Xabar yozing…')}
                    maxLength={2000}
                    autoComplete="off"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} aria-label={tr('Send', 'Отправить', 'Yuborish')} className="size-11 shrink-0 px-0 sm:size-10">
                    <Send className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare className="size-5" />}
                title={tr('Pick a chat', 'Выбери чат', 'Chatni tanlang')}
                text={tr('Choose a conversation on the left or find a person to message.', 'Выбери разговор слева или найди человека, которому хочешь написать.', 'Chapdagi suhbatni tanlang yoki yozmoqchi bo‘lgan odamni toping.')}
              />
            </div>
          )}
        </Panel>
      </div>
    </>
  );
};
