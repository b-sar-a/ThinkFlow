import { Program, bi, biList } from './types';

export const biologyBasics: Program = {
  id: 'biology-basics',
  kind: 'school',
  icon: 'dna',
  accent: 'teal',
  title: { en: 'Biology: cells and genetics', ru: 'Биология: клетка и генетика', uz: 'Biologiya: hujayra va genetika' },
  summary: {
    en: 'The cell, cell division, DNA and the first laws of genetics, with the calculations that come up in school tests.',
    ru: 'Клетка, деление клеток, ДНК и первые законы генетики, с расчётами, которые встречаются в школьных тестах.',
    uz: "Hujayra, hujayra bo'linishi, DNK va genetikaning dastlabki qonunlari, maktab testlarida uchraydigan hisoblar bilan.",
  },
  audience: { en: 'Grades 8–10', ru: '8–10 классы', uz: '8–10-sinflar' },
  lessons: [
    {
      id: 'cell',
      title: { en: 'The cell and its parts', ru: 'Клетка и её части', uz: 'Hujayra va uning qismlari' },
      teach: biList(
        [
          'Every living cell has a membrane (controls what goes in and out), cytoplasm (the jelly where reactions happen) and genetic material. In animal and plant cells the genetic material is inside a nucleus.',
          'Mitochondria release energy from food (cell respiration). Ribosomes build proteins. Plant cells also have a cell wall, chloroplasts (photosynthesis) and a large vacuole.',
          'A light microscope multiplies the magnification of the eyepiece by the magnification of the objective lens: total = eyepiece × objective.',
        ],
        [
          'У каждой живой клетки есть мембрана (регулирует, что входит и выходит), цитоплазма (среда, где идут реакции) и наследственный материал. В клетках животных и растений он находится в ядре.',
          'Митохондрии освобождают энергию из питательных веществ (клеточное дыхание). Рибосомы строят белки. У растительных клеток есть ещё клеточная стенка, хлоропласты (фотосинтез) и крупная вакуоль.',
          'Световой микроскоп увеличивает в число раз, равное произведению увеличения окуляра и объектива: общее увеличение = окуляр × объектив.',
        ]
      ),
      example: bi(
        'Eyepiece 10× and objective 20×: the image is magnified 10 × 20 = 200 times.',
        'Окуляр 10× и объектив 20×: изображение увеличено в 10 × 20 = 200 раз.'
      ),
      practice: [
        {
          q: bi('Which organelle carries out photosynthesis? (one word)', 'Какая органелла осуществляет фотосинтез? (одно слово)'),
          answer: ['chloroplast', 'chloroplasts', 'хлоропласт', 'хлоропласты', 'xloroplast', 'xloroplastlar'],
          explain: bi('Chloroplasts contain chlorophyll and make sugars from light, water and CO₂.', 'В хлоропластах есть хлорофилл, они делают сахара из света, воды и CO₂.'),
        },
        {
          q: bi('Which organelle releases energy from food in cell respiration? (one word)', 'Какая органелла освобождает энергию из пищи при клеточном дыхании? (одно слово)'),
          answer: ['mitochondria', 'mitochondrion', 'митохондрия', 'митохондрии', 'mitoxondriya', 'mitoxondriyalar'],
          explain: bi('Mitochondria are where respiration releases energy as ATP.', 'В митохондриях при дыхании энергия запасается в виде АТФ.'),
        },
        {
          q: bi('A microscope has an eyepiece of 10× and an objective of 40×. How many times does it magnify?', 'У микроскопа окуляр 10× и объектив 40×. Во сколько раз он увеличивает?'),
          answer: ['400'],
          explain: bi('10 × 40 = 400.', '10 × 40 = 400.'),
        },
      ],
      labTopic: bi('Parts of the cell and what they do', 'Части клетки и их функции'),
    },
    {
      id: 'division',
      title: { en: 'Cell division', ru: 'Деление клеток', uz: "Hujayra bo'linishi" },
      teach: biList(
        [
          'Mitosis makes two identical cells from one. It is how the body grows and repairs itself. If a cell divides n times, the result is 2ⁿ cells.',
          'A human body cell has 46 chromosomes (23 pairs). Sex cells (egg and sperm) have half of that, 23, so that a fertilised egg again has 46.',
          'Meiosis makes sex cells. One cell divides twice and gives 4 cells, each with half the number of chromosomes.',
        ],
        [
          'Митоз делит одну клетку на две одинаковые. Так организм растёт и восстанавливается. Если клетка делится n раз, получается 2ⁿ клеток.',
          'В клетке тела человека 46 хромосом (23 пары). В половых клетках (яйцеклетка и сперматозоид) вдвое меньше, 23, чтобы у оплодотворённой яйцеклетки снова стало 46.',
          'Мейоз образует половые клетки. Одна клетка делится дважды и даёт 4 клетки, в каждой вдвое меньше хромосом.',
        ]
      ),
      example: bi(
        'One cell divides by mitosis 4 times: 2⁴ = 16 cells.',
        'Одна клетка делится митозом 4 раза: 2⁴ = 16 клеток.'
      ),
      practice: [
        {
          q: bi('One cell divides by mitosis 3 times. How many cells are there at the end?', 'Одна клетка делится митозом 3 раза. Сколько клеток получится в конце?'),
          answer: 8,
          explain: bi('2³ = 8.', '2³ = 8.'),
        },
        {
          q: bi('A human skin cell has 46 chromosomes. How many chromosomes does one egg cell have?', 'В клетке кожи человека 46 хромосом. Сколько хромосом в одной яйцеклетке?'),
          answer: 23,
          explain: bi('Sex cells have half: 46 / 2 = 23.', 'В половых клетках вдвое меньше: 46 / 2 = 23.'),
        },
        {
          q: bi('How many cells form from one cell after meiosis?', 'Сколько клеток образуется из одной клетки после мейоза?'),
          answer: 4,
          explain: bi('Meiosis has two divisions in a row: 1 → 2 → 4 cells.', 'В мейозе два деления подряд: 1 → 2 → 4 клетки.'),
        },
      ],
      labTopic: bi('Mitosis and meiosis: the difference', 'Митоз и мейоз: в чём разница'),
    },
    {
      id: 'dna',
      title: { en: 'DNA and the genetic code', ru: 'ДНК и генетический код', uz: 'DNK va genetik kod' },
      teach: biList(
        [
          'DNA is a double chain of nucleotides. Each nucleotide has one of four bases: A (adenine), T (thymine), G (guanine), C (cytosine).',
          'The bases pair by a fixed rule: A with T, G with C. So in DNA the amount of A equals T, and G equals C, and A + T + G + C = 100%.',
          'Three nucleotides in a row (a codon) code for one amino acid. Proteins are chains of amino acids.',
        ],
        [
          'ДНК — двойная цепь нуклеотидов. В каждом нуклеотиде одно из четырёх оснований: A (аденин), T (тимин), G (гуанин), C (цитозин).',
          'Основания соединяются по правилу: A с T, G с C. Поэтому в ДНК количество A равно T, а G равно C, и A + T + G + C = 100%.',
          'Три нуклеотида подряд (кодон) кодируют одну аминокислоту. Белки — это цепочки аминокислот.',
        ]
      ),
      example: bi(
        'If 35% of the bases are A, then T is also 35%. G + C = 100 − 70 = 30%, so G = 15%.',
        'Если A составляет 35%, то T тоже 35%. G + C = 100 − 70 = 30%, значит G = 15%.'
      ),
      practice: [
        {
          q: bi('In a DNA molecule 30% of the bases are adenine (A). What percent are guanine (G)?', 'В молекуле ДНК 30% оснований — аденин (A). Сколько процентов составляет гуанин (G)?'),
          answer: 20,
          explain: bi('T = 30%, so G + C = 100 − 60 = 40%, and G = 20%.', 'T = 30%, значит G + C = 100 − 60 = 40%, и G = 20%.'),
        },
        {
          q: bi('One DNA strand reads A-T-G-C-C. How many G bases are in the complementary strand?', 'Одна цепь ДНК читается A-T-G-C-C. Сколько оснований G в комплементарной цепи?'),
          answer: 2,
          explain: bi('The complementary strand is T-A-C-G-G, which has 2 G.', 'Комплементарная цепь T-A-C-G-G, в ней 2 основания G.'),
        },
        {
          q: bi('A coding section has 300 nucleotides (ignore start and stop codons). How many amino acids does it code for?', 'Кодирующий участок содержит 300 нуклеотидов (старт- и стоп-кодоны не учитывайте). Сколько аминокислот он кодирует?'),
          answer: ['100'],
          explain: bi('One amino acid needs 3 nucleotides: 300 / 3 = 100.', 'Одна аминокислота — 3 нуклеотида: 300 / 3 = 100.'),
        },
      ],
      labTopic: bi('DNA, base pairing and the genetic code', 'ДНК, комплементарность и генетический код'),
    },
    {
      id: 'genetics',
      title: { en: "Mendel's crosses", ru: 'Скрещивания Менделя', uz: 'Mendel chatishtirishlari' },
      teach: biList(
        [
          'A gene has two alleles, one from each parent. A capital letter (A) is the dominant allele and a small letter (a) is the recessive one. AA and aa are homozygous, Aa is heterozygous.',
          'A dominant allele shows in the organism even if only one copy is present. The recessive trait shows only in aa.',
          'Cross Aa × Aa gives AA : Aa : aa = 1 : 2 : 1, so 3 parts show the dominant trait and 1 part the recessive one (3 : 1). Cross Aa × aa gives Aa : aa = 1 : 1.',
        ],
        [
          'У гена два аллеля, по одному от каждого родителя. Заглавная буква (A) — доминантный аллель, строчная (a) — рецессивный. AA и aa — гомозиготы, Aa — гетерозигота.',
          'Доминантный аллель проявляется, даже если он один. Рецессивный признак проявляется только у aa.',
          'Скрещивание Aa × Aa даёт AA : Aa : aa = 1 : 2 : 1, то есть 3 части с доминантным признаком и 1 часть с рецессивным (3 : 1). Скрещивание Aa × aa даёт Aa : aa = 1 : 1.',
        ]
      ),
      example: bi(
        'Two heterozygous pea plants (Aa × Aa) have 80 offspring. About 3/4 of them, 60, show the dominant trait.',
        'Два гетерозиготных растения гороха (Aa × Aa) дали 80 потомков. Около 3/4 из них, то есть 60, имеют доминантный признак.'
      ),
      practice: [
        {
          q: bi('Two heterozygous parents (Aa × Aa) have 64 offspring. How many are expected to show the dominant trait?', 'У двух гетерозиготных родителей (Aa × Aa) 64 потомка. Сколько из них ожидаемо имеют доминантный признак?'),
          answer: 48,
          explain: bi('3/4 of 64 = 48.', '3/4 от 64 = 48.'),
        },
        {
          q: bi('In the cross Aa × aa, what percent of the offspring are expected to be aa?', 'В скрещивании Aa × aa сколько процентов потомков ожидаемо будут aa?'),
          answer: 50,
          explain: bi('Aa : aa = 1 : 1, so half, 50%.', 'Aa : aa = 1 : 1, значит половина, 50%.'),
        },
        {
          q: bi('In the cross AA × aa, what percent of the offspring are heterozygous (Aa)?', 'В скрещивании AA × aa сколько процентов потомков гетерозиготны (Aa)?'),
          answer: 100,
          explain: bi('Every offspring gets A from one parent and a from the other: all Aa.', 'Каждый потомок получает A от одного родителя и a от другого: все Aa.'),
        },
      ],
      labTopic: bi("Mendel's laws and Punnett squares", 'Законы Менделя и решётка Пеннета'),
    },
  ],
};
