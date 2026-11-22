import { Program, bi, biList } from './types';

export const informaticsBasics: Program = {
  id: 'informatics-basics',
  kind: 'school',
  icon: 'cpu',
  accent: 'sky',
  title: { en: 'Computer science: how computers count', ru: 'Информатика: как считают компьютеры', uz: 'Informatika: kompyuterlar qanday hisoblaydi' },
  summary: {
    en: 'Units of information, binary numbers, logic and algorithms: the calculations of a school computer science course.',
    ru: 'Единицы информации, двоичные числа, логика и алгоритмы: расчёты школьного курса информатики.',
    uz: "Axborot birliklari, ikkilik sonlar, mantiq va algoritmlar: maktab informatika kursining hisoblari.",
  },
  audience: { en: 'Grades 7–11', ru: '7–11 классы', uz: '7–11-sinflar' },
  lessons: [
    {
      id: 'units',
      title: { en: 'Units of information', ru: 'Единицы информации', uz: 'Axborot birliklari' },
      teach: biList(
        [
          'The smallest unit of information is a bit: 0 or 1. A byte is 8 bits. A kilobyte (KB) is 1024 bytes, a megabyte (MB) is 1024 KB.',
          'With k bits we can write 2ᵏ different values: 1 bit gives 2, 2 bits give 4, 3 bits give 8, and so on.',
          'Size of a message = number of characters × bits per character. Divide by 8 to get bytes.',
        ],
        [
          'Наименьшая единица информации — бит: 0 или 1. Байт — это 8 бит. Килобайт (КБ) — 1024 байта, мегабайт (МБ) — 1024 КБ.',
          'С помощью k бит можно записать 2ᵏ разных значений: 1 бит даёт 2, 2 бита дают 4, 3 бита дают 8 и так далее.',
          'Размер сообщения = число символов × бит на символ. Разделите на 8, чтобы получить байты.',
        ]
      ),
      example: bi(
        'A message of 20 characters with 16 bits per character: 20 × 16 = 320 bits = 320 / 8 = 40 bytes.',
        'Сообщение из 20 символов по 16 бит на символ: 20 × 16 = 320 бит = 320 / 8 = 40 байт.'
      ),
      practice: [
        {
          q: bi('How many bits are in 3 bytes?', 'Сколько бит в 3 байтах?'),
          answer: 24,
          explain: bi('3 × 8 = 24.', '3 × 8 = 24.'),
        },
        {
          q: bi('How many different values can 5 bits store?', 'Сколько разных значений можно хранить в 5 битах?'),
          answer: 32,
          explain: bi('2⁵ = 32.', '2⁵ = 32.'),
        },
        {
          q: bi('A message of 40 characters is written with 16 bits per character. What is its size in bytes?', 'Сообщение из 40 символов записано по 16 бит на символ. Каков его размер в байтах?'),
          answer: 80,
          explain: bi('40 × 16 = 640 bits, and 640 / 8 = 80 bytes.', '40 × 16 = 640 бит, а 640 / 8 = 80 байт.'),
        },
      ],
      labTopic: bi('Bits, bytes and information units', 'Биты, байты и единицы информации'),
    },
    {
      id: 'binary',
      title: { en: 'Binary numbers', ru: 'Двоичные числа', uz: 'Ikkilik sonlar' },
      teach: biList(
        [
          'The binary system uses only the digits 0 and 1. The places are powers of two, from the right: 1, 2, 4, 8, 16, 32 …',
          'To convert binary to decimal, add the place values where there is a 1. For example 1011 = 8 + 2 + 1 = 11.',
          'To convert decimal to binary, subtract the largest power of two that fits, write 1 in that place, and repeat. Places that are not used get 0.',
        ],
        [
          'В двоичной системе только цифры 0 и 1. Разряды — степени двойки, справа налево: 1, 2, 4, 8, 16, 32 …',
          'Чтобы перевести двоичное число в десятичное, сложите веса разрядов, где стоит 1. Например, 1011 = 8 + 2 + 1 = 11.',
          'Чтобы перевести десятичное число в двоичное, вычитайте наибольшую подходящую степень двойки, ставьте 1 в её разряд и повторяйте. Неиспользованные разряды получают 0.',
        ]
      ),
      example: bi(
        '110 in binary: 4 + 2 = 6. And 9 = 8 + 1 = 1001 in binary.',
        '110 в двоичной системе: 4 + 2 = 6. А 9 = 8 + 1 = 1001 в двоичной системе.'
      ),
      practice: [
        {
          q: bi('Convert the binary number 1011 to decimal.', 'Переведите двоичное число 1011 в десятичное.'),
          answer: 11,
          explain: bi('8 + 0 + 2 + 1 = 11.', '8 + 0 + 2 + 1 = 11.'),
        },
        {
          q: bi('Convert the decimal number 13 to binary. (write only the digits)', 'Переведите десятичное число 13 в двоичное. (запишите только цифры)'),
          answer: ['1101'],
          explain: bi('13 = 8 + 4 + 1, so the binary number is 1101.', '13 = 8 + 4 + 1, значит двоичное число 1101.'),
        },
        {
          q: bi('Convert the binary number 10000 to decimal.', 'Переведите двоичное число 10000 в десятичное.'),
          answer: 16,
          explain: bi('A single 1 in the 5th place is 2⁴ = 16.', 'Единственная 1 в пятом разряде — это 2⁴ = 16.'),
        },
      ],
      labTopic: bi('Binary numbers and conversion', 'Двоичные числа и перевод'),
    },
    {
      id: 'logic',
      title: { en: 'Logic: AND, OR, NOT', ru: 'Логика: И, ИЛИ, НЕ', uz: 'Mantiq: VA, YOKI, EMAS' },
      teach: biList(
        [
          'A statement is true (1) or false (0). AND is 1 only if both parts are 1. OR is 1 if at least one part is 1. NOT turns 1 into 0 and 0 into 1.',
          'Brackets are calculated first, then NOT, then AND, then OR.',
          'A truth table lists all combinations of the variables. For n variables it has 2ⁿ rows.',
        ],
        [
          'Высказывание истинно (1) или ложно (0). И даёт 1, только если обе части равны 1. ИЛИ даёт 1, если хотя бы одна часть равна 1. НЕ меняет 1 на 0 и 0 на 1.',
          'Сначала вычисляются скобки, потом НЕ, потом И, потом ИЛИ.',
          'Таблица истинности перечисляет все сочетания значений переменных. Для n переменных в ней 2ⁿ строк.',
        ]
      ),
      example: bi(
        'A = 1, B = 1: NOT (A AND B) = NOT 1 = 0.',
        'A = 1, B = 1: НЕ (A И B) = НЕ 1 = 0.'
      ),
      practice: [
        {
          q: bi('A = 1 and B = 0. What is A OR B? (0 or 1)', 'A = 1 и B = 0. Чему равно A ИЛИ B? (0 или 1)'),
          answer: 1,
          explain: bi('OR is 1 when at least one part is 1.', 'ИЛИ равно 1, когда хотя бы одна часть равна 1.'),
        },
        {
          q: bi('A = 1 and B = 0. What is NOT (A OR B)? (0 or 1)', 'A = 1 и B = 0. Чему равно НЕ (A ИЛИ B)? (0 или 1)'),
          answer: 0,
          explain: bi('A OR B = 1, and NOT 1 = 0.', 'A ИЛИ B = 1, а НЕ 1 = 0.'),
        },
        {
          q: bi('How many rows does the truth table of a statement with 3 variables have?', 'Сколько строк в таблице истинности высказывания с 3 переменными?'),
          answer: 8,
          explain: bi('2³ = 8.', '2³ = 8.'),
        },
      ],
      labTopic: bi('Logic operations and truth tables', 'Логические операции и таблицы истинности'),
    },
    {
      id: 'algorithms',
      title: { en: 'Algorithms step by step', ru: 'Алгоритмы по шагам', uz: 'Algoritmlar qadam-baqadam' },
      teach: biList(
        [
          'An algorithm is a precise list of steps. To check one, trace it: write down the values after every step.',
          'A repeat loop runs its steps a fixed number of times. After each pass the variables have new values, so write them in a table.',
          'Binary search finds a number by always guessing the middle and learning "higher" or "lower". Each guess halves the options, so even 100 numbers need at most 7 guesses.',
        ],
        [
          'Алгоритм — это точный список шагов. Чтобы проверить его, выполните трассировку: записывайте значения после каждого шага.',
          'Цикл «повторить» выполняет шаги заданное число раз. После каждого прохода переменные меняются, поэтому записывайте их в таблицу.',
          'Двоичный поиск находит число, всегда называя середину и узнавая «больше» или «меньше». Каждая попытка делит варианты пополам, поэтому даже для 100 чисел нужно не больше 7 попыток.',
        ]
      ),
      example: bi(
        'x = 1. Repeat 3 times: x = x + 2. After the passes x is 3, 5, 7. The final value is 7.',
        'x = 1. Повторить 3 раза: x = x + 2. После проходов x равно 3, 5, 7. Итоговое значение 7.'
      ),
      practice: [
        {
          q: bi('x = 2. Repeat 3 times: x = x × 2. What is x at the end?', 'x = 2. Повторить 3 раза: x = x × 2. Чему равен x в конце?'),
          answer: 16,
          explain: bi('x becomes 4, then 8, then 16.', 'x становится 4, затем 8, затем 16.'),
        },
        {
          q: bi('s = 0. For i from 1 to 10: s = s + i. What is s at the end?', 's = 0. Для i от 1 до 10: s = s + i. Чему равно s в конце?'),
          answer: 55,
          explain: bi('1 + 2 + … + 10 = 55.', '1 + 2 + … + 10 = 55.'),
        },
        {
          q: bi('You guess a number from 1 to 100 by always guessing the middle. What is the largest number of guesses you can need?', 'Вы угадываете число от 1 до 100, всегда называя середину. Какое наибольшее число попыток может понадобиться?'),
          answer: 7,
          explain: bi('Each guess halves the options: 100 → 50 → 25 → 12 → 6 → 3 → 1, which is at most 7 guesses.', 'Каждая попытка делит варианты пополам: 100 → 50 → 25 → 12 → 6 → 3 → 1, то есть не больше 7 попыток.'),
        },
      ],
      labTopic: bi('Algorithms: tracing and searching', 'Алгоритмы: трассировка и поиск'),
    },
  ],
};
