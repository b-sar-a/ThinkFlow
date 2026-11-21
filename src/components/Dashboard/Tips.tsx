
import React, { useState } from 'react';
import { Lightbulb, Clock, BookOpen, CheckCircle2, ArrowRight, Star, Target, Zap, FileText, BarChart3, Quote, Sparkles, Users, Brain } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader, Panel, Tabs } from '../ds';

export const Tips: React.FC = () => {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<'sat' | 'ielts' | 'general'>('sat');

  const satTips = language === 'ru' ? [
    { title: "Техника Фейнмана", desc: "Объясните сложную задачу SAT 10-летнему ребенку. Если вы не можете — вы не понимаете ее до конца.", icon: Brain },
    { title: "Интервальные повторения", desc: "Не зубрите всё сразу. Повторяйте сложные правила через 1, 3 и 7 дней для вечного запоминания.", icon: Zap },
    { title: "Активное вспоминание", desc: "Вместо чтения конспектов, закройте книгу и запишите всё, что помните. Это в 3 раза эффективнее.", icon: BookOpen },
    { title: "Эффект Зейгарник", desc: "Делайте перерыв на самом интересном месте задачи. Мозг продолжит решать ее в фоновом режиме.", icon: Target },
    { title: "Метод исключения", desc: "В SAT всегда 3 ответа абсолютно неверны. Ищите ошибки, а не правильный ответ.", icon: CheckCircle2 },
    { title: "Темп в математике", desc: "Первые 10 вопросов — это разминка. Решайте их за 5 минут, чтобы оставить время на финал.", icon: Clock },
    { title: "Грамматический скелет", desc: "Игнорируйте лишние слова в предложении. Найдите только подлежащее и сказуемое.", icon: FileText },
    { title: "Визуализация данных", desc: "В секции анализа данных сначала посмотрите на оси графика, а потом на сам вопрос.", icon: BarChart3 },
  ] : language === 'uz' ? [
    { title: "Feynman texnikasi", desc: "Murakkab SAT muammosini 10 yoshli bolaga tushuntiring. Agar tushuntirolmasangiz, demak o'zingiz ham hali to'liq tushunmagansiz.", icon: Brain },
    { title: "Interval takrorlash", desc: "Hammasini birdan yodlamang. Doimiy xotira uchun qiyin qoidalarni 1, 3 va 7 kunlik intervallarda takrorlang.", icon: Zap },
    { title: "Faol eslash", desc: "Konspektlarni qayta o'qish o'rniga, kitobni yoping va eslagan hamma narsangizni yozing. Bu 3 baravar samaraliroq.", icon: BookOpen },
    { title: "Zeygarnik effekti", desc: "Muammoning eng qiziqarli joyida tanaffus qiling. Miyangiz uni fonda hal qilishda davom etadi.", icon: Target },
    { title: "Istisno qilish usuli", desc: "SATda 3 ta javob har doim xato bo'ladi. To'g'ri javobni emas, xatolarni qidiring.", icon: CheckCircle2 },
    { title: "Matematika sur'ati", desc: "Dastlabki 10 ta savol - bu isinish. Final uchun vaqtni tejash uchun ularni 5 daqiqada hal qiling.", icon: Clock },
    { title: "Grammatika skeleti", desc: "Gapdagi ortiqcha so'zlarga e'tibor bermang. Xatolarni aniqlash uchun faqat ega va kesimni toping.", icon: FileText },
    { title: "Ma'lumotlarni vizuallashtirish", desc: "Ma'lumotlarni tahlil qilish bo'limida avval grafik o'qlariga, keyin savolning o'ziga qarang.", icon: BarChart3 },
  ] : [
    { title: "Feynman Technique", desc: "Explain a complex SAT problem to a 10-year-old. If you can't, you don't fully understand it yet.", icon: Brain },
    { title: "Spaced Repetition", desc: "Don't cram. Review hard rules at 1, 3, and 7-day intervals for permanent memory.", icon: Zap },
    { title: "Active Recall", desc: "Instead of re-reading notes, close the book and write down everything you remember. It's 3x more effective.", icon: BookOpen },
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
    { title: "Обзор Task 1", desc: "Без четкого Overview (обзора тенденций) вы никогда не получите выше 6.0 за Task 1.", icon: BarChart3 },
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
    { title: "Task 1 sharhi", desc: "Aniq Overview (trend xulosasi) bo'lmasa, Task 1 uchun hech qachon 6.0 dan yuqori ball ololmaysiz.", icon: BarChart3 },
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
    { title: "Task 1 Overview", desc: "Without a clear Overview (trend summary), you'll never get above 6.0 for Task 1.", icon: BarChart3 },
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

  const groups = {
    sat: { label: "SAT", title: t.sat, sub: t.satTips, tips: satTips },
    ielts: { label: "IELTS", title: t.ielts, sub: t.ieltsTips, tips: ieltsTips },
    general: { label: t.generalTips, title: t.generalTips, sub: t.generalTipsSub, tips: generalTips },
  } as const;
  const group = groups[tab];

  return (
    <>
      <PageHeader title={t.tips} description={t.tipsSub} />
      <Tabs<'sat' | 'ielts' | 'general'>
        label={t.tips}
        value={tab}
        onChange={setTab}
        tabs={(Object.keys(groups) as (keyof typeof groups)[]).map((id) => ({ id, label: groups[id].label }))}
      />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <p className="mb-4 max-w-2xl text-[15px] text-fg-muted">{group.sub}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {group.tips.map((tip) => (
            <li key={tip.title}>
              <Panel className="h-full p-4">
                <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
                  <tip.icon className="size-4" />
                </span>
                <h2 className="text-[15px] font-semibold text-fg">{tip.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{tip.desc}</p>
              </Panel>
            </li>
          ))}
        </ul>
      </div>

      <Panel className="mt-8 flex max-w-3xl items-start gap-4 p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hl text-on-hl" aria-hidden="true">
          <Lightbulb className="size-[18px]" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">{t.proTipTitle}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-fg-muted">{t.proTipDesc}</p>
        </div>
      </Panel>
    </>
  );
};
