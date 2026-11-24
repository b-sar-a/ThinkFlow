export type Template = { title: string; desc: string; diff: 'Easy' | 'Medium' | 'Challenge'; xp: number; answer: number };

// The same seven problems in all three languages.
export const TEMPLATES: Record<'ru' | 'en' | 'uz', Template[]> = {
  en: [
    { title: "Kinetics: Velocity", desc: "Calculate the velocity (v) if an object travels 150m (d) in 30s (t). Formula: v=d/t. Result in m/s.", diff: "Easy", xp: 30, answer: 5 },
    { title: "Algebra: Simplify", desc: "Solve for x: 3x + 15 = 45. Give the numeric value.", diff: "Easy", xp: 35, answer: 10 },
    { title: "Ohm's Law", desc: "A circuit has 10V (V) and 2Ω resistance (R). Calculate the current (I). Formula: I=V/R. Result in Amperes.", diff: "Medium", xp: 60, answer: 5 },
    { title: "Geometry: Area", desc: "Calculate the area of a circle with radius r=5m. Use π=3.14. Formula: A=πr². Result in m².", diff: "Medium", xp: 65, answer: 78.5 },
    { title: "Chemistry: Molar Mass", desc: "Calculate the molar mass of H₂O. (H=1, O=16). Give the total g/mol.", diff: "Medium", xp: 70, answer: 18 },
    { title: "Logic: Sequence", desc: "Find the missing number: 1, 1, 2, 3, 5, 8, ?. (Fibonacci sequence)", diff: "Medium", xp: 50, answer: 13 },
    { title: "Physics: Power", desc: "Calculate Power (P) if Work (W) is 500J and time (t) is 10s. Formula: P=W/t. Result in Watts.", diff: "Challenge", xp: 125, answer: 50 },
  ],
  uz: [
    { title: "Kinematika: tezlik", desc: "Jism 30 s (t) da 150 m (d) yo'l o'tsa, uning tezligi (v) nimaga teng? Formula: v = d / t. Javob m/s da.", diff: "Easy", xp: 30, answer: 5 },
    { title: "Algebra: x ni toping", desc: "Tenglamani yeching: 3x + 15 = 45. Javob son bo'lsin.", diff: "Easy", xp: 35, answer: 10 },
    { title: "Om qonuni", desc: "Zanjirda kuchlanish 10 V (V), qarshilik 2 Om (R). Tok kuchi (I) ni toping. Formula: I = V / R. Javob amperda.", diff: "Medium", xp: 60, answer: 5 },
    { title: "Geometriya: yuza", desc: "Radiusi r = 5 m bo'lgan doiraning yuzini toping. π = 3,14 deb oling. Formula: A = πr². Javob m² da.", diff: "Medium", xp: 65, answer: 78.5 },
    { title: "Kimyo: molyar massa", desc: "H₂O ning molyar massasini toping (H = 1, O = 16). Javob g/mol da.", diff: "Medium", xp: 70, answer: 18 },
    { title: "Mantiq: ketma-ketlik", desc: "Yetishmayotgan sonni toping: 1, 1, 2, 3, 5, 8, ? (Fibonachchi sonlari).", diff: "Medium", xp: 50, answer: 13 },
    { title: "Fizika: quvvat", desc: "Ish (W) 500 J, vaqt (t) 10 s bo'lsa, quvvat (P) ni toping. Formula: P = W / t. Javob vattda.", diff: "Challenge", xp: 125, answer: 50 },
  ],
  ru: [
    { title: "Кинематика: скорость", desc: "Найди скорость (v), если тело проходит 150 м (d) за 30 с (t). Формула: v = d / t. Ответ в м/с.", diff: "Easy", xp: 30, answer: 5 },
    { title: "Алгебра: найди x", desc: "Реши уравнение: 3x + 15 = 45. Ответ — число.", diff: "Easy", xp: 35, answer: 10 },
    { title: "Закон Ома", desc: "В цепи напряжение 10 В (V) и сопротивление 2 Ом (R). Найди силу тока (I). Формула: I = V / R. Ответ в амперах.", diff: "Medium", xp: 60, answer: 5 },
    { title: "Геометрия: площадь", desc: "Найди площадь круга с радиусом r = 5 м. Возьми π = 3,14. Формула: A = πr². Ответ в м².", diff: "Medium", xp: 65, answer: 78.5 },
    { title: "Химия: молярная масса", desc: "Найди молярную массу H₂O (H = 1, O = 16). Ответ в г/моль.", diff: "Medium", xp: 70, answer: 18 },
    { title: "Логика: последовательность", desc: "Найди пропущенное число: 1, 1, 2, 3, 5, 8, ? (числа Фибоначчи).", diff: "Medium", xp: 50, answer: 13 },
    { title: "Физика: мощность", desc: "Найди мощность (P), если работа (W) равна 500 Дж, а время (t) — 10 с. Формула: P = W / t. Ответ в ваттах.", diff: "Challenge", xp: 125, answer: 50 },
  ],
};

/** The built-in problems have a known answer, so they are checked here and cost no AI tokens. */
export const knownAnswer = (title: string): number | null => {
  for (const list of Object.values(TEMPLATES)) {
    const hit = list.find((tpl) => tpl.title === title);
    if (hit) return hit.answer;
  }
  return null;
};
