import type { KnowledgeTree } from '../types';

type L3 = { en: string; ru: string; uz: string };

interface PresetNode {
  id: string;
  label: L3;
  description: L3;
  metaphor: L3;
  challenge: L3;
  points: number;
  type: 'core' | 'branch' | 'leaf';
}

export interface LabPreset {
  id: string;
  title: L3;
  theme: string;
  nodes: PresetNode[];
}

/** Ready-made courses of the Genius Lab: no AI tokens are spent on them. */
export const LAB_PRESETS: LabPreset[] = [
  {
    id: 'physics_ege',
    title: { en: 'Physics Exam Prep', ru: 'Подготовка к экзамену по физике', uz: 'Fizikadan imtihonga tayyorgarlik' },
    theme: 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 bg-amber-500/5',
    nodes: [
      {
        id: 'p1',
        label: { en: 'Kinematics and Dynamics', ru: 'Кинематика и Динамика', uz: 'Kinematika va dinamika' },
        description: {
          en: "The basics of mechanical motion: Newton's laws and the forces of elasticity, friction and gravity.",
          ru: 'Основы физики механического движения, законы Ньютона, силы упругости, трения и гравитации.',
          uz: "Mexanik harakat asoslari: Nyuton qonunlari, elastiklik, ishqalanish va og'irlik kuchlari.",
        },
        metaphor: {
          en: 'A space tug: you calculate the path for docking with an orbital station.',
          ru: 'Космический буксир: рассчитываем траекторию стыковки с орбитальной станцией.',
          uz: "Kosmik tortuvchi: orbital stansiya bilan ulanish traektoriyasini hisoblaymiz.",
        },
        challenge: {
          en: 'Find the acceleration of a 5 kg body under a force of 20 N (give a number in m/s²).',
          ru: 'Определите ускорение тела массой 5 кг под действием силы 20 Н (ответ числом в м/с²).',
          uz: "Massasi 5 kg bo'lgan jismning 20 N kuch ta'siridagi tezlanishini toping (javobni m/s² da son bilan yozing).",
        },
        points: 100,
        type: 'core',
      },
      {
        id: 'p2',
        label: { en: 'Electromagnetism', ru: 'Электромагнетизм', uz: 'Elektromagnetizm' },
        description: {
          en: "Electrostatics, Coulomb's law, the magnetic field, the Lorentz force and electromagnetic induction.",
          ru: 'Электростатика, закон Кулона, магнитное поле, сила Лоренца и электромагнитная индукция.',
          uz: "Elektrostatika, Kulon qonuni, magnit maydon, Lorens kuchi va elektromagnit induksiya.",
        },
        metaphor: {
          en: "A starship's energy shield: you tune the field strength to repel plasma.",
          ru: 'Энергетический щит звездолета: настройка напряженности поля для отражения плазмы.',
          uz: "Yulduz kemasining energiya qalqoni: plazmani qaytarish uchun maydon kuchlanganligini sozlaymiz.",
        },
        challenge: {
          en: 'What is the work done by the field when a charge of 2 C moves across a potential difference of 10 V? (in J)',
          ru: 'Чему равна работа поля по переносу заряда 2 Кл при разности потенциалов 10 В? (в Дж)',
          uz: "2 C zaryadni 10 V potensiallar farqida ko'chirishda maydon bajargan ish nimaga teng? (J da)",
        },
        points: 150,
        type: 'branch',
      },
      {
        id: 'p3',
        label: { en: 'Quantum Physics', ru: 'Квантовая Физика', uz: 'Kvant fizikasi' },
        description: {
          en: "The photoelectric effect, Einstein's equation, quantum energy levels of atoms and radiation.",
          ru: 'Фотоэффект, уравнение Эйнштейна, квантовые уровни энергии атомов и излучение.',
          uz: "Fotoeffekt, Eynshteyn tenglamasi, atomlarning kvant energiya sathlari va nurlanish.",
        },
        metaphor: {
          en: 'Photon cannons: you calibrate the beam wavelength to get through crystal screens.',
          ru: 'Фотонные пушки: калибровка длины волны луча для преодоления кристаллических экранов.',
          uz: "Foton to'plari: kristall ekranlardan o'tish uchun nur to'lqin uzunligini sozlaymiz.",
        },
        challenge: {
          en: 'Which scientist proposed the equation of the photoelectric effect and received the Nobel Prize for it?',
          ru: 'Какой ученый предложил уравнение фотоэффекта, за что получил Нобелевскую премию?',
          uz: "Qaysi olim fotoeffekt tenglamasini taklif qilgan va buning uchun Nobel mukofotini olgan?",
        },
        points: 200,
        type: 'leaf',
      },
    ],
  },
  {
    id: 'python_basics',
    title: { en: 'Python Basics', ru: 'Основы Python', uz: 'Python asoslari' },
    theme: 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 bg-emerald-500/5',
    nodes: [
      {
        id: 'py1',
        label: { en: 'Variables and Loops', ru: 'Переменные и Циклы', uz: "O'zgaruvchilar va sikllar" },
        description: {
          en: 'Declaring variables, basic data types, for/while loops and branching.',
          ru: 'Объявление переменных, базовые типы данных, циклы for/while и структуры ветвления.',
          uz: "O'zgaruvchilarni e'lon qilish, asosiy ma'lumot turlari, for/while sikllari va tarmoqlanish.",
        },
        metaphor: {
          en: 'An automatic assembly line: boxes of materials and repeating conveyors.',
          ru: 'Автоматическая сборочная линия: коробки с материалами и повторяющиеся конвейеры.',
          uz: "Avtomatik yig'ish liniyasi: materiallar solingan qutilar va takrorlanuvchi konveyerlar.",
        },
        challenge: {
          en: 'What is the name of the function that prints data to the console in Python?',
          ru: 'Как называется функция, выводящая данные в консоль в Python?',
          uz: "Python'da ma'lumotni konsolga chiqaradigan funksiya qanday nomlanadi?",
        },
        points: 100,
        type: 'core',
      },
      {
        id: 'py2',
        label: { en: 'Functions and OOP', ru: 'Функции и ООП', uz: 'Funksiyalar va OOP' },
        description: {
          en: 'Functions as building blocks, classes, inheritance, polymorphism and encapsulation.',
          ru: 'Функции как строительные блоки, классы, наследование, полиморфизм и инкапсуляция.',
          uz: "Funksiyalar qurilish bloklari sifatida, sinflar, merosxo'rlik, polimorfizm va inkapsulyatsiya.",
        },
        metaphor: {
          en: 'A robot workshop: you create blueprints (classes) and launch unique robots (instances).',
          ru: 'Конструктор роботов: создание чертежей (классов) и запуск уникальных робо-ботов (экземпляров).',
          uz: "Robotlar ustaxonasi: chizmalar (sinflar) yaratamiz va noyob robotlarni (nusxalarni) ishga tushiramiz.",
        },
        challenge: {
          en: 'Which keyword is used to declare a function in Python?',
          ru: 'Какое ключевое слово используется для объявления функции в Python?',
          uz: "Python'da funksiyani e'lon qilish uchun qaysi kalit so'z ishlatiladi?",
        },
        points: 150,
        type: 'branch',
      },
      {
        id: 'py3',
        label: { en: 'Working with JSON and APIs', ru: 'Работа с JSON и API', uz: 'JSON va API bilan ishlash' },
        description: {
          en: 'Importing modules, handling exceptions, sending HTTP requests and parsing JSON objects.',
          ru: 'Импорт модулей, обработка исключений, отправка HTTP и парсинг JSON объектов.',
          uz: "Modullarni import qilish, istisnolarni qayta ishlash, HTTP so'rovlarini yuborish va JSON obyektlarini tahlil qilish.",
        },
        metaphor: {
          en: 'An intergalactic post hub: you receive coded capsules and send replies to the addressees.',
          ru: 'Межгалактический почтовый хаб: получение кодированных капсул и отправка ответов адресатам.',
          uz: "Galaktikalararo pochta markazi: kodlangan kapsulalarni qabul qilamiz va manzilga javob yuboramiz.",
        },
        challenge: {
          en: 'Which dict method returns the value for a key without raising a KeyError?',
          ru: 'Какой метод объекта dict возвращает значение по ключу, не вызывая ошибку KeyError?',
          uz: "dict obyektining qaysi metodi KeyError xatosini chiqarmasdan kalit bo'yicha qiymatni qaytaradi?",
        },
        points: 200,
        type: 'leaf',
      },
    ],
  },
  {
    id: 'history_ca',
    title: { en: 'Central Asia: History', ru: 'Центральная Азия: история', uz: "Markaziy Osiyo tarixi" },
    theme: 'border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500 bg-indigo-500/5',
    nodes: [
      {
        id: 'h1',
        label: { en: 'The Golden Age of Science', ru: 'Золотой век науки', uz: 'Fanning oltin davri' },
        description: {
          en: 'Al-Khwarizmi, al-Biruni and Ibn Sina: how scholars from Central Asia shaped mathematics, astronomy and medicine.',
          ru: 'Ал-Хорезми, ал-Бируни и Ибн Сина: как учёные Центральной Азии развивали математику, астрономию и медицину.',
          uz: "Al-Xorazmiy, Beruniy va Ibn Sino: Markaziy Osiyo olimlari matematika, astronomiya va tibbiyotni qanday rivojlantirgan.",
        },
        metaphor: {
          en: 'A caravan of ideas: knowledge travels along the Silk Road together with spices and silk.',
          ru: 'Караван идей: знания путешествуют по Шёлковому пути вместе со специями и шёлком.',
          uz: "G'oyalar karvoni: bilimlar Ipak yo'li bo'ylab ziravorlar va ipak bilan birga sayohat qiladi.",
        },
        challenge: {
          en: 'The word "algebra" comes from the title of a book by which scholar?',
          ru: 'От названия книги какого учёного произошло слово «алгебра»?',
          uz: "«Algebra» so'zi qaysi olim kitobining nomidan kelib chiqqan?",
        },
        points: 100,
        type: 'core',
      },
      {
        id: 'h2',
        label: { en: 'Amir Temur and the Timurids', ru: 'Амир Темур и Темуриды', uz: 'Amir Temur va temuriylar' },
        description: {
          en: 'The empire of Amir Temur, the rise of Samarkand and the science of Mirzo Ulugbek.',
          ru: 'Империя Амира Темура, расцвет Самарканда и наука Мирзо Улугбека.',
          uz: "Amir Temur imperiyasi, Samarqandning gullab-yashnashi va Mirzo Ulug'bek fani.",
        },
        metaphor: {
          en: 'A chess game of empires: every move of a ruler changes the map of the world.',
          ru: 'Шахматная партия империй: каждый ход правителя меняет карту мира.',
          uz: "Imperiyalar shaxmat o'yini: hukmdorning har bir yurishi dunyo xaritasini o'zgartiradi.",
        },
        challenge: {
          en: 'Which city became the capital of the state of Amir Temur?',
          ru: 'Какой город стал столицей государства Амира Темура?',
          uz: "Qaysi shahar Amir Temur davlatining poytaxti bo'lgan?",
        },
        points: 150,
        type: 'branch',
      },
      {
        id: 'h3',
        label: { en: 'The Road to Independence', ru: 'Путь к независимости', uz: "Mustaqillikka yo'l" },
        description: {
          en: 'From the khanates and the Uzbek SSR to the declaration of independence and the Constitution.',
          ru: 'От ханств и Узбекской ССР к провозглашению независимости и Конституции.',
          uz: "Xonliklar va O'zbekiston SSRdan mustaqillik e'lon qilinishi va Konstitutsiyagacha.",
        },
        metaphor: {
          en: 'A new page: a country writes its own story with its own hands.',
          ru: 'Новая страница: страна пишет свою историю собственными руками.',
          uz: "Yangi sahifa: mamlakat o'z tarixini o'z qo'llari bilan yozadi.",
        },
        challenge: {
          en: 'In what year did Uzbekistan declare independence?',
          ru: 'В каком году Узбекистан провозгласил независимость?',
          uz: "O'zbekiston qaysi yilda mustaqilligini e'lon qildi?",
        },
        points: 200,
        type: 'leaf',
      },
    ],
  },
];

/** The preset as a knowledge tree in the given language. */
export function presetTree(preset: LabPreset, lang: 'en' | 'ru' | 'uz'): KnowledgeTree {
  return {
    topic: preset.title[lang],
    nodes: preset.nodes.map((n) => ({
      id: n.id,
      label: n.label[lang],
      description: n.description[lang],
      metaphor: n.metaphor[lang],
      challenge: n.challenge[lang],
      points: n.points,
      type: n.type,
      completed: false,
    })),
    connections: preset.nodes.slice(1).map((n, i) => ({ from: preset.nodes[i].id, to: n.id })),
  };
}
