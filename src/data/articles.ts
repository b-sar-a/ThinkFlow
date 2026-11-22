export type ArticleLang = 'en' | 'ru' | 'uz';
export type Subject = 'physics' | 'algebra' | 'english' | 'biology' | 'chemistry' | 'history';

export interface ArticleText {
  title: string;
  summary: string;
  body: string[];
  tryIt: { question: string; answer: string };
  /** What gets pre-filled in the Genius Lab when the student taps "Explore in the Lab". */
  labTopic: string;
}

export interface LearningArticle {
  id: string;
  subject: Subject;
  minutes: number;
  en: ArticleText;
  ru: ArticleText;
  /** Uzbek: title + summary + lab topic. The body falls back to Russian. */
  uz: Pick<ArticleText, 'title' | 'summary' | 'labTopic'>;
}

export const SUBJECT_LABELS: Record<Subject, Record<ArticleLang, string>> = {
  physics: { en: 'Physics', ru: 'Физика', uz: 'Fizika' },
  algebra: { en: 'Algebra', ru: 'Алгебра', uz: 'Algebra' },
  english: { en: 'English', ru: 'Английский', uz: 'Ingliz tili' },
  biology: { en: 'Biology', ru: 'Биология', uz: 'Biologiya' },
  chemistry: { en: 'Chemistry', ru: 'Химия', uz: 'Kimyo' },
  history: { en: 'History', ru: 'История', uz: 'Tarix' },
};

export const LEARNING_ARTICLES: LearningArticle[] = [
  {
    id: 'physics-momentum',
    subject: 'physics',
    minutes: 3,
    en: {
      title: 'Momentum: why a follow-through works',
      summary: 'Why a longer kick sends the ball faster, and how to calculate it.',
      body: [
        'Momentum is mass times velocity: p = m·v. A heavy, fast object has a lot of it; a light, slow one has little.',
        'To change an object\'s momentum you need an impulse: force multiplied by the time it acts, J = F·Δt. The impulse equals the change in momentum: F·Δt = Δp.',
        'That is why footballers follow through. The longer the foot stays in contact with the ball, the larger Δt is, so the ball gets more momentum and leaves faster, even if the force is the same.',
        'In a closed system with no outside forces, the total momentum before a collision equals the total momentum after it. This is the law of conservation of momentum, and it explains recoil and billiard shots alike.',
      ],
      tryIt: {
        question: 'A 0.4 kg ball starts at rest and leaves the foot at 20 m/s. What impulse did it get? If the contact lasted 0.01 s, what was the average force?',
        answer: 'Δp = m·v = 0.4 × 20 = 8 N·s. F = Δp / Δt = 8 / 0.01 = 800 N.',
      },
      labTopic: 'Momentum and impulse in sports',
    },
    ru: {
      title: 'Импульс: зачем нужен «проводящий» удар',
      summary: 'Почему более долгий контакт с мячом делает удар сильнее, и как это посчитать.',
      body: [
        'Импульс тела — это масса, умноженная на скорость: p = m·v. У тяжёлого быстрого тела импульс большой, у лёгкого медленного — маленький.',
        'Чтобы изменить импульс, нужен импульс силы: сила, умноженная на время её действия, J = F·Δt. Он равен изменению импульса тела: F·Δt = Δp.',
        'Поэтому футболисты «проводят» удар. Чем дольше стопа касается мяча, тем больше Δt, а значит, мяч получает больше импульса и вылетает быстрее, даже если сила та же.',
        'В замкнутой системе без внешних сил суммарный импульс до столкновения равен суммарному импульсу после него. Это закон сохранения импульса: он объясняет и отдачу при выстреле, и удар в бильярде.',
      ],
      tryIt: {
        question: 'Мяч массой 0,4 кг покоился и после удара полетел со скоростью 20 м/с. Какой импульс он получил? Какова средняя сила, если контакт длился 0,01 с?',
        answer: 'Δp = m·v = 0,4 × 20 = 8 Н·с. F = Δp / Δt = 8 / 0,01 = 800 Н.',
      },
      labTopic: 'Импульс и закон сохранения импульса на примере спорта',
    },
    uz: {
      title: 'Impuls: nega zarbani davom ettirish kerak',
      summary: "To'p bilan aloqa uzoqroq bo'lsa, zarba nega kuchliroq bo'ladi va buni qanday hisoblash mumkin.",
      labTopic: 'Impuls va impulsning saqlanish qonuni (sport misolida)',
    },
  },
  {
    id: 'algebra-solving-x',
    subject: 'algebra',
    minutes: 3,
    en: {
      title: 'Solving for x: the balance rule',
      summary: 'One rule that solves every linear equation: do the same thing to both sides.',
      body: [
        'An equation is a balanced scale. Whatever you do to one side, you must do to the other, or the balance breaks.',
        'The goal is to get x alone. Undo operations in reverse order: first remove what is added or subtracted, then what is multiplied or divided.',
        'Example: 3x + 5 = 20. Subtract 5 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
        'Always check by putting the answer back: 3·5 + 5 = 20. If both sides match, the answer is right. The check takes ten seconds and catches most mistakes.',
      ],
      tryIt: {
        question: 'Solve 2x − 7 = 11 and check your answer.',
        answer: 'Add 7 to both sides: 2x = 18. Divide by 2: x = 9. Check: 2·9 − 7 = 11. ✓',
      },
      labTopic: 'Linear equations: solving for x',
    },
    ru: {
      title: 'Решаем уравнение: правило весов',
      summary: 'Одно правило, которое решает любое линейное уравнение: делай одно и то же с обеими частями.',
      body: [
        'Уравнение — это весы в равновесии. Что сделали с одной стороной, то обязательно делаем и с другой, иначе равновесие нарушится.',
        'Цель — оставить x одного. Действия отменяем в обратном порядке: сначала убираем то, что прибавлено или вычтено, потом то, что умножено или разделено.',
        'Пример: 3x + 5 = 20. Вычтем 5 из обеих частей: 3x = 15. Разделим обе части на 3: x = 5.',
        'Всегда делайте проверку: подставьте ответ обратно, 3·5 + 5 = 20. Если обе части совпали, ответ верный. Проверка занимает десять секунд и ловит большинство ошибок.',
      ],
      tryIt: {
        question: 'Решите уравнение 2x − 7 = 11 и проверьте ответ.',
        answer: 'Прибавим 7 к обеим частям: 2x = 18. Разделим на 2: x = 9. Проверка: 2·9 − 7 = 11. ✓',
      },
      labTopic: 'Линейные уравнения: как найти x',
    },
    uz: {
      title: 'x ni topish: tarozi qoidasi',
      summary: "Har qanday chiziqli tenglamani yechadigan bitta qoida: ikkala tomonga ham bir xil amalni bajaring.",
      labTopic: 'Chiziqli tenglamalar: x ni topish',
    },
  },
  {
    id: 'english-peel',
    subject: 'english',
    minutes: 4,
    en: {
      title: 'A persuasive paragraph in four steps',
      summary: 'The PEEL structure that turns an opinion into an argument.',
      body: [
        'A persuasive paragraph does one job: it makes one claim and proves it. PEEL gives it four parts.',
        'Point: state your claim in one clear sentence. Evidence: give a fact, a number or an example. Explanation: say why the evidence supports your point. Link: tie it back to the question or lead into the next paragraph.',
        'The most common mistake is skipping Explanation. Evidence does not speak for itself; the reader needs you to say what it shows.',
        'Linking words keep the logic visible: because, for example, this shows that, as a result, therefore.',
      ],
      tryIt: {
        question: 'Write a four-sentence PEEL paragraph on: "School should start later in the morning."',
        answer: 'Point: School should start later because teenagers need more sleep. Evidence: Studies of sleep in teenagers suggest that they naturally fall asleep and wake later than younger children. Explanation: This means an early start leaves many students tired during the first lessons, when they learn less. Link: Therefore a later start would help students concentrate and perform better.',
      },
      labTopic: 'How to write a persuasive paragraph (PEEL)',
    },
    ru: {
      title: 'Убедительный абзац за четыре шага',
      summary: 'Структура PEEL, которая превращает мнение в аргумент.',
      body: [
        'У убедительного абзаца одна задача: выдвинуть одну мысль и доказать её. Структура PEEL даёт ему четыре части.',
        'Point — сформулируйте мысль одним ясным предложением. Evidence — приведите факт, число или пример. Explanation — объясните, почему это доказывает вашу мысль. Link — свяжите вывод с вопросом или подведите к следующему абзацу.',
        'Самая частая ошибка — пропустить Explanation. Факт сам по себе ничего не доказывает: читателю нужно, чтобы вы сказали, что он показывает.',
        'Связки делают логику видимой: because, for example, this shows that, as a result, therefore.',
      ],
      tryIt: {
        question: 'Напишите абзац PEEL из четырёх предложений на тему: «School should start later in the morning».',
        answer: 'Point: School should start later because teenagers need more sleep. Evidence: Studies of sleep in teenagers suggest that they naturally fall asleep and wake later than younger children. Explanation: This means an early start leaves many students tired during the first lessons, when they learn less. Link: Therefore a later start would help students concentrate and perform better.',
      },
      labTopic: 'Как написать убедительный абзац по английскому (PEEL)',
    },
    uz: {
      title: "Ishonarli paragraf: to'rt qadam",
      summary: "Fikrni dalilga aylantiradigan PEEL tuzilmasi.",
      labTopic: 'Ishonarli paragraf yozish (PEEL)',
    },
  },
  {
    id: 'biology-central-dogma',
    subject: 'biology',
    minutes: 4,
    en: {
      title: 'From DNA to protein',
      summary: 'How a cell reads its instructions: DNA to RNA to protein.',
      body: [
        'DNA stores the instructions of a cell. It is written with four letters: A, T, C and G. A gene is a section of DNA that holds the recipe for one protein.',
        'Step 1, transcription: the cell copies a gene into a messenger molecule, mRNA. RNA uses U instead of T, so A pairs with U, and C pairs with G.',
        'Step 2, translation: a ribosome reads the mRNA three letters at a time. Each triplet, called a codon, stands for one amino acid. The ribosome joins amino acids in order, and the chain folds into a protein.',
        'AUG is the start codon. Proteins do the work in the body: they build tissues, carry oxygen and speed up reactions. Change one letter in DNA and a protein can change, which is how some inherited conditions appear.',
      ],
      tryIt: {
        question: 'A DNA template strand reads TAC CCG. What is the mRNA, and what does the first codon do?',
        answer: 'Pair each base: T→A, A→U, C→G, so TAC → AUG; C→G, C→G, G→C, so CCG → GGC. The mRNA is AUG GGC. The first codon, AUG, is the start codon.',
      },
      labTopic: 'From DNA to protein: transcription and translation',
    },
    ru: {
      title: 'От ДНК к белку',
      summary: 'Как клетка читает свои инструкции: ДНК, РНК, белок.',
      body: [
        'ДНК хранит инструкции клетки. Она записана четырьмя буквами: A, T, C и G. Ген — это участок ДНК с рецептом одного белка.',
        'Шаг 1, транскрипция: клетка копирует ген в молекулу-посредника, иРНК. В РНК вместо T стоит U, поэтому A паруется с U, а C с G.',
        'Шаг 2, трансляция: рибосома читает иРНК по три буквы. Каждый триплет, или кодон, обозначает одну аминокислоту. Рибосома соединяет аминокислоты по порядку, и цепочка сворачивается в белок.',
        'AUG — стартовый кодон. Белки выполняют работу в организме: строят ткани, переносят кислород, ускоряют реакции. Замена одной буквы в ДНК может изменить белок, так возникают некоторые наследственные заболевания.',
      ],
      tryIt: {
        question: 'Матричная цепь ДНК читается как TAC CCG. Какова иРНК и что делает первый кодон?',
        answer: 'Парим основания: T→A, A→U, C→G, значит TAC → AUG; C→G, C→G, G→C, значит CCG → GGC. иРНК: AUG GGC. Первый кодон AUG — стартовый.',
      },
      labTopic: 'От ДНК к белку: транскрипция и трансляция',
    },
    uz: {
      title: 'DNKdan oqsilgacha',
      summary: "Hujayra o'z ko'rsatmalarini qanday o'qiydi: DNK, RNK, oqsil.",
      labTopic: 'DNKdan oqsilgacha: transkripsiya va translyatsiya',
    },
  },
  {
    id: 'chemistry-bonds',
    subject: 'chemistry',
    minutes: 3,
    en: {
      title: 'Chemical bonds: give, share, pool',
      summary: 'How to tell ionic, covalent and metallic bonds apart in one minute.',
      body: [
        'Atoms bond to get a full outer shell of electrons. They can do it in three ways.',
        'Ionic bond: one atom gives electrons to another. This usually happens between a metal and a non-metal, such as Na and Cl in salt. The atoms become oppositely charged ions that attract each other.',
        'Covalent bond: atoms share electrons. This happens between non-metals, such as the hydrogen and oxygen in water. Metallic bond: metal atoms release electrons into a shared "sea", which is why metals conduct electricity.',
        'A quick test is to look at the elements. Metal plus non-metal: think ionic. Two non-metals: think covalent. Metals only: metallic.',
      ],
      tryIt: {
        question: 'What type of bond holds MgO together, and which atom gives electrons? What about CO₂?',
        answer: 'MgO is ionic: magnesium (a metal) gives two electrons to oxygen, forming Mg²⁺ and O²⁻. CO₂ is covalent: carbon and oxygen are both non-metals and share electrons.',
      },
      labTopic: 'Types of chemical bonds: ionic, covalent, metallic',
    },
    ru: {
      title: 'Химические связи: отдать, поделиться, объединить',
      summary: 'Как за минуту отличить ионную, ковалентную и металлическую связь.',
      body: [
        'Атомы вступают в связь, чтобы получить завершённую внешнюю электронную оболочку. Сделать это можно тремя способами.',
        'Ионная связь: один атом отдаёт электроны другому. Обычно это металл и неметалл, например Na и Cl в поваренной соли. Атомы становятся разноимённо заряженными ионами и притягиваются.',
        'Ковалентная связь: атомы делят электроны. Так связаны неметаллы, например водород и кислород в воде. Металлическая связь: атомы металла отдают электроны в общее «море», поэтому металлы проводят ток.',
        'Быстрый тест — посмотреть на элементы. Металл и неметалл: скорее всего ионная. Два неметалла: ковалентная. Только металлы: металлическая.',
      ],
      tryIt: {
        question: 'Какая связь в MgO и какой атом отдаёт электроны? А в CO₂?',
        answer: 'MgO — ионная: магний (металл) отдаёт два электрона кислороду, образуются Mg²⁺ и O²⁻. CO₂ — ковалентная: углерод и кислород — неметаллы, они делят электроны.',
      },
      labTopic: 'Виды химических связей: ионная, ковалентная, металлическая',
    },
    uz: {
      title: 'Kimyoviy bog\'lanishlar: berish, bo\'lishish, birlashtirish',
      summary: "Ion, kovalent va metall bog'lanishni bir daqiqada farqlash usuli.",
      labTopic: "Kimyoviy bog'lanish turlari: ion, kovalent, metall",
    },
  },
  {
    id: 'history-cause-chain',
    subject: 'history',
    minutes: 4,
    en: {
      title: 'Reading history as a chain of causes',
      summary: 'A method for any history topic, shown on the Industrial Revolution.',
      body: [
        'Dates are easy to forget. Chains of cause and effect are not. For any event, ask four questions: what changed, why then, who gained or lost, and what happened next.',
        'Take the Industrial Revolution, which began in Britain in the second half of the 18th century. New machines and the improved steam engine moved work from homes into factories.',
        'That change had consequences. People moved to cities to work in factories. Cities grew fast and were crowded. Workers, including children, faced long hours and dangerous conditions.',
        'Those conditions led to reform. In Britain, laws such as the Factory Act of 1833 began to limit child labour. One new technology produced economic, social and political effects, in that order.',
      ],
      tryIt: {
        question: 'Pick a technology you use every day, like the smartphone, and write a chain of three effects: economic, social, political.',
        answer: 'There is no single right answer. A sample: Economic, whole new industries such as app development appeared. Social, people keep in touch across distances and spend more time online. Political, governments debate how to regulate data and online content.',
      },
      labTopic: 'The Industrial Revolution: causes and consequences',
    },
    ru: {
      title: 'История как цепочка причин',
      summary: 'Метод для любой темы по истории на примере промышленной революции.',
      body: [
        'Даты легко забываются. Цепочки причин и следствий — нет. Про любое событие задайте четыре вопроса: что изменилось, почему именно тогда, кто выиграл и проиграл, что случилось дальше.',
        'Возьмём промышленную революцию, которая началась в Британии во второй половине XVIII века. Новые машины и усовершенствованная паровая машина перенесли работу из домов на фабрики.',
        'У этого были последствия. Люди переезжали в города работать на фабриках. Города быстро росли и были переполнены. Рабочие, включая детей, трудились долго и в опасных условиях.',
        'Такие условия привели к реформам. В Британии законы, например Фабричный акт 1833 года, начали ограничивать детский труд. Одна новая технология вызвала экономические, социальные и политические последствия, именно в таком порядке.',
      ],
      tryIt: {
        question: 'Выберите технологию, которой пользуетесь каждый день, например смартфон, и составьте цепочку из трёх последствий: экономическое, социальное, политическое.',
        answer: 'Единственного правильного ответа нет. Пример: экономическое — появились целые отрасли, например разработка приложений. Социальное — люди общаются на расстоянии и больше времени проводят онлайн. Политическое — государства спорят, как регулировать данные и контент в сети.',
      },
      labTopic: 'Промышленная революция: причины и последствия',
    },
    uz: {
      title: "Tarixni sabablar zanjiri sifatida o'qish",
      summary: "Har qanday tarix mavzusi uchun usul, sanoat inqilobi misolida.",
      labTopic: 'Sanoat inqilobi: sabablari va oqibatlari',
    },
  },
];
