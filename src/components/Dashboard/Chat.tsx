
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useTr } from '../../context/LanguageContext';
import { AIModelType, Message, Attachment, ChatSession } from '../../types';
import { askThinkFlowAI } from '../../services/gemini';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Badge, Button, Chip, IconButton, Notice, cn } from '../ds';

interface ChatProps {
  type: AIModelType;
  sessionId?: string;
  /** What the student is studying right now. Sent to the AI with each question, not shown in the chat. */
  context?: string;
}

const XP_PER_QUESTION = 15;

export const Chat: React.FC<ChatProps> = ({ type, sessionId: initialSessionId, context }) => {
  const { profile, user, updateProfileData } = useAuth();
  const tr = useTr();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [error, setError] = useState<string | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addXP = async (amount: number) => {
    if (!profile || !user) return;
    await updateProfileData({ xp: (profile.xp || 0) + amount });
    setXpGain(amount);
    setTimeout(() => setXpGain(null), 2500);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!user || !sessionId) return;
    const unsubscribe = onSnapshot(
      doc(db, 'sessions', sessionId),
      (docSnap) => {
        if (docSnap.exists()) setMessages((docSnap.data() as ChatSession).messages);
      },
      (err) => console.error('Chat session fetch error:', err)
    );
    return () => unsubscribe();
  }, [user, sessionId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = (evt.target?.result as string).split(',')[1];
      setAttachment({ data: base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendMessage = async (text = input) => {
    if ((!text.trim() && !attachment) || !user || !profile || isLoading) return;

    const userMsg: Message = { role: 'user', text, timestamp: Date.now() };
    if (attachment) userMsg.attachment = attachment;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachment(null);
    setError(null);
    setIsLoading(true);

    try {
      const prompt = context ? `[${tr('Topic', 'Тема', 'Mavzu')}: ${context}] ${text}` : text;
      const aiResponse = await askThinkFlowAI(type, prompt, profile, messages, attachment || undefined);
      const finalMessages = [...newMessages, { role: 'model', text: aiResponse, timestamp: Date.now() } as Message];

      if (!sessionId) {
        const docRef = await addDoc(collection(db, 'sessions'), {
          userId: user.uid,
          title: (text.slice(0, 30) || 'New Conversation').trim(),
          type,
          messages: finalMessages,
          lastUpdated: Date.now(),
        });
        setSessionId(docRef.id);
      } else {
        await updateDoc(doc(db, 'sessions', sessionId), { messages: finalMessages, lastUpdated: Date.now() });
      }
      await addXP(XP_PER_QUESTION);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(messages); // take the unanswered question back out of the log
      setInput(text);
      setError(
        err?.message === 'PRO_LIMIT_REACHED'
          ? tr(
              'AI token limit reached. Get more in “Bonuses & codes”.',
              'Лимит ИИ-токенов исчерпан. Получи ещё в разделе «Бонусы и коды».',
              'AI token limiti tugadi. «Bonus va kodlar» bo‘limidan oling.'
            )
          : err?.message || tr('Something went wrong. Try again.', 'Что-то пошло не так. Попробуй ещё раз.', 'Xatolik yuz berdi. Qayta urinib ko‘ring.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const starters = [
    tr('Explain it more simply', 'Объясни проще', 'Oddiyroq tushuntir'),
    tr('Give me another example', 'Приведи ещё пример', 'Yana bir misol keltir'),
    tr('Quiz me on this', 'Задай мне вопрос по теме', 'Shu mavzu bo‘yicha savol ber'),
  ];

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div ref={scrollRef} role="log" aria-live="polite" className="scroll-area min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-xs text-[15px] text-fg-muted">
              {tr(
                'Ask anything about this topic. Answers use your interests as examples.',
                'Спроси что угодно по этой теме. Объяснения строятся на твоих интересах.',
                'Shu mavzu bo‘yicha istalgan savolni bering. Javoblar qiziqishlaringiz asosida.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {starters.map((starter) => (
                <Chip key={starter} onClick={() => sendMessage(starter)} disabled={isLoading}>
                  {starter}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[88%] break-words rounded-xl px-4 py-2.5 text-[15px] leading-relaxed',
                  m.role === 'user' ? 'bg-brand text-on-brand' : 'border border-line bg-panel-2 text-fg'
                )}
              >
                {m.attachment && (
                  <img
                    src={`data:${m.attachment.mimeType};base64,${m.attachment.data}`}
                    className="mb-2 max-h-56 rounded-lg object-contain"
                    alt={m.attachment.name || tr('Attachment', 'Вложение', 'Ilova')}
                  />
                )}
                <div className="md">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div role="status" className="flex items-center gap-2 text-sm text-fg-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {tr('Thinking…', 'Думаю…', 'O‘ylayapman…')}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-line p-3">
        {error && <Notice tone="bad">{error}</Notice>}
        {attachment && (
          <div className="flex w-fit items-center gap-1 rounded-lg bg-panel-2 py-1 pl-3 pr-1 text-sm">
            <span className="max-w-[200px] truncate">{attachment.name}</span>
            <IconButton label={tr('Remove attachment', 'Убрать вложение', 'Ilovani olib tashlash')} onClick={() => setAttachment(null)} className="size-8">
              <X className="size-4" />
            </IconButton>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            aria-label={tr('Your question', 'Твой вопрос', 'Savolingiz')}
            placeholder={tr('Type a question…', 'Напиши вопрос…', 'Savol yozing…')}
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-lg border border-line-strong bg-panel px-3 py-2.5 text-[15px] text-fg placeholder:text-fg-muted/70 hover:border-fg-muted"
          />
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={handleFileUpload} />
          <IconButton label={tr('Attach an image', 'Прикрепить изображение', 'Rasm biriktirish')} onClick={() => fileRef.current?.click()}>
            <Paperclip className="size-5" />
          </IconButton>
          <Button
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !attachment) || isLoading}
            aria-label={tr('Send', 'Отправить', 'Yuborish')}
            className="size-11 px-0 sm:size-10"
          >
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>{tr('Enter to send, Shift+Enter for a new line', 'Enter — отправить, Shift+Enter — новая строка', 'Enter — yuborish, Shift+Enter — yangi qator')}</span>
          <span aria-live="polite">{xpGain && <Badge tone="hl">+{xpGain} XP</Badge>}</span>
        </div>
      </div>
    </div>
  );
};
