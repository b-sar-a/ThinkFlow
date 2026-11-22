import { Program, bi, biList } from './types';

export const chemistryBasics: Program = {
  id: 'chemistry-basics',
  kind: 'school',
  icon: 'flask',
  accent: 'cyan',
  title: { en: 'Chemistry: the basics', ru: 'Химия: основы', uz: 'Kimyo: asoslar' },
  summary: {
    en: 'Atoms, moles, balancing equations and solutions: the calculations every chemistry course starts with.',
    ru: 'Атомы, моли, уравнивание реакций и растворы: расчёты, с которых начинается любой курс химии.',
    uz: "Atomlar, mollar, reaksiya tenglamalarini tenglashtirish va eritmalar: har qanday kimyo kursi boshlanadigan hisoblar.",
  },
  audience: { en: 'Grades 8–9', ru: '8–9 классы', uz: '8–9-sinflar' },
  lessons: [
    {
      id: 'atoms',
      title: { en: 'Atoms and the periodic table', ru: 'Атомы и периодическая таблица', uz: 'Atomlar va davriy jadval' },
      teach: biList(
        [
          'An atom has a nucleus made of protons (positive charge) and neutrons (no charge), with electrons (negative charge) around it. In a neutral atom the number of electrons equals the number of protons.',
          'The atomic number Z is the number of protons. It identifies the element and its place in the periodic table. The mass number A is protons plus neutrons, so the number of neutrons is A − Z.',
          'Elements in one column (group) of the periodic table have the same number of outer electrons, which is why they react in a similar way.',
        ],
        [
          'В атоме есть ядро из протонов (положительный заряд) и нейтронов (без заряда), а вокруг него электроны (отрицательный заряд). В нейтральном атоме число электронов равно числу протонов.',
          'Порядковый номер Z — это число протонов. Он определяет элемент и его место в периодической таблице. Массовое число A — это протоны плюс нейтроны, поэтому число нейтронов равно A − Z.',
          'У элементов одной группы (столбца) периодической таблицы одинаковое число внешних электронов, поэтому они реагируют похоже.',
        ]
      ),
      example: bi(
        'Sodium (Na) has Z = 11 and A = 23. It has 11 protons, 11 electrons (as a neutral atom) and 23 − 11 = 12 neutrons.',
        'У натрия (Na) Z = 11 и A = 23. В нём 11 протонов, 11 электронов (в нейтральном атоме) и 23 − 11 = 12 нейтронов.'
      ),
      practice: [
        {
          q: bi('Chlorine has atomic number 17. How many electrons does a neutral chlorine atom have?', 'Порядковый номер хлора 17. Сколько электронов в нейтральном атоме хлора?'),
          answer: 17,
          explain: bi('In a neutral atom electrons = protons = Z = 17.', 'В нейтральном атоме электронов столько же, сколько протонов: Z = 17.'),
        },
        {
          q: bi('An atom has Z = 8 and A = 16. How many neutrons does it have?', 'У атома Z = 8 и A = 16. Сколько в нём нейтронов?'),
          answer: 8,
          explain: bi('Neutrons = A − Z = 16 − 8 = 8.', 'Нейтронов A − Z = 16 − 8 = 8.'),
        },
        {
          q: bi('Carbon-14 has 6 protons. How many neutrons does it have?', 'У углерода-14 6 протонов. Сколько в нём нейтронов?'),
          answer: 8,
          explain: bi('The mass number is 14, so neutrons = 14 − 6 = 8.', 'Массовое число 14, значит нейтронов 14 − 6 = 8.'),
        },
      ],
      labTopic: bi('Atomic structure and the periodic table', 'Строение атома и периодическая таблица'),
    },
    {
      id: 'moles',
      title: { en: 'Moles and molar mass', ru: 'Моль и молярная масса', uz: 'Mol va molyar massa' },
      teach: biList(
        [
          'The molar mass M of a substance is the mass of one mole, in g/mol. For a molecule, add the atomic masses: H₂O = 2·1 + 16 = 18 g/mol.',
          'Amount of substance n (in moles), mass m and molar mass M are linked: n = m / M and m = n · M.',
          'Use rounded atomic masses from the periodic table: H = 1, C = 12, N = 14, O = 16, Na = 23, Cl = 35.5, Ca = 40.',
        ],
        [
          'Молярная масса M вещества — это масса одного моля, в г/моль. Для молекулы сложите атомные массы: H₂O = 2·1 + 16 = 18 г/моль.',
          'Количество вещества n (в молях), масса m и молярная масса M связаны: n = m / M и m = n · M.',
          'Берите округлённые атомные массы из периодической таблицы: H = 1, C = 12, N = 14, O = 16, Na = 23, Cl = 35,5, Ca = 40.',
        ]
      ),
      example: bi(
        'CO₂: M = 12 + 2·16 = 44 g/mol. 88 g of CO₂ is 88 / 44 = 2 mol.',
        'CO₂: M = 12 + 2·16 = 44 г/моль. 88 г CO₂ — это 88 / 44 = 2 моль.'
      ),
      practice: [
        {
          q: bi('What is the molar mass of NaCl in g/mol? (Na = 23, Cl = 35.5, give a number)', 'Чему равна молярная масса NaCl в г/моль? (Na = 23, Cl = 35,5, ответ числом)'),
          answer: 58.5,
          explain: bi('M = 23 + 35.5 = 58.5 g/mol.', 'M = 23 + 35,5 = 58,5 г/моль.'),
        },
        {
          q: bi('How many moles are in 36 g of water? (M = 18 g/mol)', 'Сколько молей в 36 г воды? (M = 18 г/моль)'),
          answer: 2,
          explain: bi('n = 36 / 18 = 2 mol.', 'n = 36 / 18 = 2 моль.'),
        },
        {
          q: bi('What is the mass of 0.5 mol of CaCO₃ in grams? (Ca = 40, C = 12, O = 16)', 'Какова масса 0,5 моль CaCO₃ в граммах? (Ca = 40, C = 12, O = 16)'),
          answer: 50,
          explain: bi('M = 40 + 12 + 3·16 = 100 g/mol, so m = 0.5 · 100 = 50 g.', 'M = 40 + 12 + 3·16 = 100 г/моль, значит m = 0,5 · 100 = 50 г.'),
        },
      ],
      labTopic: bi('Moles and molar mass: how to calculate', 'Моль и молярная масса: как считать'),
    },
    {
      id: 'equations',
      title: { en: 'Balancing equations', ru: 'Уравнивание реакций', uz: 'Reaksiya tenglamalarini tenglashtirish' },
      teach: biList(
        [
          'A chemical equation must have the same number of atoms of each element on both sides: atoms are not created or destroyed.',
          'To balance, change the coefficients (the numbers in front of formulas), never the small numbers inside a formula.',
          'Count the atoms of each element, start with the one that appears in the fewest formulas, and finish by checking every element.',
        ],
        [
          'В уравнении реакции атомов каждого элемента слева и справа должно быть поровну: атомы не возникают и не исчезают.',
          'Чтобы уравнять, меняйте коэффициенты (числа перед формулами), но никогда не маленькие числа внутри формулы.',
          'Посчитайте атомы каждого элемента, начните с того, что встречается в наименьшем числе формул, и в конце проверьте все элементы.',
        ]
      ),
      example: bi(
        'H₂ + O₂ → H₂O. Oxygen: 2 atoms on the left, 1 on the right, so put 2 before H₂O: H₂ + O₂ → 2H₂O. Now hydrogen: 4 on the right, so 2H₂ + O₂ → 2H₂O. Check: H 4 = 4, O 2 = 2. ✓',
        'H₂ + O₂ → H₂O. Кислород: слева 2 атома, справа 1, ставим 2 перед H₂O: H₂ + O₂ → 2H₂O. Теперь водород: справа 4, значит 2H₂ + O₂ → 2H₂O. Проверка: H 4 = 4, O 2 = 2. ✓'
      ),
      practice: [
        {
          q: bi('Balance 2H₂ + O₂ → ?H₂O. What is the coefficient before H₂O?', 'Уравняйте 2H₂ + O₂ → ?H₂O. Какой коэффициент перед H₂O?'),
          answer: 2,
          explain: bi('4 hydrogen atoms on the left give 2 molecules of H₂O (each has 2 H).', '4 атома водорода слева дают 2 молекулы H₂O (в каждой по 2 H).'),
        },
        {
          q: bi('Balance N₂ + ?H₂ → 2NH₃. What is the coefficient before H₂?', 'Уравняйте N₂ + ?H₂ → 2NH₃. Какой коэффициент перед H₂?'),
          answer: 3,
          explain: bi('2NH₃ has 6 hydrogen atoms, so 3H₂ are needed.', 'В 2NH₃ 6 атомов водорода, значит нужно 3H₂.'),
        },
        {
          q: bi('Balance ?Mg + O₂ → ?MgO. What is the coefficient before MgO?', 'Уравняйте ?Mg + O₂ → ?MgO. Какой коэффициент перед MgO?'),
          answer: 2,
          explain: bi('O₂ has 2 oxygen atoms, so 2MgO is needed, and then 2Mg: 2Mg + O₂ → 2MgO.', 'В O₂ два атома кислорода, значит нужно 2MgO, а тогда и 2Mg: 2Mg + O₂ → 2MgO.'),
        },
      ],
      labTopic: bi('How to balance chemical equations', 'Как уравнивать химические реакции'),
    },
    {
      id: 'solutions',
      title: { en: 'Solutions and mass percent', ru: 'Растворы и массовая доля', uz: 'Eritmalar va massa ulushi' },
      teach: biList(
        [
          'A solution is a solute (for example salt) dissolved in a solvent (for example water). Mass of solution = mass of solute + mass of solvent.',
          'Mass percent: ω = m(solute) / m(solution) × 100%.',
          'The same formula gives the mass of solute: m(solute) = ω × m(solution) / 100.',
        ],
        [
          'Раствор — это растворённое вещество (например, соль) в растворителе (например, в воде). Масса раствора = масса вещества + масса растворителя.',
          'Массовая доля: ω = m(вещества) / m(раствора) × 100%.',
          'Из той же формулы находят массу вещества: m(вещества) = ω × m(раствора) / 100.',
        ]
      ),
      example: bi(
        'Dissolve 20 g of salt in 180 g of water: the solution is 200 g, so ω = 20 / 200 × 100 = 10%.',
        'Растворили 20 г соли в 180 г воды: раствора 200 г, значит ω = 20 / 200 × 100 = 10%.'
      ),
      practice: [
        {
          q: bi('20 g of sugar is dissolved in 80 g of water. What is the mass percent of sugar?', '20 г сахара растворили в 80 г воды. Какова массовая доля сахара в процентах?'),
          answer: 20,
          explain: bi('The solution is 20 + 80 = 100 g, so ω = 20 / 100 × 100 = 20%.', 'Раствора 20 + 80 = 100 г, значит ω = 20 / 100 × 100 = 20%.'),
        },
        {
          q: bi('How many grams of salt are in 250 g of an 8% solution?', 'Сколько граммов соли в 250 г 8%-го раствора?'),
          answer: 20,
          explain: bi('m = 8 × 250 / 100 = 20 g.', 'm = 8 × 250 / 100 = 20 г.'),
        },
        {
          q: bi('50 g of salt is in 200 g of solution. What is the mass percent?', 'В 200 г раствора 50 г соли. Какова массовая доля в процентах?'),
          answer: 25,
          explain: bi('ω = 50 / 200 × 100 = 25%.', 'ω = 50 / 200 × 100 = 25%.'),
        },
      ],
      labTopic: bi('Solutions and mass percent', 'Растворы и массовая доля вещества'),
    },
  ],
};
