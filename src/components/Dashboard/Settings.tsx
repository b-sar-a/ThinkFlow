
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Modal, Notice, PageHeader, Panel, Segmented, SectionTitle } from '../ds';
import type { Language, UserProfile } from '../../types';

const Row = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="min-w-0">
      <p className="text-[15px] font-medium text-fg">{title}</p>
      {hint && <p className="mt-0.5 max-w-md text-sm text-fg-muted">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { signOut, deleteAccount, profile, updateProfileData } = useAuth();
  const tr = useTr();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(false);
    try {
      await deleteAccount();
    } catch {
      setDeleteError(true);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={t.settings} description={tr('Appearance, language and how the AI explains things.', 'Внешний вид, язык и то, как ИИ объясняет темы.', 'Ko‘rinish, til va AI tushuntirish uslubi.')} />

      <section className="mb-8" aria-labelledby="set-general">
        <h2 id="set-general" className="mb-3 text-base font-semibold text-fg">{tr('General', 'Основное', 'Umumiy')}</h2>
        <Panel className="divide-y divide-line">
          <Row title={t.theme}>
            <Segmented
              label={t.theme}
              value={theme}
              onChange={(value) => value !== theme && toggleTheme()}
              options={[
                { value: 'light', label: tr('Light', 'Светлая', 'Yorug‘') },
                { value: 'dark', label: tr('Dark', 'Тёмная', 'Qorong‘u') },
              ]}
            />
          </Row>
          <Row
            title={t.language}
            hint={tr('Used for the interface and for AI answers.', 'Для интерфейса и ответов ИИ.', 'Interfeys va AI javoblari uchun.')}
          >
            <Segmented<Language>
              label={t.language}
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' },
                { value: 'uz', label: 'Oʻzbekcha' },
              ]}
            />
          </Row>
        </Panel>
      </section>

      <section className="mb-8" aria-labelledby="set-ai">
        <h2 id="set-ai" className="mb-3 text-base font-semibold text-fg">{tr('How the AI explains', 'Как ИИ объясняет', 'AI qanday tushuntiradi')}</h2>
        <Panel className="divide-y divide-line">
          <Row
            title={tr('Depth', 'Глубина', 'Chuqurlik')}
            hint={tr('How far the AI goes into a concept.', 'Насколько подробно ИИ разбирает тему.', 'AI mavzuni qanchalik chuqur yoritadi.')}
          >
            <Segmented<NonNullable<UserProfile['learningDepth']>>
              label={tr('Depth', 'Глубина', 'Chuqurlik')}
              value={profile?.learningDepth}
              onChange={(value) => updateProfileData({ learningDepth: value })}
              options={[
                { value: 'Surface', label: tr('Short', 'Кратко', 'Qisqa') },
                { value: 'Deep', label: tr('Deep', 'Глубоко', 'Chuqur') },
                { value: 'Architect', label: tr('Expert', 'Эксперт', 'Ekspert') },
              ]}
            />
          </Row>
          <Row
            title={tr('Style', 'Стиль', 'Uslub')}
            hint={tr('Examples from your interests, precise terms, or plain words.', 'Примеры из твоих интересов, точные термины или простые слова.', 'Qiziqishlaringizdan misollar, aniq atamalar yoki oddiy so‘zlar.')}
          >
            <Segmented<NonNullable<UserProfile['explanationStyle']>>
              label={tr('Style', 'Стиль', 'Uslub')}
              value={profile?.explanationStyle}
              onChange={(value) => updateProfileData({ explanationStyle: value })}
              options={[
                { value: 'Metaphorical', label: tr('Examples', 'Примеры', 'Misollar') },
                { value: 'Technical', label: tr('Technical', 'Технически', 'Texnik') },
                { value: 'Simple', label: tr('Simple', 'Просто', 'Oddiy') },
              ]}
            />
          </Row>
        </Panel>
      </section>

      <section aria-labelledby="set-account">
        <h2 id="set-account" className="mb-3 text-base font-semibold text-fg">{tr('Account', 'Аккаунт', 'Hisob')}</h2>
        <Panel className="divide-y divide-line">
          <Row title={tr('Sign out', 'Выйти из аккаунта', 'Hisobdan chiqish')}>
            <Button variant="secondary" onClick={() => signOut()}>
              {t.logout}
            </Button>
          </Row>
          <Row
            title={tr('Delete account', 'Удалить аккаунт', 'Hisobni o‘chirish')}
            hint={tr('This cannot be undone.', 'Это действие нельзя отменить.', 'Bu amalni qaytarib bo‘lmaydi.')}
          >
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              {tr('Delete', 'Удалить', 'O‘chirish')}
            </Button>
          </Row>
        </Panel>
      </section>

      <Modal open={confirmDelete} onClose={() => !isDeleting && setConfirmDelete(false)} title={tr('Delete your account?', 'Удалить аккаунт?', 'Hisob o‘chirilsinmi?')}>
        <p className="text-[15px] text-fg-muted">
          {tr(
            'Your profile and progress will be removed and you will be signed out. This cannot be undone.',
            'Профиль и прогресс будут удалены, а ты выйдешь из аккаунта. Отменить это нельзя.',
            'Profil va jarayon o‘chiriladi, siz hisobdan chiqasiz. Buni qaytarib bo‘lmaydi.'
          )}
        </p>
        {deleteError && (
          <Notice tone="bad" className="mt-4">
            {tr('Could not delete the account. Sign in again and retry.', 'Не удалось удалить аккаунт. Войди заново и повтори.', 'Hisobni o‘chirib bo‘lmadi. Qayta kirib, urinib ko‘ring.')}
          </Notice>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
            {tr('Cancel', 'Отмена', 'Bekor qilish')}
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} loading={isDeleting}>
            {tr('Delete account', 'Удалить аккаунт', 'Hisobni o‘chirish')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
