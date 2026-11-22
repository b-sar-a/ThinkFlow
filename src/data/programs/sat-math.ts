import { Program, bi, biList } from './types';

export const satMath: Program = {
  id: 'sat-math',
  kind: 'exam',
  icon: 'target',
  accent: 'amber',
  title: { en: 'SAT Math: essentials', ru: 'SAT Math: основа', uz: 'SAT Math: asoslar' },
  summary: {
    en: 'The topics that come up again and again on the SAT Math section: equations, percents, quadratics and geometry.',
    ru: 'Темы, которые чаще всего встречаются в разделе SAT Math: уравнения, проценты, квадратные выражения и геометрия.',
    uz: "SAT Math bo'limida eng ko'p uchraydigan mavzular: tenglamalar, foizlar, kvadrat ifodalar va geometriya.",
  },
  audience: { en: 'Grades 9–11, SAT prep', ru: '9–11 классы, подготовка к SAT', uz: '9–11-sinflar, SAT tayyorgarligi' },
  lessons: [
    {
      id: 'linear-word-problems',
      title: { en: 'Linear equations and word problems', ru: 'Линейные уравнения и текстовые задачи', uz: 'Chiziqli tenglamalar va matnli masalalar' },
      teach: biList(
        [
          'Many SAT questions are a linear equation in disguise. Fixed fee plus a rate: total = fixed + rate × quantity.',
          'Read the sentence, name the unknown, and write one equation. Then solve it and check that the answer makes sense in the story.',
          'When there are brackets or x on both sides, open the brackets first and collect x terms on one side.',
        ],
        [
          'Многие задачи SAT — это замаскированное линейное уравнение. Фиксированный платёж плюс ставка: итог = фикс + ставка × количество.',
          'Прочитай условие, назови неизвестное и запиши одно уравнение. Реши его и проверь, что ответ подходит по смыслу.',
          'Если есть скобки или x с обеих сторон, сначала раскрой скобки и собери слагаемые с x в одной части.',
        ]
      ),
      example: bi(
        'A gym charges $20 to join plus $15 a month. After m months the cost is 20 + 15m. If it is $125: 15m = 105, so m = 7.',
        'Спортзал берёт $20 за вступление и $15 в месяц. Через m месяцев стоимость 20 + 15m. Если она $125: 15m = 105, значит m = 7.'
      ),
      practice: [
        {
          q: bi('A plumber charges $40 plus $25 per hour. The bill is $165. How many hours?', 'Сантехник берёт $40 плюс $25 за час. Счёт $165. Сколько часов?'),
          answer: 5,
          explain: bi('40 + 25h = 165, so 25h = 125 and h = 5.', '40 + 25h = 165, значит 25h = 125 и h = 5.'),
        },
        {
          q: bi('Solve 3(2x − 4) = 2x + 8. x = ?', 'Решите 3(2x − 4) = 2x + 8. x = ?'),
          answer: 5,
          explain: bi('6x − 12 = 2x + 8, so 4x = 20 and x = 5.', '6x − 12 = 2x + 8, значит 4x = 20 и x = 5.'),
        },
        {
          q: bi('If 4x + 2y = 20 and y = 2, what is x?', 'Если 4x + 2y = 20 и y = 2, чему равен x?'),
          answer: 4,
          explain: bi('4x + 4 = 20, so 4x = 16 and x = 4.', '4x + 4 = 20, значит 4x = 16 и x = 4.'),
        },
      ],
      labTopic: bi('SAT Math: linear equations and word problems', 'SAT Math: линейные уравнения и текстовые задачи'),
    },
    {
      id: 'percent-ratio',
      title: { en: 'Percents and ratios', ru: 'Проценты и отношения', uz: 'Foizlar va nisbatlar' },
      teach: biList(
        [
          'Percent means "out of 100". To find p% of a number, multiply by p/100. To increase by p%, multiply by 1 + p/100; to decrease, multiply by 1 − p/100.',
          'To find what percent A is of B, compute A / B × 100.',
          'A ratio a : b splits a total into a + b equal parts. Each part is the total divided by (a + b).',
        ],
        [
          'Процент значит «из ста». Чтобы найти p% от числа, умножь его на p/100. Чтобы увеличить на p%, умножь на 1 + p/100, чтобы уменьшить, на 1 − p/100.',
          'Чтобы узнать, сколько процентов A составляет от B, посчитай A / B × 100.',
          'Отношение a : b делит целое на a + b равных частей. Одна часть равна целому, делённому на (a + b).',
        ]
      ),
      example: bi(
        'A 20% increase on 50: 50 × 1.2 = 60. Ratio 2 : 3 of 40: one part is 40 / 5 = 8, so the shares are 16 and 24.',
        'Увеличение 50 на 20%: 50 × 1,2 = 60. Отношение 2 : 3 от 40: одна часть 40 / 5 = 8, значит доли 16 и 24.'
      ),
      practice: [
        {
          q: bi('A $80 jacket is discounted by 25%. What is the new price in dollars?', 'Куртка за $80 подешевела на 25%. Какая новая цена в долларах?'),
          answer: 60,
          explain: bi('80 × 0.75 = 60.', '80 × 0,75 = 60.'),
        },
        {
          q: bi('45 is what percent of 60?', 'Сколько процентов составляет 45 от 60?'),
          answer: 75,
          explain: bi('45 / 60 = 0.75, which is 75%.', '45 / 60 = 0,75, то есть 75%.'),
        },
        {
          q: bi('Boys to girls is 3 : 5 and there are 24 students. How many boys?', 'Мальчиков и девочек 3 : 5, всего 24 ученика. Сколько мальчиков?'),
          answer: 9,
          explain: bi('One part is 24 / 8 = 3, so boys = 3 × 3 = 9.', 'Одна часть 24 / 8 = 3, значит мальчиков 3 × 3 = 9.'),
        },
      ],
      labTopic: bi('SAT Math: percents and ratios', 'SAT Math: проценты и отношения'),
    },
    {
      id: 'quadratics-factoring',
      title: { en: 'Quadratics and factoring', ru: 'Квадратные выражения и разложение', uz: "Kvadrat ifodalar va ko'paytuvchilarga ajratish" },
      teach: biList(
        [
          'To expand, multiply every term by every term: (x + 3)(x − 4) = x² − 4x + 3x − 12 = x² − x − 12.',
          'To factor x² + bx + c, look for two numbers that multiply to c and add to b.',
          'A product equals zero only when one of the factors is zero. That is how you read the solutions off a factored equation. Remember the identity (x + a)² = x² + 2ax + a².',
        ],
        [
          'Чтобы раскрыть скобки, умножь каждый член на каждый: (x + 3)(x − 4) = x² − 4x + 3x − 12 = x² − x − 12.',
          'Чтобы разложить x² + bx + c, найди два числа, произведение которых равно c, а сумма равна b.',
          'Произведение равно нулю только когда один из множителей равен нулю. Так решения читают по разложенному уравнению. Запомни формулу (x + a)² = x² + 2ax + a².',
        ]
      ),
      example: bi(
        'x² − x − 12 = 0. Numbers that multiply to −12 and add to −1: −4 and 3. So (x − 4)(x + 3) = 0 and x = 4 or x = −3.',
        'x² − x − 12 = 0. Числа с произведением −12 и суммой −1: −4 и 3. Значит (x − 4)(x + 3) = 0 и x = 4 или x = −3.'
      ),
      practice: [
        {
          q: bi('What is the positive solution of x² − 9 = 0?', 'Чему равно положительное решение x² − 9 = 0?'),
          answer: 3,
          explain: bi('x² = 9, so x = 3 or −3. The positive one is 3.', 'x² = 9, значит x = 3 или −3. Положительное: 3.'),
        },
        {
          q: bi('What is the positive solution of x² − x − 6 = 0?', 'Чему равно положительное решение x² − x − 6 = 0?'),
          answer: 3,
          explain: bi('(x − 3)(x + 2) = 0, so x = 3 or −2. The positive one is 3.', '(x − 3)(x + 2) = 0, значит x = 3 или −2. Положительное: 3.'),
        },
        {
          q: bi('If x² + bx + 4 equals (x + 2)² for all x, what is b?', 'Если x² + bx + 4 равно (x + 2)² при всех x, чему равно b?'),
          answer: 4,
          explain: bi('(x + 2)² = x² + 4x + 4, so b = 4.', '(x + 2)² = x² + 4x + 4, значит b = 4.'),
        },
      ],
      labTopic: bi('SAT Math: factoring quadratics', 'SAT Math: разложение квадратных выражений'),
    },
    {
      id: 'geometry-basics',
      title: { en: 'Triangles and circles', ru: 'Треугольники и окружности', uz: 'Uchburchaklar va aylanalar' },
      teach: biList(
        [
          'In a right triangle with legs a and b and hypotenuse c: a² + b² = c². Common triples to recognise: 3-4-5, 5-12-13, 8-15-17.',
          'Circle with radius r: area = πr², circumference = 2πr. SAT answers are often left in terms of π.',
          'Draw the picture, mark what is given, and decide which formula connects the known numbers to the unknown one.',
        ],
        [
          'В прямоугольном треугольнике с катетами a и b и гипотенузой c: a² + b² = c². Полезные тройки: 3-4-5, 5-12-13, 8-15-17.',
          'Окружность радиуса r: площадь круга = πr², длина окружности = 2πr. В ответах SAT число π часто оставляют буквой.',
          'Нарисуй чертёж, отметь известные величины и выбери формулу, которая связывает известное с неизвестным.',
        ]
      ),
      example: bi(
        'Legs 6 and 8: c² = 36 + 64 = 100, so c = 10. A circle with r = 3 has area 9π.',
        'Катеты 6 и 8: c² = 36 + 64 = 100, значит c = 10. У круга с r = 3 площадь 9π.'
      ),
      practice: [
        {
          q: bi('Legs of a right triangle are 5 and 12. What is the hypotenuse?', 'Катеты прямоугольного треугольника 5 и 12. Чему равна гипотенуза?'),
          answer: 13,
          explain: bi('25 + 144 = 169, so c = 13.', '25 + 144 = 169, значит c = 13.'),
        },
        {
          q: bi('A circle has radius 4. Its area is kπ. What is k?', 'Радиус круга 4. Его площадь равна kπ. Чему равно k?'),
          answer: 16,
          explain: bi('Area = π·4² = 16π.', 'Площадь = π·4² = 16π.'),
        },
        {
          q: bi('A right triangle has hypotenuse 13 and one leg 5. What is the other leg?', 'У прямоугольного треугольника гипотенуза 13 и один катет 5. Чему равен другой катет?'),
          answer: 12,
          explain: bi('b² = 169 − 25 = 144, so b = 12.', 'b² = 169 − 25 = 144, значит b = 12.'),
        },
      ],
      labTopic: bi('SAT Math: right triangles and circles', 'SAT Math: прямоугольные треугольники и окружности'),
    },
  ],
};
