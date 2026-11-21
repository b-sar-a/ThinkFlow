import { useState } from 'react';
import { Atom, ArrowLeft, ArrowRight, Check, Code2, Landmark, MessageSquare, Plus, Sparkles, type LucideIcon } from 'lucide-react';
import { generateKnowledgeTree, verifyTask } from '../../services/gemini';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useTr } from '../../context/LanguageContext';
import { KnowledgeTree, KnowledgeNode } from '../../types';
import { Chat } from './Chat';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Badge, Button, Field, Notice, PageHeader, Panel, ProgressBar, SectionTitle, Skeleton, Spinner, TextArea, TextInput, cn } from '../ds';
import { levelInfo } from '../../lib/progress';

const COURSE_ICON: Record<string, LucideIcon> = { atom: Atom, code: Code2, landmark: Landmark };

const presetTemplates = [
  {
    id: 'physics_ege',
    title: 'Подготовка к ЕГЭ по физике',
    titleEn: 'Physics Exam Prep',
    icon: 'atom',
    tree: {
      topic: 'Подготовка к ЕГЭ по физике',
      nodes: [
        {
          id: 'p1',
          label: 'Кинематика и Динамика',
          description: 'Основы физики механического движения, законы Ньютона, силы упругости, трения и гравитации.',
          metaphor: 'Космический буксир: рассчитываем траекторию стыковки с орбитальной станцией.',
          challenge: 'Определите ускорение тела массой 5 кг под действием силы 20 Н (ответ числом в м/с²).',
          points: 100,
          type: 'core',
          completed: false
        },
        {
          id: 'p2',
          label: 'Электромагнетизм',
          description: 'Электростатика, закон Кулона, магнитное поле, сила Лоренца и электромагнитная индукция.',
          metaphor: 'Энергетический щит звездолета: настройка напряженности поля для отражения плазмы.',
          challenge: 'Чему равна работа поля по переносу заряда 2 Кл при разности потенциалов 10 В? (в Дж)',
          points: 150,
          type: 'branch',
          completed: false
        },
        {
          id: 'p3',
          label: 'Квантовая Физика',
          description: 'Фотоэффект, уравнение Эйнштейна, квантовые уровни энергии атомов и излучение.',
          metaphor: 'Фотонные пушки: калибровка длины волны луча для преодоления кристаллических экранов.',
          challenge: 'Какой ученый предложил уравнение фотоэффекта, за что получил Нобелевскую премию?',
          points: 200,
          type: 'leaf',
          completed: false
        }
      ],
      connections: [
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' }
      ]
    }
  },
  {
    id: 'python_basics',
    title: 'Основы Python',
    titleEn: 'Python Basics',
    icon: 'code',
    tree: {
      topic: 'Основы Python',
      nodes: [
        {
          id: 'py1',
          label: 'Переменные и Циклы',
          description: 'Объявление переменных, базовые типы данных, циклы for/while и структуры ветвления.',
          metaphor: 'Автоматическая сборочная линия: коробки с материалами и повторяющиеся конвейеры.',
          challenge: 'Как называется функция, выводящая данные в консоль в Python?',
          points: 100,
          type: 'core',
          completed: false
        },
        {
          id: 'py2',
          label: 'Функции и ООП',
          description: 'Функции как строительные блоки, классы, наследование, полиморфизм и инкапсуляция.',
          metaphor: 'Конструктор роботов: создание чертежей (классов) и запуск уникальных робо-ботов (экземпляров).',
          challenge: 'Какое ключевое слово используется для объявления функции в Python?',
          points: 150,
          type: 'branch',
          completed: false
        },
        {
          id: 'py3',
          label: 'Работа с JSON и API',
          description: 'Импорт модулей, обработка исключений, отправка HTTP и парсинг JSON объектов.',
          metaphor: 'Межгалактический почтовый хаб: получение кодированных капсул и отправка ответов адресатам.',
          challenge: 'Какой метод объекта dict возвращает значение по ключу, не вызывая ошибку KeyError?',
          points: 200,
          type: 'leaf',
          completed: false
        }
      ],
      connections: [
        { from: 'py1', to: 'py2' },
        { from: 'py2', to: 'py3' }
      ]
    }
  },
  {
    id: 'history_19',
    title: 'История 19 века',
    titleEn: '19th Century History',
    icon: 'landmark',
    tree: {
      topic: 'История 19 века',
      nodes: [
        {
          id: 'h1',
          label: 'Эпоха Наполеоновских войн',
          description: 'Расцвет и падение Французской империи, Отечественная война 1812 года, Бородинское сражение.',
          metaphor: 'Великая шахматная партия Европы: рокировки монархов и тактические марш-броски.',
          challenge: 'В какой стране Наполеон Бонапарт потерпел свое окончательное крушение в бою при Ватерлоо?',
          points: 100,
          type: 'core',
          completed: false
        },
        {
          id: 'h2',
          label: 'Промышленный Переворот',
          description: 'Переход от ручного труда к машинному, появление паровых двигателей, железных дорог, капитализм.',
          metaphor: 'Паровой гигант: запуск шестеренок новой цивилизации и уход от аграрной тишины.',
          challenge: 'Какое ископаемое топливо стало основным двигателем промышленной революции 19 века?',
          points: 150,
          type: 'branch',
          completed: false
        },
        {
          id: 'h3',
          label: 'Реформы Александра II',
          description: 'Отмена крепостного права в 1861 году, земская, судебная и военная государственные реформы.',
          metaphor: 'Разрушение оков: освобождение крестьянского потенциала и запуск модернизации империи.',
          challenge: 'Какое прозвище получил в народе император Александр II за отмену крепостничества?',
          points: 200,
          type: 'leaf',
          completed: false
        }
      ],
      connections: [
        { from: 'h1', to: 'h2' },
        { from: 'h2', to: 'h3' }
      ]
    }
  }
];

export const GeniusLab: React.FC = () => {
  const { profile, updateProfileData, user } = useAuth();
  const { t, language } = useLanguage();
  const tr = useTr();
  const [topic, setTopic] = useState('');
  const [tree, setTree] = useState<KnowledgeTree | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<{ text: string; limit?: boolean } | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const interests = profile?.interests ?? [];
  const limitMessage = tr(
    'AI token limit reached. Get more in “Bonuses & codes”.',
    'Лимит ИИ-токенов исчерпан. Получи ещё в разделе «Бонусы и коды».',
    'AI token limiti tugadi. «Bonus va kodlar» bo‘limidan oling.'
  );

  const goTo = (slug: string) => { window.location.hash = `#/${slug}`; };

  const logActivity = async () => {
    if (!user || !profile) return;
    try {
      await addDoc(collection(db, 'genius_lab_activities'), {
        userId: user.uid,
        userName: profile.name || user.displayName || 'Anonymous User',
        email: user.email || '',
        timestamp: Date.now(),
        dateString: new Date().toISOString().split('T')[0],
      });
    } catch (e) {
      console.warn('Could not write daily activity log to cloud storage:', e);
    }
  };

  const addXPAction = async (amount: number) => {
    if (!profile || !user) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = levelInfo(newXP).level;
    await updateProfileData({ xp: newXP, level: newLevel > profile.level ? newLevel : profile.level });
    setXpToast(amount);
    setTimeout(() => setXpToast(null), 2500);
  };

  const resetAnswer = () => { setVerifyFeedback(null); setChallengeAnswer(''); };

  const handleLaunchPreset = async (presetId: string) => {
    const template = presetTemplates.find((p) => p.id === presetId);
    if (!template || !profile) return;
    setError(null);
    resetAnswer();
    setTopic(language === 'ru' ? template.title : template.titleEn);
    const copyTree = JSON.parse(JSON.stringify(template.tree));
    setTree(copyTree);
    setSelectedNode(copyTree.nodes[0]);
    try {
      await addXPAction(25);
      await logActivity();
    } catch (err) {
      console.warn('Could not save course start:', err);
    }
  };

  const handleInitialize = async () => {
    if (!topic.trim() || !profile) return;
    setIsLoading(true);
    setError(null);
    resetAnswer();
    try {
      const generatedTree = await generateKnowledgeTree(topic, profile);
      if (generatedTree && Array.isArray(generatedTree.nodes) && generatedTree.nodes.length > 0) {
        setTree(generatedTree);
        setSelectedNode(generatedTree.nodes[0]);
        addXPAction(25);
        await logActivity();
      } else {
        throw new Error('Invalid structure: AI returned empty tree.');
      }
    } catch (err: any) {
      console.error('Genius Lab Error:', err);
      if (err?.message === 'PRO_LIMIT_REACHED') setError({ text: limitMessage, limit: true });
      else setError({ text: err instanceof Error ? err.message : tr('Could not build the map. Try again.', 'Не удалось построить карту. Попробуй ещё раз.', 'Xaritani qurib bo‘lmadi. Qayta urinib ko‘ring.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setShowChat(false);
    resetAnswer();
  };

  const handleCompleteChallenge = async () => {
    if (!selectedNode || !selectedNode.points || !challengeAnswer.trim() || !profile) return;
    setIsVerifying(true);
    setVerifyFeedback(null);
    setError(null);
    try {
      const result = await verifyTask(selectedNode, challengeAnswer, profile);
      setVerifyFeedback({ isCorrect: result.isCorrect, text: result.feedback });
      if (result.isCorrect) {
        await addXPAction((selectedNode.points || 0) + (result.bonusXP || 0));
        if (tree) {
          setTree({ ...tree, nodes: tree.nodes.map((n) => (n.id === selectedNode.id ? { ...n, completed: true } : n)) });
          setSelectedNode({ ...selectedNode, completed: true });
        }
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      if (err?.message === 'PRO_LIMIT_REACHED') setError({ text: limitMessage, limit: true });
      else setError({ text: tr('Could not check the answer. Try again.', 'Не удалось проверить ответ. Попробуй ещё раз.', 'Javobni tekshirib bo‘lmadi. Qayta urinib ko‘ring.') });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetLab = () => {
    setTree(null);
    setSelectedNode(null);
    setTopic('');
    setShowChat(false);
    setError(null);
  };

  const errorNotice = error && (
    <Notice tone="bad" className="mt-4">
      <span>{error.text}</span>
      {error.limit && (
        <button type="button" onClick={() => goTo('bonuses')} className="ml-2 cursor-pointer font-medium underline">
          {tr('Open bonuses', 'Открыть бонусы', 'Bonuslarni ochish')}
        </button>
      )}
    </Notice>
  );

  const xpBadge = xpToast !== null && (
    <div role="status" className="fixed bottom-4 right-4 z-40">
      <Badge tone="hl" className="h-9 px-3 text-sm shadow-[var(--shadow-pop)]">+{xpToast} XP</Badge>
    </div>
  );

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <>
        <PageHeader title={t.geniusLab} />
        <Panel className="p-6">
          <Spinner className="py-6" label={`${tr('Building a map for', 'Строю карту по теме', 'Xarita tuzilmoqda:')} «${topic}»`} />
          <div className="mx-auto mt-2 max-w-md space-y-3" aria-hidden="true">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </Panel>
      </>
    );
  }

  /* ---------- Start: topic form + ready-made courses ---------- */
  if (!tree) {
    return (
      <>
        <PageHeader title={t.geniusLab} description={t.geniusLabSub} />

        <Panel className="max-w-3xl p-5 sm:p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleInitialize(); }}>
            <Field label={tr('Topic you want to learn', 'Тема, которую хочешь освоить', 'O‘rganmoqchi bo‘lgan mavzu')}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <TextInput
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.masterTopic}
                  maxLength={200}
                  autoComplete="off"
                />
                <Button type="submit" size="md" disabled={!topic.trim()} className="shrink-0">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {tr('Build a map', 'Построить карту', 'Xarita qurish')}
                </Button>
              </div>
            </Field>
          </form>
          <p className="mt-3 text-sm text-fg-muted">
            {interests.length > 0
              ? `${tr('I will explain it through', 'Объясню через', 'Tushuntiraman:')} ${interests.slice(0, 4).join(', ')}. `
              : `${tr('Add interests so explanations feel like yours.', 'Добавь интересы, чтобы объяснения были про тебя.', 'Tushuntirishlar o‘zingiznikidek bo‘lishi uchun qiziqishlarni qo‘shing.')} `}
            <button type="button" onClick={() => goTo('profile')} className="cursor-pointer font-medium text-brand hover:underline">
              {tr('Change', 'Изменить', 'O‘zgartirish')}
            </button>
          </p>
          {errorNotice}
        </Panel>

        <section className="mt-10" aria-labelledby="courses-title">
          <div className="mb-3">
            <h2 id="courses-title" className="text-base font-semibold text-fg">{tr('Ready-made courses', 'Готовые курсы', 'Tayyor kurslar')}</h2>
            <p className="text-sm text-fg-muted">{tr('Open instantly, no AI tokens spent.', 'Открываются сразу, токены не тратятся.', 'Darhol ochiladi, token sarflanmaydi.')}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {presetTemplates.map((tmpl) => {
              const Icon = COURSE_ICON[tmpl.icon] ?? Atom;
              const xp = tmpl.tree.nodes.reduce((sum, n) => sum + (n.points || 0), 0);
              return (
                <li key={tmpl.id}>
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset(tmpl.id)}
                    className="flex h-full w-full cursor-pointer flex-col items-start gap-3 rounded-xl border border-line bg-panel p-4 text-left shadow-[var(--shadow-1)] transition-colors duration-150 hover:border-line-strong hover:bg-panel-2"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-fg">{language === 'ru' ? tmpl.title : tmpl.titleEn}</span>
                      <span className="mt-0.5 block text-sm text-fg-muted">
                        {tmpl.tree.nodes.length} {tr('modules', 'модуля', 'modul')} · {xp} XP
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        {xpBadge}
      </>
    );
  }

  /* ---------- Knowledge map ---------- */
  const nodes = tree.nodes;
  const doneCount = nodes.filter((n) => n.completed).length;
  const index = selectedNode ? nodes.findIndex((n) => n.id === selectedNode.id) : -1;

  return (
    <>
      <PageHeader
        title={tree.topic || topic}
        description={`${tr('Completed', 'Пройдено', 'Bajarildi')}: ${doneCount} ${tr('of', 'из', '/')} ${nodes.length}`}
        actions={
          <Button variant="secondary" onClick={resetLab}>
            <Plus className="size-4" aria-hidden="true" />
            {t.newTopic}
          </Button>
        }
      />
      <ProgressBar value={(doneCount / nodes.length) * 100} label={tr('Course progress', 'Прогресс курса', 'Kurs jarayoni')} tone="ok" className="mb-6" />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Panel className="p-3 lg:sticky lg:top-0">
          <SectionTitle>{t.knowledgeMap}</SectionTitle>
          <ol className="relative ml-3 border-l border-line-strong">
            {nodes.map((node, i) => {
              const active = selectedNode?.id === node.id;
              return (
                <li key={node.id} className="relative pb-1 pl-5 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -left-3 top-2.5 flex size-6 items-center justify-center rounded-full border text-xs font-semibold',
                      node.completed ? 'border-ok bg-ok text-on-brand' : active ? 'border-brand bg-panel text-brand' : 'border-line-strong bg-panel text-fg-muted'
                    )}
                  >
                    {node.completed ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'flex min-h-11 w-full cursor-pointer flex-col items-start rounded-lg px-3 py-2 text-left transition-colors duration-150',
                      active ? 'bg-brand-soft' : 'hover:bg-panel-2'
                    )}
                  >
                    <span className={cn('text-sm font-medium', active ? 'text-brand' : 'text-fg')}>{node.label}</span>
                    <span className="text-xs text-fg-muted">
                      {node.points ? `+${node.points} XP` : ''}
                      {node.completed ? ` · ${tr('done', 'готово', 'tayyor')}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Panel>

        {selectedNode && (
          <Panel className="min-w-0">
            {showChat ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {tr('Back to topic', 'К теме', 'Mavzuga')}
                  </Button>
                  <h2 className="min-w-0 truncate text-sm font-semibold text-fg">{t.askAbout} {selectedNode.label}</h2>
                </div>
                <div className="h-[min(560px,70dvh)]">
                  <Chat type="genius" context={selectedNode.label} />
                </div>
              </div>
            ) : (
              <article className="space-y-6 p-5 sm:p-6">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-fg">{selectedNode.label}</h2>
                  <div className="flex items-center gap-2">
                    {selectedNode.points ? <Badge tone="hl">+{selectedNode.points} XP</Badge> : null}
                    {selectedNode.completed && <Badge tone="ok"><Check className="size-3" aria-hidden="true" />{t.nodeMastered}</Badge>}
                  </div>
                </header>

                <section>
                  <h3 className="mb-1.5 text-sm font-semibold text-fg">{t.nodeExplanation}</h3>
                  <p className="max-w-prose text-base leading-7 text-fg">{selectedNode.description}</p>
                </section>

                <section>
                  <h3 className="mb-1.5 text-sm font-semibold text-fg">{t.theMetaphor}</h3>
                  <blockquote className="max-w-prose border-l-2 border-brand pl-4 text-base leading-7 text-fg">{selectedNode.metaphor}</blockquote>
                </section>

                <section className="rounded-lg bg-panel-2 p-4">
                  <h3 className="mb-1.5 text-sm font-semibold text-fg">{t.geniusChallenge}</h3>
                  <p className="max-w-prose text-base leading-7 text-fg">{selectedNode.challenge}</p>

                  {!selectedNode.completed && (
                    <div className="mt-4 space-y-3">
                      <Field label={tr('Your answer', 'Твой ответ', 'Javobingiz')}>
                        <TextArea
                          value={challengeAnswer}
                          onChange={(e) => setChallengeAnswer(e.target.value)}
                          placeholder={t.geniusAnswerPlaceholder}
                          maxLength={1000}
                          rows={3}
                        />
                      </Field>
                      <Button onClick={handleCompleteChallenge} disabled={!challengeAnswer.trim()} loading={isVerifying}>
                        {isVerifying ? t.verifyingAI : t.submitVerification}
                      </Button>
                    </div>
                  )}

                  {verifyFeedback && (
                    <Notice tone={verifyFeedback.isCorrect ? 'ok' : 'bad'} className="mt-4">
                      {verifyFeedback.text}
                    </Notice>
                  )}
                  {errorNotice}
                </section>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <Button variant="secondary" onClick={() => setShowChat(true)}>
                    <MessageSquare className="size-4" aria-hidden="true" />
                    {t.askSidekick}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" disabled={index <= 0} onClick={() => handleNodeClick(nodes[index - 1])}>
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      {t.previous}
                    </Button>
                    <Button variant="ghost" disabled={index === -1 || index >= nodes.length - 1} onClick={() => handleNodeClick(nodes[index + 1])}>
                      {t.next}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </footer>
              </article>
            )}
          </Panel>
        )}
      </div>
      {xpBadge}
    </>
  );
};
