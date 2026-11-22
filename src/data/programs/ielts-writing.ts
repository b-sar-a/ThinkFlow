import { Program, bi, biList } from './types';

export const ieltsWriting: Program = {
  id: 'ielts-writing-2',
  kind: 'exam',
  icon: 'pen',
  accent: 'emerald',
  title: { en: 'IELTS Writing Task 2', ru: 'IELTS Writing Task 2', uz: 'IELTS Writing Task 2' },
  summary: {
    en: 'How to plan, structure and check an essay in 40 minutes. Practice is self-checked against model answers.',
    ru: 'Как за 40 минут спланировать, выстроить и проверить эссе. Практика проверяется по образцам ответов.',
    uz: "40 daqiqada esseni qanday rejalashtirish, tuzish va tekshirish. Mashqlar namunaviy javoblar bilan o'zingiz tekshirasiz.",
  },
  audience: { en: 'Grades 9–11, IELTS prep', ru: '9–11 классы, подготовка к IELTS', uz: '9–11-sinflar, IELTS tayyorgarligi' },
  lessons: [
    {
      id: 'know-the-task',
      title: { en: 'Know the task', ru: 'Что проверяют в задании', uz: 'Topshiriqni bilish' },
      teach: biList(
        [
          'Task 2 is an essay of at least 250 words. You are advised to spend about 40 minutes on it. It counts for more of the Writing score than Task 1.',
          'Examiners mark four criteria: Task Response (do you answer the question fully), Coherence and Cohesion (is it organised and linked), Lexical Resource (vocabulary) and Grammatical Range and Accuracy.',
          'The first step is to read the question carefully and decide its type: agree or disagree, discuss both views, advantages and disadvantages, or a problem and its solutions. Each type needs a different plan.',
        ],
        [
          'Task 2 — это эссе минимум на 250 слов. На него рекомендуется потратить около 40 минут. Оно даёт больше баллов за Writing, чем Task 1.',
          'Экзаменаторы оценивают четыре критерия: Task Response (отвечаете ли вы на вопрос полностью), Coherence and Cohesion (структура и связность), Lexical Resource (словарь) и Grammatical Range and Accuracy (грамматика).',
          'Первым делом внимательно прочитайте вопрос и определите его тип: согласие или несогласие, обсуждение двух мнений, плюсы и минусы, проблема и решения. Для каждого типа нужен свой план.',
        ]
      ),
      example: bi(
        '"Some people think homework should be banned. Discuss both views and give your opinion." This is a "discuss both views and give your opinion" question: you must cover both views AND state your own.',
        '"Some people think homework should be banned. Discuss both views and give your opinion." Это вопрос типа «обсудите оба мнения и выскажите своё»: нужно раскрыть оба мнения И выразить своё.'
      ),
      practice: [
        {
          q: bi('What is the minimum word count for Task 2?', 'Каково минимальное количество слов в Task 2?'),
          answer: 250,
          explain: bi('At least 250 words.', 'Не менее 250 слов.'),
        },
        {
          q: bi('About how many minutes are recommended for Task 2?', 'Сколько минут рекомендуется потратить на Task 2?'),
          answer: 40,
          explain: bi('About 40 minutes.', 'Около 40 минут.'),
        },
        {
          q: bi(
            'Name the question type: "Do the advantages of working from home outweigh the disadvantages?"',
            'Назовите тип вопроса: "Do the advantages of working from home outweigh the disadvantages?"'
          ),
          explain: bi(
            'Advantages and disadvantages, with a judgement: you must weigh both sides and say which is stronger.',
            'Плюсы и минусы с оценкой: нужно взвесить обе стороны и сказать, какая из них сильнее.'
          ),
        },
      ],
      labTopic: bi('IELTS Writing Task 2: assessment criteria and question types', 'IELTS Writing Task 2: критерии оценки и типы вопросов'),
    },
    {
      id: 'plan-and-introduction',
      title: { en: 'Plan and introduction', ru: 'План и введение', uz: 'Reja va kirish' },
      teach: biList(
        [
          'Spend about 5 minutes planning. Write your position in one sentence and two or three main ideas, each with a reason or example.',
          'A strong introduction has two parts: paraphrase the question in your own words, then state your position (thesis). Two sentences are enough.',
          'Do not copy the question word for word. Replace key words with synonyms and change the structure of the sentence.',
        ],
        [
          'Потратьте около 5 минут на план. Запишите свою позицию одним предложением и две-три главные идеи, у каждой причина или пример.',
          'Сильное введение состоит из двух частей: перефразируйте вопрос своими словами, затем сформулируйте позицию (тезис). Достаточно двух предложений.',
          'Не копируйте вопрос слово в слово. Замените ключевые слова синонимами и измените строение предложения.',
        ]
      ),
      example: bi(
        'Question: "Many people believe that children spend too much time on screens." Introduction: "A lot of people think that young people use electronic devices too much. I largely agree, because screens harm sleep and reduce time for real activities."',
        'Вопрос: "Many people believe that children spend too much time on screens." Введение: "A lot of people think that young people use electronic devices too much. I largely agree, because screens harm sleep and reduce time for real activities."'
      ),
      practice: [
        {
          q: bi(
            'Write an introduction (two sentences) for: "Some people think that university education should be free for everyone." Then compare with the model.',
            'Напишите введение (два предложения) к теме: "Some people think that university education should be free for everyone." Затем сравните с образцом.'
          ),
          explain: bi(
            'Model: "It is sometimes argued that governments should pay for all students\' university studies. I partly agree, as free education widens access, but there are important limits to this idea." Check: did you paraphrase, and is your position clear?',
            'Образец: "It is sometimes argued that governments should pay for all students\' university studies. I partly agree, as free education widens access, but there are important limits to this idea." Проверьте: вы перефразировали вопрос и ясна ли ваша позиция?'
          ),
        },
        {
          q: bi(
            'Paraphrase this sentence: "Technology has made our lives easier."',
            'Перефразируйте предложение: "Technology has made our lives easier."'
          ),
          explain: bi(
            'Model: "Modern devices have simplified daily life." Synonyms and a new structure, but the same meaning.',
            'Образец: "Modern devices have simplified daily life." Синонимы и новая структура, смысл тот же.'
          ),
        },
      ],
      labTopic: bi('IELTS Writing: planning and writing an introduction', 'IELTS Writing: план и введение эссе'),
    },
    {
      id: 'body-paragraphs',
      title: { en: 'Body paragraphs', ru: 'Основные абзацы', uz: 'Asosiy xatboshilar' },
      teach: biList(
        [
          'Each body paragraph develops one main idea. A reliable structure is PEEL: Point, Evidence or Example, Explanation, Link.',
          'Start with a clear topic sentence (the point). Support it with a specific example, not a vague statement. Then explain why the example proves your point.',
          'Finish by linking back to the question. Two body paragraphs of about 90 to 100 words each is a common plan for 250 words.',
        ],
        [
          'Каждый основной абзац развивает одну главную идею. Надёжная структура — PEEL: Point (мысль), Evidence или Example (пример), Explanation (объяснение), Link (связка).',
          'Начинайте с чёткого предложения-мысли. Подкрепите его конкретным примером, а не общими словами. Затем объясните, почему пример доказывает мысль.',
          'Закончите связкой с вопросом. Два основных абзаца по 90–100 слов — частый план для эссе на 250 слов.',
        ]
      ),
      example: bi(
        'Point: Screens harm sleep. Example: Many teenagers scroll in bed, so they fall asleep later. Explanation: Less sleep means poorer concentration at school. Link: This is one reason why limiting screen time is justified.',
        'Point: Screens harm sleep. Example: Many teenagers scroll in bed, so they fall asleep later. Explanation: Less sleep means poorer concentration at school. Link: This is one reason why limiting screen time is justified.'
      ),
      practice: [
        {
          q: bi('What does each letter in PEEL stand for?', 'Что означает каждая буква в PEEL?'),
          explain: bi('Point, Evidence (or Example), Explanation, Link.', 'Point (мысль), Evidence или Example (пример), Explanation (объяснение), Link (связка).'),
        },
        {
          q: bi(
            'The point is "Public transport reduces traffic." Write one specific example sentence.',
            'Мысль: "Public transport reduces traffic." Напишите одно предложение с конкретным примером.'
          ),
          explain: bi(
            'Model: "For instance, one metro train can carry as many passengers as several hundred cars." Check: is it specific, and does it support the point?',
            'Образец: "For instance, one metro train can carry as many passengers as several hundred cars." Проверьте: пример конкретный и подкрепляет мысль?'
          ),
        },
      ],
      labTopic: bi('IELTS Writing: PEEL body paragraphs', 'IELTS Writing: основные абзацы по схеме PEEL'),
    },
    {
      id: 'linking-and-checking',
      title: { en: 'Linking words and checking', ru: 'Связки и проверка', uz: 'Bog\'lovchilar va tekshirish' },
      teach: biList(
        [
          'Linking words show the logic: because, as a result, therefore (cause and effect); however, although, on the other hand (contrast); for example, for instance (examples); firstly, in addition, finally (order).',
          'Do not overuse them. One accurate link per idea is better than five in a row.',
          'Keep 3 to 5 minutes at the end to check: subject-verb agreement, articles (a, an, the), plural -s, tenses, spelling and whether you reached 250 words.',
        ],
        [
          'Связки показывают логику: because, as a result, therefore (причина и следствие); however, although, on the other hand (противопоставление); for example, for instance (примеры); firstly, in addition, finally (порядок).',
          'Не злоупотребляйте ими. Одна точная связка на идею лучше пяти подряд.',
          'Оставьте 3–5 минут в конце на проверку: согласование подлежащего и сказуемого, артикли (a, an, the), окончание -s, времена, орфография и объём 250 слов.',
        ]
      ),
      example: bi(
        'Wrong: "Many students is using phones in class." Right: "Many students use phones in class." Wrong: "Because it is useful, but it is also dangerous." Right: "Although it is useful, it is also dangerous."',
        'Ошибка: "Many students is using phones in class." Верно: "Many students use phones in class." Ошибка: "Because it is useful, but it is also dangerous." Верно: "Although it is useful, it is also dangerous."'
      ),
      practice: [
        {
          q: bi('Correct the sentence: "Nowadays, many students is using phones."', 'Исправьте предложение: "Nowadays, many students is using phones."'),
          explain: bi('"Nowadays, many students are using phones." (or "use phones"). The plural subject needs a plural verb.', '"Nowadays, many students are using phones." (или "use phones"). Подлежащее во множественном числе требует глагола во множественном числе.'),
        },
        {
          q: bi('Which linker fits: "Cars are fast. ___, they pollute the air." (However / Therefore)', 'Какая связка подходит: "Cars are fast. ___, they pollute the air." (However / Therefore)'),
          answer: ['however'],
          explain: bi('However: it contrasts the benefit with the drawback.', 'However: связка противопоставляет достоинство и недостаток.'),
        },
      ],
      labTopic: bi('IELTS Writing: linking words and error checking', 'IELTS Writing: связки и проверка ошибок'),
    },
  ],
};
