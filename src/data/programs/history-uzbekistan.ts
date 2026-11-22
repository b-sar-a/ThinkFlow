import { Program, bi, biList } from './types';

export const historyUzbekistan: Program = {
  id: 'history-uzbekistan',
  kind: 'school',
  icon: 'landmark',
  accent: 'orange',
  title: { en: 'History: Central Asia, key dates', ru: 'История: Центральная Азия, главные даты', uz: "Tarix: Markaziy Osiyo, asosiy sanalar" },
  summary: {
    en: 'Scholars of the Golden Age, Amir Temur and the Timurids, Navoi and Babur, and the road to independence: dates and people to know.',
    ru: 'Учёные золотого века, Амир Темур и Темуриды, Навои и Бабур, путь к независимости: даты и имена, которые нужно знать.',
    uz: "Oltin asr olimlari, Amir Temur va temuriylar, Navoiy va Bobur, mustaqillikka yo'l: bilish kerak bo'lgan sanalar va ismlar.",
  },
  audience: { en: 'Grades 7–11', ru: '7–11 классы', uz: '7–11-sinflar' },
  lessons: [
    {
      id: 'scholars',
      title: { en: 'Scholars of the Golden Age', ru: 'Учёные золотого века', uz: 'Oltin asr olimlari' },
      teach: biList(
        [
          'Between the 9th and 11th centuries scholars from Central Asia made discoveries that shaped world science. Muhammad al-Khwarizmi (about 780–850) worked in Baghdad and wrote the book on "al-jabr", the origin of the word "algebra". The word "algorithm" also comes from his name.',
          'Abu Rayhan al-Biruni (973–1048), born in Khwarazm, studied astronomy, geography and history, and calculated the size of the Earth. Ibn Sina (Avicenna, 980–1037), born near Bukhara, wrote "The Canon of Medicine", used in Europe for centuries.',
          'To work with dates: the length of a life is the year of death minus the year of birth.',
        ],
        [
          'Между IX и XI веками учёные из Центральной Азии сделали открытия, которые определили развитие мировой науки. Мухаммад ал-Хорезми (около 780–850) работал в Багдаде и написал книгу об «ал-джабр», от которого произошло слово «алгебра». От его имени происходит и слово «алгоритм».',
          'Абу Райхан ал-Бируни (973–1048), родом из Хорезма, изучал астрономию, географию и историю и вычислил размеры Земли. Ибн Сина (Авиценна, 980–1037), родом из-под Бухары, написал «Канон врачебной науки», по которому в Европе учились веками.',
          'Для работы с датами: продолжительность жизни равна году смерти минус год рождения.',
        ]
      ),
      example: bi(
        'Al-Biruni: 1048 − 973 = 75, so he lived about 75 years.',
        'Ал-Бируни: 1048 − 973 = 75, то есть он прожил около 75 лет.'
      ),
      practice: [
        {
          q: bi('In what year was Ibn Sina (Avicenna) born?', 'В каком году родился Ибн Сина (Авиценна)?'),
          answer: ['980'],
          explain: bi('Ibn Sina lived 980–1037.', 'Ибн Сина жил в 980–1037 годах.'),
        },
        {
          q: bi('Al-Biruni was born in 973 and died in 1048. How many years did he live?', 'Ал-Бируни родился в 973 году и умер в 1048. Сколько лет он прожил?'),
          answer: 75,
          explain: bi('1048 − 973 = 75.', '1048 − 973 = 75.'),
        },
        {
          q: bi('The title of al-Khwarizmi\'s book contains the word "al-jabr". Which school subject takes its name from it? (one word)', 'В названии книги ал-Хорезми есть слово «ал-джабр». Какой школьный предмет получил от него название? (одно слово)'),
          answer: ['algebra', 'алгебра'],
          explain: bi('Algebra: the word comes from "al-jabr".', 'Алгебра: слово происходит от «ал-джабр».'),
        },
      ],
      labTopic: bi('Al-Khwarizmi, al-Biruni and Ibn Sina: their discoveries', 'Ал-Хорезми, ал-Бируни и Ибн Сина: их открытия'),
    },
    {
      id: 'temur',
      title: { en: 'Amir Temur and the Timurids', ru: 'Амир Темур и Темуриды', uz: 'Amir Temur va temuriylar' },
      teach: biList(
        [
          'Amir Temur (Tamerlane) was born in 1336 near Kesh (now Shahrisabz). In 1370 he became ruler and made Samarkand his capital. He created a large empire in Central Asia, Iran and beyond.',
          'In 1402 he defeated the Ottoman sultan Bayezid I at the Battle of Ankara. Temur died in 1405 in Otrar, during a march against China.',
          'His grandson Mirzo Ulugbek (1394–1449) ruled Samarkand and was a great astronomer: he built an observatory and compiled a catalogue of stars. The Timurid period is also famous for architecture and for poetry.',
        ],
        [
          'Амир Темур (Тамерлан) родился в 1336 году близ Кеша (ныне Шахрисабз). В 1370 году он стал правителем и сделал Самарканд своей столицей. Он создал большую империю в Центральной Азии, Иране и за их пределами.',
          'В 1402 году он разбил османского султана Баязида I в битве при Анкаре. Темур умер в 1405 году в Отраре, во время похода против Китая.',
          'Его внук Мирзо Улугбек (1394–1449) правил Самаркандом и был великим астрономом: построил обсерваторию и составил каталог звёзд. Эпоха Темуридов известна также архитектурой и поэзией.',
        ]
      ),
      example: bi(
        'Temur: 1405 − 1336 = 69 years of life. He ruled from 1370 to 1405, that is 35 years.',
        'Темур: 1405 − 1336 = 69 лет жизни. Он правил с 1370 по 1405 год, то есть 35 лет.'
      ),
      practice: [
        {
          q: bi('In what year was the Battle of Ankara, where Temur defeated Sultan Bayezid I?', 'В каком году была битва при Анкаре, где Темур разбил султана Баязида I?'),
          answer: ['1402'],
          explain: bi('The Battle of Ankara was in 1402.', 'Битва при Анкаре была в 1402 году.'),
        },
        {
          q: bi('Temur became ruler in 1370 and died in 1405. For how many years did he rule?', 'Темур стал правителем в 1370 году и умер в 1405. Сколько лет он правил?'),
          answer: 35,
          explain: bi('1405 − 1370 = 35.', '1405 − 1370 = 35.'),
        },
        {
          q: bi('Mirzo Ulugbek was born in 1394 and died in 1449. How many years did he live?', 'Мирзо Улугбек родился в 1394 году и умер в 1449. Сколько лет он прожил?'),
          answer: 55,
          explain: bi('1449 − 1394 = 55.', '1449 − 1394 = 55.'),
        },
      ],
      labTopic: bi('Amir Temur and the Timurid state', 'Амир Темур и государство Темуридов'),
    },
    {
      id: 'navoi-babur',
      title: { en: 'Navoi and Babur', ru: 'Навои и Бабур', uz: 'Navoiy va Bobur' },
      teach: biList(
        [
          'Alisher Navoi (1441–1501) lived in Herat, was a poet, statesman and patron of science. He wrote in the Chagatai (old Uzbek) language and showed that it could match Persian in literature. His best-known work is the "Khamsa" (the word means "five"), five long poems.',
          'Zahiriddin Muhammad Babur was born in 1483 in Andijan, a descendant of Temur. He was a ruler, a poet and a historian: his memoirs are called the "Baburnama".',
          'After losing Fergana and Samarkand he went south, took Kabul, and in 1526, after the Battle of Panipat, founded the Mughal Empire in India.',
        ],
        [
          'Алишер Навои (1441–1501) жил в Герате, был поэтом, государственным деятелем и покровителем науки. Он писал на чагатайском (староузбекском) языке и показал, что он не уступает персидскому в литературе. Самое известное его произведение — «Хамса» (слово означает «пять»), пять больших поэм.',
          'Захириддин Мухаммад Бабур родился в 1483 году в Андижане, потомок Темура. Он был правителем, поэтом и историком: его мемуары называются «Бабур-наме».',
          'Потеряв Фергану и Самарканд, он ушёл на юг, взял Кабул, а в 1526 году, после битвы при Панипате, основал в Индии империю Великих Моголов.',
        ]
      ),
      example: bi(
        'Babur was born in 1483 and founded the Mughal Empire in 1526: 1526 − 1483 = 43, so he was 43.',
        'Бабур родился в 1483 году и основал империю Великих Моголов в 1526: 1526 − 1483 = 43, ему было 43 года.'
      ),
      practice: [
        {
          q: bi('Navoi was born in 1441 and died in 1501. How many years did he live?', 'Навои родился в 1441 году и умер в 1501. Сколько лет он прожил?'),
          answer: 60,
          explain: bi('1501 − 1441 = 60.', '1501 − 1441 = 60.'),
        },
        {
          q: bi('The name of Navoi\'s "Khamsa" means "five". How many long poems does it contain?', 'Название «Хамса» Навои означает «пять». Сколько больших поэм в нём?'),
          answer: 5,
          explain: bi('"Khamsa" means "five": it has five poems.', '«Хамса» значит «пять»: в ней пять поэм.'),
        },
        {
          q: bi('In what year did Babur found the Mughal Empire in India after the Battle of Panipat?', 'В каком году Бабур основал империю Великих Моголов в Индии после битвы при Панипате?'),
          answer: ['1526'],
          explain: bi('The Mughal Empire was founded in 1526.', 'Империя Великих Моголов основана в 1526 году.'),
        },
      ],
      labTopic: bi('Alisher Navoi and Babur: life and works', 'Алишер Навои и Бабур: жизнь и творчество'),
    },
    {
      id: 'independence',
      title: { en: 'The road to independence', ru: 'Путь к независимости', uz: "Mustaqillikka yo'l" },
      teach: biList(
        [
          'In the 19th century the Central Asian khanates (Bukhara, Khiva, Kokand) lost independence to the Russian Empire; Tashkent was taken in 1865. In 1924 the Uzbek SSR was created as part of the Soviet Union.',
          'Independence was declared on 31 August 1991 and is celebrated on 1 September. In December 1991 Islam Karimov was elected the first president.',
          'The Constitution was adopted on 8 December 1992 (Constitution Day). The national currency, the soʻm, was introduced in 1994.',
        ],
        [
          'В XIX веке среднеазиатские ханства (Бухарское, Хивинское, Кокандское) потеряли независимость в пользу Российской империи; Ташкент был взят в 1865 году. В 1924 году была создана Узбекская ССР в составе Советского Союза.',
          'Независимость провозглашена 31 августа 1991 года, отмечается 1 сентября. В декабре 1991 года первым президентом был избран Ислам Каримов.',
          'Конституция принята 8 декабря 1992 года (День Конституции). Национальная валюта, сум, введена в 1994 году.',
        ]
      ),
      example: bi(
        'From the creation of the Uzbek SSR (1924) to independence (1991): 1991 − 1924 = 67 years.',
        'От создания Узбекской ССР (1924) до независимости (1991): 1991 − 1924 = 67 лет.'
      ),
      practice: [
        {
          q: bi('In what year did Uzbekistan declare independence?', 'В каком году Узбекистан провозгласил независимость?'),
          answer: ['1991'],
          explain: bi('Independence was declared on 31 August 1991.', 'Независимость провозглашена 31 августа 1991 года.'),
        },
        {
          q: bi('The Uzbek SSR was created in 1924 and independence came in 1991. How many years apart is that?', 'Узбекская ССР создана в 1924 году, независимость наступила в 1991. Сколько лет между этими датами?'),
          answer: 67,
          explain: bi('1991 − 1924 = 67.', '1991 − 1924 = 67.'),
        },
        {
          q: bi('In what year was the national currency, the soʻm, introduced?', 'В каком году была введена национальная валюта, сум?'),
          answer: ['1994'],
          explain: bi('The soʻm was introduced in 1994.', 'Сум введён в 1994 году.'),
        },
      ],
      labTopic: bi('Uzbekistan: from the khanates to independence', 'Узбекистан: от ханств к независимости'),
    },
  ],
};
