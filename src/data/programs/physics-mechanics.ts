import { Program, bi, biList } from './types';

export const physicsMechanics: Program = {
  id: 'physics-mechanics',
  kind: 'school',
  icon: 'atom',
  accent: 'rose',
  title: { en: 'Physics: mechanics', ru: 'Физика: механика', uz: 'Fizika: mexanika' },
  summary: {
    en: 'Motion, forces, energy and momentum: the foundation for every later physics topic.',
    ru: 'Движение, силы, энергия и импульс: основа для всех следующих тем физики.',
    uz: "Harakat, kuchlar, energiya va impuls: fizikaning keyingi barcha mavzulari uchun asos.",
  },
  audience: { en: 'Grades 9–10', ru: '9–10 классы', uz: '9–10-sinflar' },
  lessons: [
    {
      id: 'uniform-motion',
      title: { en: 'Speed and uniform motion', ru: 'Скорость и равномерное движение', uz: 'Tezlik va tekis harakat' },
      teach: biList(
        [
          'Speed shows how fast something moves: v = s / t, where s is the distance and t is the time. The unit is m/s or km/h.',
          'In uniform motion the speed does not change, so the distance is s = v · t and the time is t = s / v.',
          'Always check the units. To change km/h to m/s, divide by 3.6.',
        ],
        [
          'Скорость показывает, как быстро движется тело: v = s / t, где s — путь, t — время. Единица измерения: м/с или км/ч.',
          'При равномерном движении скорость не меняется, поэтому путь s = v · t, а время t = s / v.',
          'Всегда проверяй единицы. Чтобы перевести км/ч в м/с, раздели на 3,6.',
        ]
      ),
      example: bi(
        'A cyclist covers 150 m in 30 s. v = 150 / 30 = 5 m/s. In 10 s he covers 5 · 10 = 50 m.',
        'Велосипедист проезжает 150 м за 30 с. v = 150 / 30 = 5 м/с. За 10 с он проедет 5 · 10 = 50 м.'
      ),
      practice: [
        {
          q: bi('A car covers 120 km in 2 hours. What is its speed in km/h?', 'Автомобиль проезжает 120 км за 2 часа. Какова его скорость в км/ч?'),
          answer: 60,
          explain: bi('v = 120 / 2 = 60 km/h.', 'v = 120 / 2 = 60 км/ч.'),
        },
        {
          q: bi('At 12 m/s, how far does a runner go in 4 s (in metres)?', 'Бегун бежит со скоростью 12 м/с. Какой путь он пройдёт за 4 с (в метрах)?'),
          answer: 48,
          explain: bi('s = 12 · 4 = 48 m.', 's = 12 · 4 = 48 м.'),
        },
        {
          q: bi('How many seconds to travel 90 m at 15 m/s?', 'За сколько секунд тело пройдёт 90 м со скоростью 15 м/с?'),
          answer: 6,
          explain: bi('t = 90 / 15 = 6 s.', 't = 90 / 15 = 6 с.'),
        },
      ],
      labTopic: bi('Speed and uniform motion in physics', 'Скорость и равномерное движение'),
    },
    {
      id: 'acceleration',
      title: { en: 'Acceleration', ru: 'Ускорение', uz: 'Tezlanish' },
      teach: biList(
        [
          'Acceleration shows how quickly the velocity changes: a = (v − v₀) / t. The unit is m/s².',
          'From this, the final velocity is v = v₀ + a · t. If the body slows down, the acceleration is negative.',
          'A body that starts from rest has v₀ = 0. A body that stops has v = 0.',
        ],
        [
          'Ускорение показывает, как быстро меняется скорость: a = (v − v₀) / t. Единица измерения: м/с².',
          'Отсюда конечная скорость v = v₀ + a · t. Если тело тормозит, ускорение отрицательное.',
          'Если тело начинает движение из покоя, v₀ = 0. Если тело останавливается, v = 0.',
        ]
      ),
      example: bi(
        'A car speeds up from 0 to 20 m/s in 5 s. a = (20 − 0) / 5 = 4 m/s².',
        'Автомобиль разгоняется от 0 до 20 м/с за 5 с. a = (20 − 0) / 5 = 4 м/с².'
      ),
      practice: [
        {
          q: bi('A body starts from rest with a = 3 m/s². What is its speed after 4 s (m/s)?', 'Тело начинает движение из покоя с a = 3 м/с². Какова его скорость через 4 с (м/с)?'),
          answer: 12,
          explain: bi('v = 0 + 3 · 4 = 12 m/s.', 'v = 0 + 3 · 4 = 12 м/с.'),
        },
        {
          q: bi('v₀ = 5 m/s, a = 2 m/s², t = 3 s. What is v (m/s)?', 'v₀ = 5 м/с, a = 2 м/с², t = 3 с. Чему равна v (м/с)?'),
          answer: 11,
          explain: bi('v = 5 + 2 · 3 = 11 m/s.', 'v = 5 + 2 · 3 = 11 м/с.'),
        },
        {
          q: bi('A car at 30 m/s brakes with a = −6 m/s². How many seconds until it stops?', 'Автомобиль едет 30 м/с и тормозит с a = −6 м/с². Через сколько секунд он остановится?'),
          answer: 5,
          explain: bi('0 = 30 − 6t, so t = 5 s.', '0 = 30 − 6t, значит t = 5 с.'),
        },
      ],
      labTopic: bi('Acceleration and velocity change', 'Ускорение и изменение скорости'),
    },
    {
      id: 'newton-second-law',
      title: { en: "Newton's second law", ru: 'Второй закон Ньютона', uz: 'Nyutonning ikkinchi qonuni' },
      teach: biList(
        [
          "Newton's second law: F = m · a. The net force on a body equals its mass times its acceleration. The unit of force is the newton (N).",
          'The weight of a body is the force of gravity on it: W = m · g. In school problems g is taken as 10 m/s² (more precisely 9.8).',
          'The same force gives a heavier body less acceleration: a = F / m.',
        ],
        [
          'Второй закон Ньютона: F = m · a. Равнодействующая сила равна массе, умноженной на ускорение. Единица силы — ньютон (Н).',
          'Вес тела — это сила тяжести, действующая на него: P = m · g. В школьных задачах g принимают равным 10 м/с² (точнее 9,8).',
          'Одна и та же сила даёт более тяжёлому телу меньшее ускорение: a = F / m.',
        ]
      ),
      example: bi(
        'A force of 20 N acts on a 5 kg body. a = F / m = 20 / 5 = 4 m/s².',
        'На тело массой 5 кг действует сила 20 Н. a = F / m = 20 / 5 = 4 м/с².'
      ),
      practice: [
        {
          q: bi('m = 3 kg and a = 6 m/s². What force (N)?', 'm = 3 кг и a = 6 м/с². Какая сила (Н)?'),
          answer: 18,
          explain: bi('F = 3 · 6 = 18 N.', 'F = 3 · 6 = 18 Н.'),
        },
        {
          q: bi('F = 40 N and m = 8 kg. What acceleration (m/s²)?', 'F = 40 Н и m = 8 кг. Какое ускорение (м/с²)?'),
          answer: 5,
          explain: bi('a = 40 / 8 = 5 m/s².', 'a = 40 / 8 = 5 м/с².'),
        },
        {
          q: bi('What is the weight of a 6 kg body (N), taking g = 10 m/s²?', 'Каков вес тела массой 6 кг (Н), если g = 10 м/с²?'),
          answer: 60,
          explain: bi('W = 6 · 10 = 60 N.', 'P = 6 · 10 = 60 Н.'),
        },
      ],
      labTopic: bi("Newton's second law with examples", 'Второй закон Ньютона на примерах'),
    },
    {
      id: 'work-energy',
      title: { en: 'Work, power and energy', ru: 'Работа, мощность и энергия', uz: 'Ish, quvvat va energiya' },
      teach: biList(
        [
          'Work done by a force along the direction of motion: A = F · s. The unit is the joule (J).',
          'Power is how fast work is done: P = A / t. The unit is the watt (W).',
          'A moving body has kinetic energy E = m·v² / 2. Lifting a body to height h gives it potential energy E = m·g·h.',
        ],
        [
          'Работа силы вдоль направления движения: A = F · s. Единица измерения — джоуль (Дж).',
          'Мощность показывает, как быстро совершается работа: P = A / t. Единица — ватт (Вт).',
          'Движущееся тело обладает кинетической энергией E = m·v² / 2. Поднятое на высоту h тело обладает потенциальной энергией E = m·g·h.',
        ]
      ),
      example: bi(
        'A force of 50 N moves a box 4 m: A = 50 · 4 = 200 J.',
        'Сила 50 Н перемещает ящик на 4 м: A = 50 · 4 = 200 Дж.'
      ),
      practice: [
        {
          q: bi('Work of 500 J is done in 10 s. What is the power (W)?', 'Работа 500 Дж совершена за 10 с. Какая мощность (Вт)?'),
          answer: 50,
          explain: bi('P = 500 / 10 = 50 W.', 'P = 500 / 10 = 50 Вт.'),
        },
        {
          q: bi('A 2 kg body moves at 3 m/s. What is its kinetic energy (J)?', 'Тело массой 2 кг движется со скоростью 3 м/с. Какова его кинетическая энергия (Дж)?'),
          answer: 9,
          explain: bi('E = 2 · 3² / 2 = 9 J.', 'E = 2 · 3² / 2 = 9 Дж.'),
        },
        {
          q: bi('A 5 kg body is lifted by 2 m (g = 10 m/s²). How much potential energy does it gain (J)?', 'Тело массой 5 кг поднято на 2 м (g = 10 м/с²). Какую потенциальную энергию оно получило (Дж)?'),
          answer: 100,
          explain: bi('E = 5 · 10 · 2 = 100 J.', 'E = 5 · 10 · 2 = 100 Дж.'),
        },
      ],
      labTopic: bi('Work, power and energy', 'Работа, мощность и энергия'),
    },
    {
      id: 'momentum',
      title: { en: 'Momentum', ru: 'Импульс', uz: 'Impuls' },
      teach: biList(
        [
          'Momentum is mass times velocity: p = m · v. The unit is kg·m/s. It has a direction, like velocity.',
          'In a closed system the total momentum is conserved: the total before a collision equals the total after.',
          'If two bodies stick together after a collision, they move with a common velocity: v = (total momentum) / (total mass).',
        ],
        [
          'Импульс тела — это масса, умноженная на скорость: p = m · v. Единица: кг·м/с. Импульс имеет направление, как и скорость.',
          'В замкнутой системе суммарный импульс сохраняется: до столкновения он такой же, как после.',
          'Если после столкновения тела слипаются, они движутся с общей скоростью: v = (суммарный импульс) / (суммарная масса).',
        ]
      ),
      example: bi(
        'A 2 kg cart moves at 3 m/s: p = 6 kg·m/s. It hits a 1 kg cart at rest and they stick: v = 6 / 3 = 2 m/s.',
        'Тележка 2 кг движется со скоростью 3 м/с: p = 6 кг·м/с. Она сталкивается с неподвижной тележкой 1 кг, и они сцепляются: v = 6 / 3 = 2 м/с.'
      ),
      practice: [
        {
          q: bi('A 0.5 kg ball moves at 8 m/s. What is its momentum (kg·m/s)?', 'Мяч массой 0,5 кг движется со скоростью 8 м/с. Каков его импульс (кг·м/с)?'),
          answer: 4,
          explain: bi('p = 0.5 · 8 = 4 kg·m/s.', 'p = 0,5 · 8 = 4 кг·м/с.'),
        },
        {
          q: bi('A 1500 kg car moves at 20 m/s. What is its momentum (kg·m/s)?', 'Автомобиль массой 1500 кг едет со скоростью 20 м/с. Каков его импульс (кг·м/с)?'),
          answer: 30000,
          explain: bi('p = 1500 · 20 = 30 000 kg·m/s.', 'p = 1500 · 20 = 30 000 кг·м/с.'),
        },
        {
          q: bi('A 4 kg cart at 5 m/s hits a 1 kg cart at rest and they stick together. What is their speed (m/s)?', 'Тележка 4 кг со скоростью 5 м/с сталкивается с неподвижной тележкой 1 кг, и они сцепляются. Какова их скорость (м/с)?'),
          answer: 4,
          explain: bi('p = 4 · 5 = 20, total mass 5 kg, so v = 4 m/s.', 'p = 4 · 5 = 20, общая масса 5 кг, значит v = 4 м/с.'),
        },
      ],
      labTopic: bi('Momentum and conservation of momentum', 'Импульс и закон сохранения импульса'),
    },
  ],
};
