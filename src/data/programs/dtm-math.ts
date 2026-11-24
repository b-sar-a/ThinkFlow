import { Program, bi, biList } from './types';

/**
 * Multiple-choice practice in the style of the DTM and other entrance tests: four options, one right.
 * The options are numbers, so they are the same in every language. The tasks are NOT taken from the
 * official DTM programme; a teacher should map the topics to it.
 */
export const dtmMath: Program = {
  id: 'dtm-math',
  kind: 'exam',
  icon: 'target',
  accent: 'rose',
  title: { en: 'Maths test practice (DTM style)', ru: 'Математика: тесты (формат ДТМ)', uz: 'Matematika: testlar (DTM uslubida)' },
  summary: {
    en: 'Short topic reviews and four-option tests: percents, equations, progressions and geometry formulas.',
    ru: 'Короткие повторения тем и тесты с четырьмя вариантами ответа: проценты, уравнения, прогрессии и формулы геометрии.',
    uz: "Mavzularning qisqa takrori va to'rt variantli testlar: foizlar, tenglamalar, progressiyalar va geometriya formulalari.",
  },
  audience: { en: 'Grades 9–11, test prep', ru: '9–11 классы, подготовка к тестам', uz: '9–11-sinflar, test tayyorgarligi' },
  lessons: [
    {
      id: 'percent',
      title: { en: 'Percents and proportions', ru: 'Проценты и пропорции', uz: 'Foizlar va proporsiyalar' },
      teach: biList(
        [
          'p% of a number N is N · p / 100. To raise N by p%, multiply it by (1 + p/100); to lower it by p%, multiply by (1 − p/100).',
          'The change in percent is (new − old) / old × 100%. Always divide by the old value.',
          'A proportion a / b = c / d means a · d = b · c. Use it when one quantity grows in the same ratio as another, for example price and number of items.',
        ],
        [
          'p% от числа N — это N · p / 100. Чтобы увеличить N на p%, умножьте на (1 + p/100); чтобы уменьшить на p%, умножьте на (1 − p/100).',
          'Изменение в процентах: (новое − старое) / старое × 100%. Всегда делите на старое значение.',
          'Пропорция a / b = c / d означает a · d = b · c. Её применяют, когда одна величина растёт в том же отношении, что и другая, например цена и число предметов.',
        ]
      ),
      example: bi(
        'A price of 80 000 is cut by 25%: 80 000 × 0.75 = 60 000.',
        'Цену 80 000 снизили на 25%: 80 000 × 0,75 = 60 000.'
      ),
      practice: [
        {
          q: bi('What is 15% of 240?', 'Сколько составляют 15% от 240?'),
          choices: ['36', '24', '30', '42'],
          answer: ['36'],
          explain: bi('240 × 15 / 100 = 36.', '240 × 15 / 100 = 36.'),
        },
        {
          q: bi('A price rose from 50 to 65. By what percent did it rise?', 'Цена выросла с 50 до 65. На сколько процентов она выросла?'),
          choices: ['13%', '15%', '30%', '65%'],
          answer: ['30%'],
          explain: bi('(65 − 50) / 50 × 100% = 30%. Divide by the old price, 50.', '(65 − 50) / 50 × 100% = 30%. Делим на старую цену, 50.'),
        },
        {
          q: bi('8 notebooks cost 36 000. How much do 5 of the same notebooks cost?', '8 тетрадей стоят 36 000. Сколько стоят 5 таких же тетрадей?'),
          choices: ['20 000', '22 500', '24 000', '28 800'],
          answer: ['22 500'],
          explain: bi('One notebook costs 36 000 / 8 = 4 500, so 5 cost 22 500.', 'Одна тетрадь стоит 36 000 / 8 = 4 500, значит 5 стоят 22 500.'),
        },
      ],
      labTopic: bi('Percent problems: increase, decrease and discounts', 'Задачи на проценты: рост, снижение и скидки'),
    },
    {
      id: 'equations',
      title: { en: 'Equations and inequalities', ru: 'Уравнения и неравенства', uz: 'Tenglamalar va tengsizliklar' },
      teach: biList(
        [
          'For a x² + b x + c = 0 the discriminant is D = b² − 4ac. If D > 0 there are two roots, if D = 0 one, if D < 0 none.',
          'Vieta: the roots add up to −b / a and multiply to c / a. This gives the sum and product without solving.',
          'A linear inequality is solved like an equation, but when you multiply or divide by a negative number the sign turns around.',
        ],
        [
          'Для a x² + b x + c = 0 дискриминант D = b² − 4ac. Если D > 0, два корня, если D = 0, один, если D < 0, корней нет.',
          'Теорема Виета: сумма корней равна −b / a, произведение равно c / a. Так можно найти сумму и произведение, не решая уравнение.',
          'Линейное неравенство решают как уравнение, но при умножении или делении на отрицательное число знак меняется на противоположный.',
        ]
      ),
      example: bi(
        'x² − 5x + 6 = 0: D = 25 − 24 = 1, roots (5 ± 1) / 2, that is 2 and 3. Check: 2 + 3 = 5 and 2 · 3 = 6.',
        'x² − 5x + 6 = 0: D = 25 − 24 = 1, корни (5 ± 1) / 2, то есть 2 и 3. Проверка: 2 + 3 = 5 и 2 · 3 = 6.'
      ),
      practice: [
        {
          q: bi('What is the sum of the roots of x² − 7x + 10 = 0?', 'Чему равна сумма корней уравнения x² − 7x + 10 = 0?'),
          choices: ['−7', '7', '10', '3'],
          answer: ['7'],
          explain: bi('By Vieta the sum is −b / a = 7. (The roots are 2 and 5.)', 'По теореме Виета сумма равна −b / a = 7. (Корни 2 и 5.)'),
        },
        {
          q: bi('What is the smallest integer x that satisfies 3x − 4 > 11?', 'Каково наименьшее целое x, удовлетворяющее неравенству 3x − 4 > 11?'),
          choices: ['4', '5', '6', '7'],
          answer: ['6'],
          explain: bi('3x > 15, so x > 5. The smallest integer greater than 5 is 6.', '3x > 15, значит x > 5. Наименьшее целое число больше 5 — это 6.'),
        },
        {
          q: bi('What is the discriminant of 2x² + 3x − 5 = 0?', 'Чему равен дискриминант уравнения 2x² + 3x − 5 = 0?'),
          choices: ['−31', '29', '7', '49'],
          answer: ['49'],
          explain: bi('D = 3² − 4 · 2 · (−5) = 9 + 40 = 49.', 'D = 3² − 4 · 2 · (−5) = 9 + 40 = 49.'),
        },
      ],
      labTopic: bi('Quadratic equations, the discriminant and Vieta', 'Квадратные уравнения, дискриминант и теорема Виета'),
    },
    {
      id: 'progressions',
      title: { en: 'Progressions', ru: 'Прогрессии', uz: 'Progressiyalar' },
      teach: biList(
        [
          'Arithmetic progression: each term adds the same d. The n-th term is a₁ + (n − 1)d, and the sum of the first n terms is n (a₁ + aₙ) / 2.',
          'Geometric progression: each term is multiplied by the same q. The n-th term is b₁ · q^(n−1).',
          'To tell them apart, look at the gaps: the same difference means arithmetic, the same ratio means geometric.',
        ],
        [
          'Арифметическая прогрессия: каждый член получается добавлением одного и того же d. n-й член равен a₁ + (n − 1)d, а сумма первых n членов равна n (a₁ + aₙ) / 2.',
          'Геометрическая прогрессия: каждый член умножается на одно и то же q. n-й член равен b₁ · q^(n−1).',
          'Чтобы их различить, посмотрите на промежутки: одинаковая разность — арифметическая, одинаковое отношение — геометрическая.',
        ]
      ),
      example: bi(
        '3, 7, 11, … has d = 4, so the 10th term is 3 + 9 · 4 = 39.',
        '3, 7, 11, … имеет d = 4, значит 10-й член равен 3 + 9 · 4 = 39.'
      ),
      practice: [
        {
          q: bi('An arithmetic progression has a₁ = 5 and d = 3. What is the 8th term?', 'У арифметической прогрессии a₁ = 5 и d = 3. Чему равен 8-й член?'),
          choices: ['26', '23', '29', '31'],
          answer: ['26'],
          explain: bi('a₈ = 5 + 7 · 3 = 26.', 'a₈ = 5 + 7 · 3 = 26.'),
        },
        {
          q: bi('What is 1 + 2 + 3 + … + 20?', 'Чему равна сумма 1 + 2 + 3 + … + 20?'),
          choices: ['200', '210', '220', '420'],
          answer: ['210'],
          explain: bi('S = 20 · (1 + 20) / 2 = 210.', 'S = 20 · (1 + 20) / 2 = 210.'),
        },
        {
          q: bi('A geometric progression has b₁ = 2 and q = 3. What is the 5th term?', 'У геометрической прогрессии b₁ = 2 и q = 3. Чему равен 5-й член?'),
          choices: ['48', '54', '162', '486'],
          answer: ['162'],
          explain: bi('b₅ = 2 · 3⁴ = 2 · 81 = 162.', 'b₅ = 2 · 3⁴ = 2 · 81 = 162.'),
        },
      ],
      labTopic: bi('Arithmetic and geometric progressions', 'Арифметическая и геометрическая прогрессии'),
    },
    {
      id: 'geometry',
      title: { en: 'Geometry formulas', ru: 'Формулы геометрии', uz: 'Geometriya formulalari' },
      teach: biList(
        [
          'Right triangle: the Pythagorean theorem says c² = a² + b², where c is the hypotenuse. Triangle area is half the base times the height.',
          'Circle: the circumference is 2πr and the area is πr². Rectangle: area a · b.',
          'Solids: the volume of a cuboid is a · b · c, and of a cylinder π r² h.',
        ],
        [
          'Прямоугольный треугольник: по теореме Пифагора c² = a² + b², где c — гипотенуза. Площадь треугольника равна половине основания на высоту.',
          'Круг: длина окружности 2πr, площадь πr². Прямоугольник: площадь a · b.',
          'Тела: объём прямоугольного параллелепипеда a · b · c, объём цилиндра π r² h.',
        ]
      ),
      example: bi(
        'A right triangle with legs 6 and 8 has hypotenuse √(36 + 64) = 10.',
        'У прямоугольного треугольника с катетами 6 и 8 гипотенуза √(36 + 64) = 10.'
      ),
      practice: [
        {
          q: bi('A right triangle has legs 5 and 12. What is the hypotenuse?', 'У прямоугольного треугольника катеты 5 и 12. Чему равна гипотенуза?'),
          choices: ['11', '13', '15', '17'],
          answer: ['13'],
          explain: bi('√(25 + 144) = √169 = 13.', '√(25 + 144) = √169 = 13.'),
        },
        {
          q: bi('A triangle has base 10 and height 7. What is its area?', 'У треугольника основание 10 и высота 7. Чему равна его площадь?'),
          choices: ['17', '70', '40', '35'],
          answer: ['35'],
          explain: bi('Area = 10 · 7 / 2 = 35.', 'Площадь = 10 · 7 / 2 = 35.'),
        },
        {
          q: bi('What is the volume of a cuboid with sides 2, 3 and 4?', 'Чему равен объём прямоугольного параллелепипеда со сторонами 2, 3 и 4?'),
          choices: ['9', '12', '24', '48'],
          answer: ['24'],
          explain: bi('V = 2 · 3 · 4 = 24.', 'V = 2 · 3 · 4 = 24.'),
        },
      ],
      labTopic: bi('Geometry formulas for tests: triangles, circles, solids', 'Формулы геометрии для тестов: треугольники, окружности, тела'),
    },
  ],
};
