import type { UzOverlay } from '../types';

export const pythonBasicsUz: Record<string, UzOverlay> = {
  expressions: {
    teach: [
      "print(...) qiymatni ekranga chiqaradi. Python + - * / amallari bilan, shuningdek // (bo'lishning butun qismi), % (qoldiq) va ** (daraja) bilan ifodalarni hisoblaydi.",
      "Tartib matematikadagidek: avval daraja, keyin * / // %, so'ng + -. Qavslar tartibni o'zgartiradi.",
      "/ doim kasr son beradi (7 / 2 bu 3.5), // butun qismni beradi (7 // 2 bu 3), % esa qoldiqni beradi (7 % 2 bu 1).",
    ],
    example: "print(2 + 3 * 4) 14 ni chiqaradi, chunki avval 3 * 4 hisoblanadi. print((2 + 3) * 4) esa 20 ni chiqaradi.",
    practice: [
      { q: "Kod nimani chiqaradi?\nprint(10 // 3)", explain: "10 // 3 bu 3,33… ning butun qismi, ya'ni 3." },
      { q: "Kod nimani chiqaradi?\nprint(10 % 3)", explain: "10 = 3·3 + 1, qoldiq 1." },
      { q: "Kod nimani chiqaradi?\nprint(2 ** 5)", explain: "2 ning 5-darajasi 2·2·2·2·2 = 32." },
    ],
  },
  variables: {
    teach: [
      "O'zgaruvchi qiymatga berilgan nom: x = 5. Qiymatni keyin o'zgartirish mumkin: x = x + 1.",
      "Satr bu qo'shtirnoq ichidagi matn: name = \"Ali\". + belgisi satrlarni birlashtiradi, len(...) esa satr uzunligini beradi.",
      "age, price yoki total kabi tushunarli nomlar tanlang: dasturni o'qish osonroq bo'ladi.",
    ],
    example: "a = 3\na = a + 4\nprint(a)\n7 ni chiqaradi: avval a = 3, keyin u 3 + 4 ga aylanadi.",
    practice: [
      { q: "Kod nimani chiqaradi?\na = 6\nb = a * 2\nprint(b)", explain: "b = 6 * 2 = 12." },
      { q: "Kod nimani chiqaradi?\nprint(len(\"python\"))", explain: "\"python\" so'zida 6 ta harf bor." },
      { q: "Kod nimani chiqaradi?\nx = 5\nx = x + x\nprint(x)", explain: "x 5 + 5 = 10 ga aylanadi." },
    ],
  },
  conditions: {
    teach: [
      "if shartni tekshiradi. Shart to'g'ri bo'lsa, surilgan blok bajariladi, aks holda else bloki bajariladi.",
      "Taqqoslashlar: == (teng), != (teng emas), <, >, <=, >=. = (qiymat berish) bilan == (taqqoslash) ni adashtirmang.",
      "Surilish (4 ta probel) qaysi qatorlar if ga, qaysilari else ga tegishli ekanini ko'rsatadi.",
    ],
    example: "x = 7\nif x > 5:\n    print(\"big\")\nelse:\n    print(\"small\")\nDastur big ni chiqaradi, chunki 7 > 5.",
    practice: [
      { q: "Kod nimani chiqaradi?\nx = 7\nif x > 5:\n    print(1)\nelse:\n    print(2)", explain: "7 > 5 to'g'ri, shuning uchun birinchi blok bajariladi." },
      { q: "Kod nimani chiqaradi (bitta so'z)?\nn = 4\nif n % 2 == 0:\n    print(\"even\")\nelse:\n    print(\"odd\")", explain: "4 % 2 nolga teng, shart to'g'ri: even." },
      { q: "Kod nimani chiqaradi?\nx = 3\nif x == 4:\n    print(10)\nelse:\n    print(20)", explain: "3 soni 4 ga teng emas, shuning uchun else bloki bajariladi." },
    ],
  },
  loops: {
    teach: [
      "for kodni har bir qiymat uchun takrorlaydi: for i in range(3) i = 0, 1, 2 da ishlaydi (range(3) 3 dan oldin to'xtaydi).",
      "range(1, 5) 1, 2, 3, 4 ni beradi. while sharti to'g'ri bo'lguncha takrorlaydi, shuning uchun shart bir kun yolg'on bo'lishi kerak.",
      "Yig'indi uchun s = 0 dan boshlang va sikl ichida unga qo'shib boring.",
    ],
    example: "s = 0\nfor i in range(1, 4):\n    s = s + i\nprint(s)\n6 ni chiqaradi, chunki 1 + 2 + 3 = 6.",
    practice: [
      { q: "Kod nechta qator chiqaradi?\nfor i in range(3):\n    print(i)", explain: "i 0, 1, 2 qiymatlarni oladi: uchta qator." },
      { q: "Kod nimani chiqaradi?\ns = 0\nfor i in range(1, 5):\n    s = s + i\nprint(s)", explain: "1 + 2 + 3 + 4 = 10." },
      { q: "Kod nimani chiqaradi?\ni = 0\nwhile i < 3:\n    i = i + 2\nprint(i)", explain: "i 0, 2, 4 bo'ladi; 4 da i < 3 sharti yolg'on, shuning uchun 4 chiqadi." },
    ],
  },
};
