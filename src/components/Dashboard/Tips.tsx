import React, { useEffect, useState } from 'react';
import { Lightbulb, Clock, BookOpen, CheckCircle2, Star, Target, Zap, FileText, BarChart3, Quote, Sparkles, Users, Brain, Check, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';

type TabId = 'sat' | 'ielts' | 'gen';
const TRIED_KEY = 'tf_tips_tried';

const readTried = (): string[] => {
  try {
    const raw = localStorage.getItem(TRIED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export const Tips: React.FC = () => {
  const { t, language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const [tab, setTab] = useState<TabId>('sat');
  const [tried, setTried] = useState<string[]>(readTried);

  useEffect(() => {
    try {
      localStorage.setItem(TRIED_KEY, JSON.stringify(tried));
    } catch {
      /* storage blocked: progress just is not remembered */
    }
  }, [tried]);

  const toggleTried = (id: string) =>
    setTried((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const satTips = language === 'ru' ? [
    { title: "Техника Фейнмана", desc: "Объясните сложную задачу SAT 10-летнему ребенку. Если вы не можете — вы не понимаете ее до конца.", icon: Brain },
    { title: "Интервальные повторения", desc: "Не зубрите всё сразу. Повторяйте сложные правила через 1, 3 и 7 дней для вечного запоминания.", icon: Zap },
    { title: "Активное вспоминание", desc: "Вместо чтения конспектов, закройте книгу и запишите всё, что помните. Исследования показывают, что вспоминание работает лучше, чем перечитывание.", icon: BookOpen },
    { title: "Эффект Зейгарник", desc: "Делайте перерыв на самом интересном месте задачи. Мозг продолжит решать ее в фоновом режиме.", icon: Target },
    { title: "Метод исключения", desc: "В SAT всегда 3 ответа абсолютно неверны. Ищите ошибки, а не правильный ответ.", icon: CheckCircle2 },
    { title: "Темп в математике", desc: "Первые 10 вопросов — это разминка. Решайте их за 5 минут, чтобы оставить время на финал.", icon: Clock },
    { title: "Грамматический скелет", desc: "Игнорируйте лишние слова в предложении. Найдите только подлежащее и сказуемое.", icon: FileText },
    { title: "Визуализация данных", desc: "В секции анализа данных сначала посмотрите на оси графика, а потом на сам вопрос.", icon: BarChart3 },
  ] : language === 'uz' ? [
    { title: "Feynman texnikasi", desc: "Murakkab SAT muammosini 10 yoshli bolaga tushuntiring. Agar tushuntirolmasangiz, demak o'zingiz ham hali to'liq tushunmagansiz.", icon: Brain },
    { title: "Interval takrorlash", desc: "Hammasini birdan yodlamang. Doimiy xotira uchun qiyin qoidalarni 1, 3 va 7 kunlik intervallarda takrorlang.", icon: Zap },
    { title: "Faol eslash", desc: "Konspektlarni qayta o'qish o'rniga, kitobni yoping va eslagan hamma narsangizni yozing. Tadqiqotlar eslashning qayta o'qishdan yaxshiroq ekanini ko'rsatadi.", icon: BookOpen },
    { title: "Zeygarnik effekti", desc: "Muammoning eng qiziqarli joyida tanaffus qiling. Miyangiz uni fonda hal qilishda davom etadi.", icon: Target },
    { title: "Istisno qilish usuli", desc: "SATda 3 ta javob har doim xato bo'ladi. To'g'ri javobni emas, xatolarni qidiring.", icon: CheckCircle2 },
    { title: "Matematika sur'ati", desc: "Dastlabki 10 ta savol - bu isinish. Final uchun vaqtni tejash uchun ularni 5 daqiqada hal qiling.", icon: Clock },
    { title: "Grammatika skeleti", desc: "Gapdagi ortiqcha so'zlarga e'tibor bermang. Xatolarni aniqlash uchun faqat ega va kesimni toping.", icon: FileText },
    { title: "Ma'lumotlarni vizuallashtirish", desc: "Ma'lumotlarni tahlil qilish bo'limida avval grafik o'qlariga, keyin savolning o'ziga qarang.", icon: BarChart3 },
  ] : [
    { title: "Feynman Technique", desc: "Explain a complex SAT problem to a 10-year-old. If you can't, you don't fully understand it yet.", icon: Brain },
    { title: "Spaced Repetition", desc: "Don't cram. Review hard rules at 1, 3, and 7-day intervals for permanent memory.", icon: Zap },
    { title: "Active Recall", desc: "Instead of re-reading notes, close the book and write down everything you remember. Research shows that retrieval practice beats re-reading.", icon: BookOpen },
    { title: "Zeigarnik Effect", desc: "Take a break at the most interesting part of a problem. Your brain will keep solving it in the background.", icon: Target },
    { title: "Process of Elimination", desc: "In SAT, 3 answers are always objectively wrong. Look for errors, not the right answer.", icon: CheckCircle2 },
    { title: "Math Pacing", desc: "The first 10 questions are a warm-up. Solve them in 5 mins to save time for the finale.", icon: Clock },
    { title: "Grammar Skeleton", desc: "Ignore extra words in a sentence. Find only the subject and the verb to spot errors.", icon: FileText },
    { title: "Data Visualization", desc: "In the data analysis section, look at the graph axes first, then the question itself.", icon: BarChart3 },
  ];

  const ieltsTips = language === 'ru' ? [
    { title: "Эффект погружения", desc: "Слушайте подкасты на 1.5x скорости. Обычный темп на экзамене покажется вам замедленным.", icon: Star },
    { title: "Структура PEEL", desc: "Point, Evidence, Explanation, Link. Используйте это для каждого абзаца в Writing Task 2.", icon: CheckCircle2 },
    { title: "Предсказание ответов", desc: "В аудировании читайте вопросы заранее и угадывайте часть речи (существительное, число и т.д.).", icon: Target },
    { title: "Сканирование по ключевым словам", desc: "Ищите не слова из вопроса, а их синонимы. IELTS всегда парафразирует.", icon: BookOpen },
    { title: "Парафразирование", desc: "Никогда не копируйте слова из вопроса. Используйте синонимы, чтобы показать свой уровень.", icon: Quote },
    { title: "Обзор Task 1", desc: "Без чёткого Overview (обзора тенденций) высокий балл за Task 1 получить трудно.", icon: BarChart3 },
    { title: "Точность написания", desc: "В аудировании 'accommodation' с одной 'm' — это 0 баллов. Проверяйте двойные буквы.", icon: CheckCircle2 },
    { title: "Сложные структуры", desc: "Используйте Conditionals (If...) и Inversion (Not only...), чтобы удивить экзаменатора.", icon: Zap },
    { title: "Использование синонимов", desc: "Замените 'very good' на 'exceptional' или 'outstanding'. Это сразу поднимет балл.", icon: Sparkles },
    { title: "Тайм-менеджмент", desc: "Task 2 дает 66% баллов за письмо. Начинайте с него, если боитесь не успеть.", icon: Clock },
    { title: "Идиомы в Speaking", desc: "Используйте 'once in a blue moon' вместо 'rarely'. Это звучит как носитель языка.", icon: Quote },
    { title: "Критическая проверка", desc: "Оставьте 2 минуты на проверку артиклей 'a/an/the' и окончаний '-s' у глаголов.", icon: CheckCircle2 },
  ] : language === 'uz' ? [
    { title: "Sho'ng'ish effekti", desc: "Podkastlarni 1.5x tezlikda tinglang. Imtihondagi odatiy sur'at sizga sekin harakatlanayotgandek tuyuladi.", icon: Star },
    { title: "PEEL tuzilishi", desc: "Point, Evidence, Explanation, Link. Buni Writing Task 2 dagi har bir paragraf uchun ishlating.", icon: CheckCircle2 },
    { title: "Javobni bashorat qilish", desc: "Listening bo'limida savollarni oldindan o'qing va so'z turkumini (ot, son va h.k.) taxmin qiling.", icon: Target },
    { title: "Kalit so'zlarni skanerlash", desc: "Savoldagi so'zlarni qidirmang; ularning sinonimlarini qidiring. IELTS har doim parafraz qiladi.", icon: BookOpen },
    { title: "Parafraz qilish", desc: "Hech qachon savoldagi so'zlarni nusxalamang. O'z darajangizni ko'rsatish uchun sinonimlardan foydalaning.", icon: Quote },
    { title: "Task 1 sharhi", desc: "Aniq Overview (trend xulosasi) bo'lmasa, Task 1 uchun yuqori ball olish qiyin.", icon: BarChart3 },
    { title: "Imlo aniqligi", desc: "Listeningda bitta 'm' bilan yozilgan 'accommodation' 0 ball hisoblanadi. Ikki baravar harflarni diqqat bilan tekshiring.", icon: CheckCircle2 },
    { title: "Murakkab tuzilmalar", desc: "Imtihon oluvchini hayratda qoldirish uchun Conditionals (If...) va Inversion (Not only...) dan foydalaning.", icon: Zap },
    { title: "Sinonimlardan foydalanish", desc: "'Very good' so'zini 'exceptional' yoki 'outstanding' bilan almashtiring. Bu balingizni darhol oshiradi.", icon: Sparkles },
    { title: "Vaqtni boshqarish", desc: "Task 2 yozish balingizning 66 foizini beradi. Agar vaqtdan xavotirda bo'lsangiz, undan boshlang.", icon: Clock },
    { title: "Speakingda idiomalar", desc: "'Rarely' o'rniga 'once in a blue moon' dan foydalaning. Bu ona tilida so'zlashuvchidek eshitiladi.", icon: Quote },
    { title: "Tanqidiy tekshirish", desc: "Fe'llardagi 'a/an/the' artikllari va '-s' qo'shimchalarini tekshirish uchun 2 daqiqa qoldiring.", icon: CheckCircle2 },
  ] : [
    { title: "Immersion Effect", desc: "Listen to podcasts at 1.5x speed. The normal exam pace will feel slow-motion to you.", icon: Star },
    { title: "PEEL Structure", desc: "Point, Evidence, Explanation, Link. Use this for every paragraph in Writing Task 2.", icon: CheckCircle2 },
    { title: "Answer Prediction", desc: "In Listening, read questions ahead and guess the part of speech (noun, number, etc.).", icon: Target },
    { title: "Keyword Scanning", desc: "Don't look for words from the question; look for their synonyms. IELTS always paraphrases.", icon: BookOpen },
    { title: "Paraphrasing", desc: "Never copy words from the question. Use synonyms to demonstrate your range.", icon: Quote },
    { title: "Task 1 Overview", desc: "Without a clear Overview (trend summary), it is hard to score high on Task 1.", icon: BarChart3 },
    { title: "Spelling Accuracy", desc: "In Listening, 'accommodation' with one 'm' is 0 points. Check double letters carefully.", icon: CheckCircle2 },
    { title: "Complex Structures", desc: "Use Conditionals (If...) and Inversion (Not only...) to impress the examiner.", icon: Zap },
    { title: "Synonym Usage", desc: "Replace 'very good' with 'exceptional' or 'outstanding'. It boosts your score instantly.", icon: Sparkles },
    { title: "Time Management", desc: "Task 2 is worth 66% of your writing score. Start with it if you're worried about time.", icon: Clock },
    { title: "Idioms in Speaking", desc: "Use 'once in a blue moon' instead of 'rarely'. It sounds more like a native speaker.", icon: Quote },
    { title: "Critical Proofreading", desc: "Leave 2 mins to check 'a/an/the' articles and '-s' endings on verbs.", icon: CheckCircle2 },
  ];

  const generalTips = language === 'ru' ? [
    { title: "Дворец памяти", desc: "Привязывайте факты к комнатам в вашем доме. Прогулка по дому в уме поможет вспомнить всё.", icon: Clock },
    { title: "Интерливинг", desc: "Смешивайте разные темы в одной сессии. Это учит мозг выбирать правильный метод решения.", icon: Zap },
    { title: "Кривая забывания", desc: "Повторите материал через 20 минут, 1 час и 9 часов. Это закрепит его в памяти.", icon: Clock },
    { title: "Ультрадианные ритмы", desc: "Работайте 90 минут, затем отдыхайте 20. Это соответствует природным циклам мозга.", icon: Users },
  ] : language === 'uz' ? [
    { title: "Xotira saroyi", desc: "Faktlarni uyingizdagi xonalar bilan bog'lang. Xayolan uyingizda yurish hamma narsani eslashga yordam beradi.", icon: Clock },
    { title: "Interleaving", desc: "Bir seansda turli mavzularni aralashtiring. Bu miyani to'g'ri yechim usulini tanlashga o'rgatadi.", icon: Zap },
    { title: "Unutish egri chizig'i", desc: "Materialni 20 daqiqa, 1 soat va 9 soatdan keyin takrorlang. Bu uni uzoq muddatli xotiraga muhrlaydi.", icon: Clock },
    { title: "Ultradian ritmlar", desc: "90 daqiqa ishlang, keyin 20 daqiqa dam oling. Bu miyaning tabiiy energiya davrlariga mos keladi.", icon: Users },
  ] : [
    { title: "Memory Palace", desc: "Link facts to rooms in your house. Walking through your home mentally helps you recall everything.", icon: Clock },
    { title: "Interleaving", desc: "Mix different subjects in one session. It trains your brain to choose the right solution method.", icon: Zap },
    { title: "Forgetting Curve", desc: "Review material after 20 mins, 1 hour, and 9 hours. This locks it into long-term memory.", icon: Clock },
    { title: "Ultradian Rhythms", desc: "Work for 90 mins, then rest for 20. This matches the brain's natural energy cycles.", icon: Users },
  ];


  const tabs: { id: TabId; label: string; hint: string; tips: typeof satTips; activeBg: string; tile: string; bar: string; hover: string }[] = [
    { id: 'sat', label: 'SAT', hint: t.satTips, tips: satTips, activeBg: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30', tile: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30', bar: 'from-indigo-400 to-indigo-600', hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/15' },
    { id: 'ielts', label: 'IELTS', hint: t.ieltsTips, tips: ieltsTips, activeBg: 'from-emerald-500 to-teal-600 shadow-emerald-500/30', tile: 'from-emerald-400 to-teal-600 shadow-emerald-500/30', bar: 'from-emerald-400 to-teal-500', hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/15' },
    { id: 'gen', label: tr('General', 'Общие', 'Umumiy'), hint: t.generalTipsSub, tips: generalTips, activeBg: 'from-purple-500 to-fuchsia-600 shadow-purple-500/30', tile: 'from-purple-400 to-fuchsia-600 shadow-purple-500/30', bar: 'from-purple-400 to-fuchsia-500', hover: 'hover:border-purple-500/40 hover:shadow-purple-500/15' },
  ];
  const current = tabs.find((x) => x.id === tab)!;
  const triedCount = (id: TabId, n: number) => Array.from({ length: n }).filter((_, i) => tried.includes(id + ':' + i)).length;
  const currentTried = triedCount(current.id, current.tips.length);
  const allTried = currentTried === current.tips.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-2">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{t.tips}</h1>
          <p className="text-[var(--muted)] font-medium max-w-2xl">{t.tipsSub}</p>
        </div>
        <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30 rounded-[1.5rem] items-center justify-center text-white shrink-0">
          <Lightbulb className="w-8 h-8" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-4">
        <div role="tablist" aria-label={t.tips} className="flex flex-wrap gap-2">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={'tips-tab-' + x.id}
              aria-selected={tab === x.id}
              aria-controls="tips-panel"
              onClick={() => setTab(x.id)}
              className={`h-11 pl-5 pr-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all motion-safe:active:scale-95 ${
                tab === x.id ? 'bg-gradient-to-r text-white shadow-lg ' + x.activeBg : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {x.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full font-bold tabular-nums ${tab === x.id ? 'bg-white/20' : 'bg-[var(--card)]'}`}>{triedCount(x.id, x.tips.length)}/{x.tips.length}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)]">
          {current.hint} {tr('Tap "I tried it" on tips you have used.', 'Нажимайте «Попробовал» на советах, которые уже применили.', "Qo'llagan maslahatlaringizda «Sinadim» tugmasini bosing.")}
        </p>
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={current.tips.length}
            aria-valuenow={currentTried}
            aria-label={tr('Tips tried', 'Применено советов', 'Sinalgan maslahatlar')}
            className="h-3 flex-1 rounded-full bg-[var(--input)] overflow-hidden"
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${current.bar}`}
              style={{ width: `${(currentTried / current.tips.length) * 100}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--input)] text-xs font-black tabular-nums text-[var(--text)]">
            {allTried && <Trophy className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />}
            {currentTried}/{current.tips.length}
          </span>
        </div>
      </div>

      <div id="tips-panel" role="tabpanel" aria-labelledby={'tips-tab-' + tab} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {current.tips.map((tip, i) => {
          const id = tab + ':' + i;
          const done = tried.includes(id);
          return (
            <Card
              key={id}
              className={`relative overflow-hidden p-6 rounded-[2rem] flex flex-col transition-all hover:shadow-xl motion-safe:hover:-translate-y-0.5 ${
                done ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40 hover:shadow-emerald-500/15' : current.hover
              }`}
            >
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${done ? 'from-emerald-400 to-emerald-600' : current.bar}`} />
              <div className="flex items-start justify-between mb-5 pt-1">
                <div className={`w-12 h-12 bg-gradient-to-br shadow-lg rounded-2xl flex items-center justify-center text-white ${done ? 'from-emerald-400 to-emerald-600 shadow-emerald-500/30' : current.tile}`}>
                  <tip.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <span aria-hidden="true" className="px-2.5 py-1 rounded-full bg-[var(--input)] text-[10px] font-black tabular-nums tracking-widest text-[var(--muted)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-lg font-black mb-2 text-[var(--text)] leading-snug">{tip.title}</h2>
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-5 flex-1">{tip.desc}</p>
              <button
                type="button"
                aria-pressed={done}
                onClick={() => toggleTried(id)}
                className={`inline-flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-black uppercase tracking-wider border transition-all motion-safe:active:scale-95 ${
                  done
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-white shadow-lg shadow-emerald-500/25'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-indigo-500/40 hover:bg-indigo-500/5'
                }`}
              >
                {done && <Check className="w-4 h-4" aria-hidden="true" />}
                {done ? tr('Tried', 'Попробовал', 'Sinadim') : tr('I tried it', 'Попробовал', 'Sinadim')}
              </button>
            </Card>
          );
        })}
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 text-white shadow-2xl shadow-indigo-500/25">
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 w-48 h-48 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="relative w-20 h-20 md:w-28 md:h-28 bg-white/15 ring-1 ring-white/30 rounded-[2rem] shrink-0 flex items-center justify-center shadow-xl">
          <Lightbulb className="w-10 h-10 md:w-14 md:h-14" aria-hidden="true" />
        </div>
        <div className="relative space-y-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t.proTipTitle}</h2>
          <p className="text-white/85 leading-relaxed text-base md:text-lg font-medium">{t.proTipDesc}</p>
        </div>
      </div>
    </div>
  );
};
