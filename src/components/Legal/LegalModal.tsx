import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type LegalTab = 'privacy' | 'terms' | 'safety';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

const CONTACT = 'https://t.me/b_sar_a';
const UPDATED = '2026-11-21';

type Section = { title: string; body: string[] };
type Doc = { tab: string; heading: string; sections: Section[] };
type Copy = {
  close: string;
  updated: string;
  contact: string;
  docs: Record<LegalTab, Doc>;
};

const RU: Copy = {
  close: 'Закрыть',
  updated: 'Обновлено',
  contact: 'Вопросы и запросы на удаление данных — в Telegram',
  docs: {
    privacy: {
      tab: 'Приватность',
      heading: 'Политика приватности',
      sections: [
        {
          title: 'Какие данные мы храним',
          body: [
            'Email и имя, возраст и класс, выбранные интересы и цель обучения.',
            'Твой прогресс: XP, уровень, серия дней, выполненные задания.',
            'Переписка с ИИ-наставником и твои сообщения и посты в сообществе.',
          ],
        },
        {
          title: 'Как мы их используем',
          body: [
            'Только чтобы работала платформа: подбирать примеры под твои интересы, считать прогресс, показывать рейтинг.',
            'Запросы к ИИ (текст и файлы, которые ты отправляешь) передаются сервису Google Gemini, чтобы получить ответ.',
            'Мы не продаём данные и не показываем рекламу.',
          ],
        },
        {
          title: 'Где хранятся данные',
          body: ['Аккаунты и профиль хранятся в Google Firebase (Authentication и Firestore). Доступ к ним защищён правилами безопасности.'],
        },
        {
          title: 'Дети и подростки',
          body: [
            'Если тебе меньше 14 лет, пользуйся ThinkFlow вместе с родителем или законным представителем и с его согласия.',
            'Не указывай в чатах и постах адрес, телефон, номер школы и другие личные данные.',
          ],
        },
        {
          title: 'Твои права',
          body: ['Ты можешь запросить копию своих данных или полное удаление аккаунта. Удаление аккаунта удаляет профиль и историю обучения.'],
        },
      ],
    },
    terms: {
      tab: 'Условия',
      heading: 'Условия использования',
      sections: [
        {
          title: 'Что такое ThinkFlow',
          body: ['ThinkFlow — учебный помощник. Он не заменяет школу, учителя и официальные материалы.'],
        },
        {
          title: 'ИИ может ошибаться',
          body: ['Ответы ИИ могут содержать неточности. Важные факты, формулы и решения проверяй по учебнику или у учителя.'],
        },
        {
          title: 'Правила поведения',
          body: [
            'Не оскорбляй других, не публикуй чужие личные данные, спам и запрещённый контент.',
            'Нельзя взламывать платформу, обходить лимиты и накручивать XP. За нарушения аккаунт может быть ограничен.',
          ],
        },
        {
          title: 'Лимиты и бесплатный доступ',
          body: ['Сейчас ThinkFlow бесплатен. Для ИИ действует лимит токенов; дополнительные токены можно получить по промокодам и за приглашения. Условия могут измениться — мы предупредим заранее.'],
        },
      ],
    },
    safety: {
      tab: 'Безопасность',
      heading: 'Безопасность и сообщество',
      sections: [
        {
          title: 'Общайся безопасно',
          body: [
            'Не делись паролями, адресом, телефоном и фотографиями документов — даже с теми, кому доверяешь.',
            'Если собеседник просит личную информацию или говорит что-то неприятное, прекрати разговор и расскажи взрослому.',
          ],
        },
        {
          title: 'Как сообщить о проблеме',
          body: ['Нашёл нарушение, ошибку или уязвимость? Напиши нам в Telegram — мы разберёмся.'],
        },
        {
          title: 'Безопасность аккаунта',
          body: ['Используй длинный уникальный пароль и выходи из аккаунта на чужих устройствах.'],
        },
      ],
    },
  },
};

const EN: Copy = {
  close: 'Close',
  updated: 'Updated',
  contact: 'Questions and data deletion requests — message us on Telegram',
  docs: {
    privacy: {
      tab: 'Privacy',
      heading: 'Privacy Policy',
      sections: [
        {
          title: 'What we store',
          body: [
            'Email and name, age and grade, chosen interests and learning goal.',
            'Your progress: XP, level, daily streak, completed tasks.',
            'Your conversations with the AI tutor and your community posts and messages.',
          ],
        },
        {
          title: 'How we use it',
          body: [
            'Only to run the platform: tailor examples to your interests, track progress, show the leaderboard.',
            'Requests to the AI (text and files you send) are processed by Google Gemini to produce an answer.',
            'We do not sell data and we do not show ads.',
          ],
        },
        {
          title: 'Where data lives',
          body: ['Accounts and profiles are stored in Google Firebase (Authentication and Firestore) and protected by security rules.'],
        },
        {
          title: 'Children and teens',
          body: [
            'If you are under 14, use ThinkFlow together with a parent or legal guardian and with their consent.',
            'Never share your address, phone number, school or other personal details in chats or posts.',
          ],
        },
        {
          title: 'Your rights',
          body: ['You can ask for a copy of your data or full deletion of your account. Deleting the account removes your profile and learning history.'],
        },
      ],
    },
    terms: {
      tab: 'Terms',
      heading: 'Terms of Use',
      sections: [
        {
          title: 'What ThinkFlow is',
          body: ['ThinkFlow is a study helper. It does not replace school, teachers or official course materials.'],
        },
        {
          title: 'AI can be wrong',
          body: ['AI answers may contain mistakes. Check important facts, formulas and solutions in a textbook or with a teacher.'],
        },
        {
          title: 'Rules of conduct',
          body: [
            'Do not insult others or post other people’s personal data, spam or prohibited content.',
            'Do not attack the platform, bypass limits or inflate XP. Accounts that break these rules can be restricted.',
          ],
        },
        {
          title: 'Limits and free access',
          body: ['ThinkFlow is free right now. AI use has a token limit; extra tokens come from promo codes and invites. Terms may change and we will tell you in advance.'],
        },
      ],
    },
    safety: {
      tab: 'Safety',
      heading: 'Safety and community',
      sections: [
        {
          title: 'Stay safe when you talk',
          body: [
            'Never share passwords, your address, phone number or photos of documents — even with people you trust.',
            'If someone asks for personal information or says something that feels wrong, stop the conversation and tell an adult.',
          ],
        },
        {
          title: 'Report a problem',
          body: ['Found abuse, a bug or a security hole? Message us on Telegram and we will look into it.'],
        },
        {
          title: 'Account safety',
          body: ['Use a long, unique password and sign out on shared devices.'],
        },
      ],
    },
  },
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const { language } = useLanguage();
  const [tab, setTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Uzbek readers get the English text until a reviewed translation exists.
  const copy = language === 'ru' ? RU : EN;
  const doc = copy.docs[tab];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-heading"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#0b0b12] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-5 border-b border-white/10">
          <div role="tablist" className="flex gap-1 overflow-x-auto">
            {(Object.keys(copy.docs) as LegalTab[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                  tab === key ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {copy.docs[key].tab}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label={copy.close}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div>
            <h2 id="legal-heading" className="text-2xl md:text-3xl font-black tracking-tight">{doc.heading}</h2>
            <p className="text-xs text-white/40 mt-1">{copy.updated}: {UPDATED}</p>
          </div>
          {doc.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">{section.title}</h3>
              {section.body.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-white/70">{line}</p>
              ))}
            </section>
          ))}
          <a
            href={CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-bold text-indigo-400 hover:text-white transition-colors"
          >
            {copy.contact} →
          </a>
        </div>
      </div>
    </div>
  );
};
