import { Program, bi, biList } from './types';

export const algebra: Program = {
  id: 'algebra-7-9',
  kind: 'school',
  icon: 'calculator',
  accent: 'indigo',
  title: { en: 'Algebra: equations and functions', ru: 'Алгебра: уравнения и функции', uz: 'Algebra: tenglamalar va funksiyalar' },
  summary: {
    en: 'The core of school algebra: linear equations, systems, quadratics and straight-line graphs.',
    ru: 'Основа школьной алгебры: линейные уравнения, системы, квадратные уравнения и графики прямых.',
    uz: "Maktab algebrasining asosi: chiziqli tenglamalar, sistemalar, kvadrat tenglamalar va to'g'ri chiziq grafiklari.",
  },
  audience: { en: 'Grades 7–9', ru: '7–9 классы', uz: '7–9-sinflar' },
  lessons: [
    {
      id: 'linear-equations',
      title: { en: 'Linear equations', ru: 'Линейные уравнения', uz: 'Chiziqli tenglamalar' },
      teach: biList(
        [
          'A linear equation has the unknown x only to the first power, for example 4x − 9 = 19. Solving it means finding the value of x that makes both sides equal.',
          'The rule is: do the same to both sides. Move the numbers without x to one side, then divide by the number in front of x.',
          'If there are brackets, open them first: a(b + c) = ab + ac. Then collect the x terms on one side.',
        ],
        [
          'В линейном уравнении неизвестное x стоит только в первой степени, например 4x − 9 = 19. Решить его значит найти такое x, при котором обе части равны.',
          'Правило: делай одно и то же с обеими частями. Перенеси числа без x в одну сторону, затем раздели на число перед x.',
          'Если есть скобки, сначала раскрой их: a(b + c) = ab + ac. Потом собери слагаемые с x в одной части.',
        ]
      ),
      example: bi(
        '4x − 9 = 19. Add 9 to both sides: 4x = 28. Divide by 4: x = 7. Check: 4·7 − 9 = 19. ✓',
        '4x − 9 = 19. Прибавим 9 к обеим частям: 4x = 28. Разделим на 4: x = 7. Проверка: 4·7 − 9 = 19. ✓'
      ),
      practice: [
        { q: bi('Solve 5x + 3 = 38. x = ?', 'Решите 5x + 3 = 38. x = ?'), answer: 7, explain: bi('5x = 35, so x = 7.', '5x = 35, значит x = 7.') },
        { q: bi('Solve 7 − 2x = 1. x = ?', 'Решите 7 − 2x = 1. x = ?'), answer: 3, explain: bi('−2x = −6, so x = 3.', '−2x = −6, значит x = 3.') },
        {
          q: bi('Solve 3(x + 2) = 2x + 11. x = ?', 'Решите 3(x + 2) = 2x + 11. x = ?'),
          answer: 5,
          explain: bi('3x + 6 = 2x + 11, so x = 5.', '3x + 6 = 2x + 11, значит x = 5.'),
        },
      ],
      labTopic: bi('Linear equations: solving for x', 'Линейные уравнения: как найти x'),
    },
    {
      id: 'systems',
      title: { en: 'Systems of equations', ru: 'Системы уравнений', uz: 'Tenglamalar sistemasi' },
      teach: biList(
        [
          'A system has two equations and two unknowns, for example x + y = 10 and x − y = 2. You need values of x and y that satisfy both.',
          'Elimination: add or subtract the equations so one unknown disappears. Substitution: express one unknown from one equation and put it into the other.',
          'Always find the second unknown after the first, and check both numbers in both equations.',
        ],
        [
          'В системе два уравнения и два неизвестных, например x + y = 10 и x − y = 2. Нужны такие x и y, которые подходят в оба уравнения.',
          'Сложение: сложи или вычти уравнения, чтобы одно неизвестное исчезло. Подстановка: выразить одно неизвестное из одного уравнения и подставить в другое.',
          'Второе неизвестное находят после первого, а проверку делают в обоих уравнениях.',
        ]
      ),
      example: bi(
        'x + y = 10 and x − y = 2. Add them: 2x = 12, so x = 6. Then y = 10 − 6 = 4. Check: 6 − 4 = 2. ✓',
        'x + y = 10 и x − y = 2. Сложим: 2x = 12, значит x = 6. Тогда y = 10 − 6 = 4. Проверка: 6 − 4 = 2. ✓'
      ),
      practice: [
        {
          q: bi('x + y = 12 and x − y = 4. x = ?', 'x + y = 12 и x − y = 4. x = ?'),
          answer: 8,
          explain: bi('Add: 2x = 16, so x = 8 (and y = 4).', 'Сложим: 2x = 16, значит x = 8 (и y = 4).'),
        },
        {
          q: bi('2x + y = 11 and x = 3. y = ?', '2x + y = 11 и x = 3. y = ?'),
          answer: 5,
          explain: bi('2·3 + y = 11, so y = 5.', '2·3 + y = 11, значит y = 5.'),
        },
        {
          q: bi('x + 2y = 14 and x − 2y = −2. y = ?', 'x + 2y = 14 и x − 2y = −2. y = ?'),
          answer: 4,
          explain: bi('Add: 2x = 12, x = 6. Then 6 + 2y = 14, so y = 4.', 'Сложим: 2x = 12, x = 6. Тогда 6 + 2y = 14, значит y = 4.'),
        },
      ],
      labTopic: bi('Systems of linear equations: substitution and elimination', 'Системы линейных уравнений: подстановка и сложение'),
    },
    {
      id: 'quadratics',
      title: { en: 'Quadratic equations', ru: 'Квадратные уравнения', uz: 'Kvadrat tenglamalar' },
      teach: biList(
        [
          'A quadratic equation looks like ax² + bx + c = 0 with a ≠ 0. The discriminant D = b² − 4ac tells you how many real roots it has.',
          'If D > 0 there are two roots, if D = 0 there is one, and if D < 0 there are no real roots.',
          'The roots are x = (−b ± √D) / (2a). For simple cases you can also factor the expression.',
        ],
        [
          'Квадратное уравнение имеет вид ax² + bx + c = 0, где a ≠ 0. Дискриминант D = b² − 4ac показывает, сколько у него действительных корней.',
          'Если D > 0, корней два, если D = 0, корень один, если D < 0, действительных корней нет.',
          'Корни находят по формуле x = (−b ± √D) / (2a). В простых случаях можно разложить выражение на множители.',
        ]
      ),
      example: bi(
        'x² − 5x + 6 = 0. D = 25 − 24 = 1. x = (5 ± 1) / 2, so x = 3 or x = 2.',
        'x² − 5x + 6 = 0. D = 25 − 24 = 1. x = (5 ± 1) / 2, значит x = 3 или x = 2.'
      ),
      practice: [
        {
          q: bi('Find the discriminant of x² − 6x + 5 = 0.', 'Найдите дискриминант уравнения x² − 6x + 5 = 0.'),
          answer: 16,
          explain: bi('D = 36 − 4·1·5 = 16.', 'D = 36 − 4·1·5 = 16.'),
        },
        {
          q: bi('What is the larger root of x² − 6x + 5 = 0?', 'Чему равен больший корень уравнения x² − 6x + 5 = 0?'),
          answer: 5,
          explain: bi('x = (6 ± 4) / 2, so x = 5 or x = 1. The larger is 5.', 'x = (6 ± 4) / 2, значит x = 5 или x = 1. Больший корень 5.'),
        },
        {
          q: bi('How many real roots does x² + 2x + 5 = 0 have?', 'Сколько действительных корней у уравнения x² + 2x + 5 = 0?'),
          answer: 0,
          explain: bi('D = 4 − 20 = −16 < 0, so there are none.', 'D = 4 − 20 = −16 < 0, значит корней нет.'),
        },
      ],
      labTopic: bi('Quadratic equations and the discriminant', 'Квадратные уравнения и дискриминант'),
    },
    {
      id: 'linear-functions',
      title: { en: 'Linear functions and graphs', ru: 'Линейная функция и график', uz: "Chiziqli funksiya va grafik" },
      teach: biList(
        [
          'A linear function is y = kx + b. Its graph is a straight line. The number k is the slope and b is where the line crosses the y-axis.',
          'The slope between two points (x₁, y₁) and (x₂, y₂) is k = (y₂ − y₁) / (x₂ − x₁). A positive k goes up, a negative k goes down.',
          'To find where the line crosses the x-axis, put y = 0 and solve for x.',
        ],
        [
          'Линейная функция имеет вид y = kx + b. Её график — прямая. Число k — угловой коэффициент, а b — точка пересечения с осью y.',
          'Угловой коэффициент по двум точкам (x₁, y₁) и (x₂, y₂): k = (y₂ − y₁) / (x₂ − x₁). При k > 0 прямая идёт вверх, при k < 0 вниз.',
          'Чтобы найти пересечение с осью x, подставь y = 0 и реши уравнение.',
        ]
      ),
      example: bi(
        'A line passes through (0, 2) and (2, 6). k = (6 − 2) / (2 − 0) = 2, and b = 2, so y = 2x + 2.',
        'Прямая проходит через (0, 2) и (2, 6). k = (6 − 2) / (2 − 0) = 2, а b = 2, значит y = 2x + 2.'
      ),
      practice: [
        {
          q: bi('Find the slope of the line through (1, 3) and (3, 11).', 'Найдите угловой коэффициент прямой через (1, 3) и (3, 11).'),
          answer: 4,
          explain: bi('k = (11 − 3) / (3 − 1) = 4.', 'k = (11 − 3) / (3 − 1) = 4.'),
        },
        {
          q: bi('For y = −x + 5, find y when x = 2.', 'Для y = −x + 5 найдите y при x = 2.'),
          answer: 3,
          explain: bi('y = −2 + 5 = 3.', 'y = −2 + 5 = 3.'),
        },
        {
          q: bi('Where does y = 3x − 6 cross the x-axis? Give x.', 'В какой точке y = 3x − 6 пересекает ось x? Дайте x.'),
          answer: 2,
          explain: bi('0 = 3x − 6, so x = 2.', '0 = 3x − 6, значит x = 2.'),
        },
      ],
      labTopic: bi('Linear functions: slope and graphs', 'Линейная функция: наклон и график'),
    },
  ],
};
