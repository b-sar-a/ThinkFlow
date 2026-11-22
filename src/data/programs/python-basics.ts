import { Program, bi, biList } from './types';

export const pythonBasics: Program = {
  id: 'python-basics',
  kind: 'school',
  icon: 'code',
  accent: 'purple',
  title: { en: 'Python: first steps', ru: 'Python: первые шаги', uz: 'Python: birinchi qadamlar' },
  summary: {
    en: 'Read and predict simple Python programs: expressions, variables, conditions and loops.',
    ru: 'Читаем и предсказываем простые программы на Python: выражения, переменные, условия и циклы.',
    uz: "Oddiy Python dasturlarini o'qish va natijasini oldindan aytish: ifodalar, o'zgaruvchilar, shartlar va sikllar.",
  },
  audience: { en: 'Grades 7–11', ru: '7–11 классы', uz: '7–11-sinflar' },
  lessons: [
    {
      id: 'expressions',
      title: { en: 'print and arithmetic', ru: 'print и арифметика', uz: 'print va arifmetika' },
      teach: biList(
        [
          'print(...) shows a value on the screen. Python calculates expressions with + - * / and also // (the whole part of a division), % (the remainder) and ** (power).',
          'The order is like in maths: powers first, then * / // %, then + -. Brackets change the order.',
          '/ always gives a decimal (7 / 2 is 3.5), // gives the whole part (7 // 2 is 3) and % gives the remainder (7 % 2 is 1).',
        ],
        [
          'print(...) выводит значение на экран. Python считает выражения с + - * / и ещё // (целая часть от деления), % (остаток) и ** (степень).',
          'Порядок как в математике: сначала степень, затем * / // %, потом + -. Скобки меняют порядок.',
          '/ всегда даёт дробное число (7 / 2 равно 3.5), // даёт целую часть (7 // 2 равно 3), а % даёт остаток (7 % 2 равно 1).',
        ]
      ),
      example: bi(
        'print(2 + 3 * 4) shows 14, because 3 * 4 is done first. print((2 + 3) * 4) shows 20.',
        'print(2 + 3 * 4) выведет 14, потому что сначала считается 3 * 4. print((2 + 3) * 4) выведет 20.'
      ),
      practice: [
        { q: bi('What does this code print?\nprint(10 // 3)', 'Что выведет код?\nprint(10 // 3)'), answer: 3, explain: bi('10 // 3 is the whole part of 3.33…, so 3.', '10 // 3 — целая часть от 3,33…, то есть 3.') },
        { q: bi('What does this code print?\nprint(10 % 3)', 'Что выведет код?\nprint(10 % 3)'), answer: 1, explain: bi('10 = 3·3 + 1, the remainder is 1.', '10 = 3·3 + 1, остаток 1.') },
        { q: bi('What does this code print?\nprint(2 ** 5)', 'Что выведет код?\nprint(2 ** 5)'), answer: 32, explain: bi('2 to the power 5 is 2·2·2·2·2 = 32.', '2 в степени 5 равно 2·2·2·2·2 = 32.') },
      ],
      labTopic: bi('Python: print and arithmetic operators', 'Python: print и арифметические операции'),
    },
    {
      id: 'variables',
      title: { en: 'Variables and strings', ru: 'Переменные и строки', uz: "O'zgaruvchilar va satrlar" },
      teach: biList(
        [
          'A variable is a name for a value: x = 5. The value can change later: x = x + 1.',
          'A string is text in quotes: name = "Ali". The + sign joins strings and len(...) gives the length of a string.',
          'Choose clear names such as age, price or total: the program is easier to read.',
        ],
        [
          'Переменная — это имя для значения: x = 5. Значение потом можно менять: x = x + 1.',
          'Строка — это текст в кавычках: name = "Ali". Знак + склеивает строки, а len(...) даёт длину строки.',
          'Давайте понятные имена, например age, price или total: так программу проще читать.',
        ]
      ),
      example: bi(
        'a = 3\na = a + 4\nprint(a)\nThis shows 7: first a is 3, then it becomes 3 + 4.',
        'a = 3\na = a + 4\nprint(a)\nВыведет 7: сначала a равно 3, потом становится 3 + 4.'
      ),
      practice: [
        { q: bi('What does this code print?\na = 6\nb = a * 2\nprint(b)', 'Что выведет код?\na = 6\nb = a * 2\nprint(b)'), answer: 12, explain: bi('b = 6 * 2 = 12.', 'b = 6 * 2 = 12.') },
        { q: bi('What does this code print?\nprint(len("python"))', 'Что выведет код?\nprint(len("python"))'), answer: 6, explain: bi('The word "python" has 6 letters.', 'В слове "python" 6 букв.') },
        { q: bi('What does this code print?\nx = 5\nx = x + x\nprint(x)', 'Что выведет код?\nx = 5\nx = x + x\nprint(x)'), answer: 10, explain: bi('x becomes 5 + 5 = 10.', 'x становится 5 + 5 = 10.') },
      ],
      labTopic: bi('Python: variables and strings', 'Python: переменные и строки'),
    },
    {
      id: 'conditions',
      title: { en: 'Conditions: if and else', ru: 'Условия: if и else', uz: 'Shartlar: if va else' },
      teach: biList(
        [
          'if checks a condition. If it is true, the indented block runs; otherwise the else block runs.',
          'Comparisons: == (equal), != (not equal), <, >, <=, >=. Do not mix = (assign a value) with == (compare).',
          'Indentation (4 spaces) shows which lines belong to the if or to the else.',
        ],
        [
          'if проверяет условие. Если оно верно, выполняется блок с отступом, иначе выполняется блок else.',
          'Сравнения: == (равно), != (не равно), <, >, <=, >=. Не путайте = (присвоить значение) и == (сравнить).',
          'Отступ (4 пробела) показывает, какие строки относятся к if, а какие к else.',
        ]
      ),
      example: bi(
        'x = 7\nif x > 5:\n    print("big")\nelse:\n    print("small")\nThe program prints big, because 7 > 5.',
        'x = 7\nif x > 5:\n    print("big")\nelse:\n    print("small")\nПрограмма выведет big, потому что 7 > 5.'
      ),
      practice: [
        { q: bi('What does this code print?\nx = 7\nif x > 5:\n    print(1)\nelse:\n    print(2)', 'Что выведет код?\nx = 7\nif x > 5:\n    print(1)\nelse:\n    print(2)'), answer: 1, explain: bi('7 > 5 is true, so the first block runs.', '7 > 5 верно, поэтому выполняется первый блок.') },
        { q: bi('What does this code print (one word)?\nn = 4\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")', 'Что выведет код (одно слово)?\nn = 4\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")'), answer: ['even'], explain: bi('4 % 2 is 0, so the condition is true: even.', '4 % 2 равно 0, условие верно: even.') },
        { q: bi('What does this code print?\nx = 3\nif x == 4:\n    print(10)\nelse:\n    print(20)', 'Что выведет код?\nx = 3\nif x == 4:\n    print(10)\nelse:\n    print(20)'), answer: 20, explain: bi('3 is not equal to 4, so the else block runs.', '3 не равно 4, поэтому выполняется блок else.') },
      ],
      labTopic: bi('Python: if, else and comparisons', 'Python: if, else и сравнения'),
    },
    {
      id: 'loops',
      title: { en: 'Loops: for and while', ru: 'Циклы: for и while', uz: 'Sikllar: for va while' },
      teach: biList(
        [
          'for repeats code for each value: for i in range(3) runs with i = 0, 1, 2 (range(3) stops before 3).',
          'range(1, 5) gives 1, 2, 3, 4. while repeats as long as its condition is true, so make sure the condition can become false.',
          'For a running total start with s = 0 and add to it inside the loop.',
        ],
        [
          'for повторяет код для каждого значения: for i in range(3) выполняется при i = 0, 1, 2 (range(3) останавливается перед 3).',
          'range(1, 5) даёт 1, 2, 3, 4. while повторяет, пока условие верно, поэтому условие должно когда-нибудь стать неверным.',
          'Для суммы начните с s = 0 и прибавляйте внутри цикла.',
        ]
      ),
      example: bi(
        's = 0\nfor i in range(1, 4):\n    s = s + i\nprint(s)\nThis shows 6, because 1 + 2 + 3 = 6.',
        's = 0\nfor i in range(1, 4):\n    s = s + i\nprint(s)\nВыведет 6, потому что 1 + 2 + 3 = 6.'
      ),
      practice: [
        { q: bi('How many lines does this code print?\nfor i in range(3):\n    print(i)', 'Сколько строк выведет код?\nfor i in range(3):\n    print(i)'), answer: 3, explain: bi('i takes the values 0, 1, 2: three lines.', 'i принимает значения 0, 1, 2: три строки.') },
        { q: bi('What does this code print?\ns = 0\nfor i in range(1, 5):\n    s = s + i\nprint(s)', 'Что выведет код?\ns = 0\nfor i in range(1, 5):\n    s = s + i\nprint(s)'), answer: 10, explain: bi('1 + 2 + 3 + 4 = 10.', '1 + 2 + 3 + 4 = 10.') },
        { q: bi('What does this code print?\ni = 0\nwhile i < 3:\n    i = i + 2\nprint(i)', 'Что выведет код?\ni = 0\nwhile i < 3:\n    i = i + 2\nprint(i)'), answer: 4, explain: bi('i goes 0, 2, 4; at 4 the condition i < 3 is false, so it prints 4.', 'i идёт 0, 2, 4; при 4 условие i < 3 ложно, значит выведется 4.') },
      ],
      labTopic: bi('Python: for and while loops', 'Python: циклы for и while'),
    },
  ],
};
