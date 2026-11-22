import type { UzOverlay } from '../types';

export const informaticsBasicsUz: Record<string, UzOverlay> = {
  units: {
    teach: [
      "Axborotning eng kichik birligi bit: 0 yoki 1. Bayt 8 bitga teng. Kilobayt (KB) 1024 bayt, megabayt (MB) 1024 KB.",
      "k ta bit bilan 2ᵏ ta turli qiymatni yozish mumkin: 1 bit 2 ta, 2 bit 4 ta, 3 bit 8 ta qiymat beradi va hokazo.",
      "Xabar hajmi = belgilar soni × bitta belgiga bitlar soni. Baytlarni olish uchun 8 ga bo'ling.",
    ],
    example: "Har bir belgisi 16 bit bo'lgan 20 belgili xabar: 20 × 16 = 320 bit = 320 / 8 = 40 bayt.",
    practice: [
      { q: "3 baytda nechta bit bor?", explain: "3 × 8 = 24." },
      { q: "5 bitda nechta turli qiymatni saqlash mumkin?", explain: "2⁵ = 32." },
      { q: "40 belgili xabar har bir belgisi 16 bit bilan yozilgan. Uning hajmi necha bayt?", explain: "40 × 16 = 640 bit, 640 / 8 = 80 bayt." },
    ],
  },
  binary: {
    teach: [
      "Ikkilik sanoq sistemasida faqat 0 va 1 raqamlari bor. Razryadlar o'ngdan chapga ikkining darajalari: 1, 2, 4, 8, 16, 32 …",
      "Ikkilik sonni o'nlik songa o'tkazish uchun 1 turgan razryadlarning og'irliklarini qo'shing. Masalan, 1011 = 8 + 2 + 1 = 11.",
      "O'nlik sonni ikkilikka o'tkazish uchun sig'adigan eng katta ikki darajasini ayiring, uning razryadiga 1 yozing va takrorlang. Ishlatilmagan razryadlarga 0 yoziladi.",
    ],
    example: "Ikkilik 110: 4 + 2 = 6. 9 = 8 + 1 esa ikkilikda 1001.",
    practice: [
      { q: "Ikkilik 1011 sonini o'nlik songa o'tkazing.", explain: "8 + 0 + 2 + 1 = 11." },
      { q: "O'nlik 13 sonini ikkilikka o'tkazing. (faqat raqamlarni yozing)", explain: "13 = 8 + 4 + 1, demak ikkilik son 1101." },
      { q: "Ikkilik 10000 sonini o'nlik songa o'tkazing.", explain: "Beshinchi razryaddagi yagona 1 bu 2⁴ = 16." },
    ],
  },
  logic: {
    teach: [
      "Mulohaza rost (1) yoki yolg'on (0) bo'ladi. VA faqat ikkala qism ham 1 bo'lsa 1 beradi. YOKI kamida bitta qism 1 bo'lsa 1 beradi. EMAS 1 ni 0 ga, 0 ni 1 ga almashtiradi.",
      "Avval qavslar, keyin EMAS, keyin VA, keyin YOKI hisoblanadi.",
      "Rostlik jadvali o'zgaruvchilarning barcha birikmalarini sanab beradi. n ta o'zgaruvchi uchun unda 2ⁿ ta qator bor.",
    ],
    example: "A = 1, B = 1: EMAS (A VA B) = EMAS 1 = 0.",
    practice: [
      { q: "A = 1 va B = 0. A YOKI B nimaga teng? (0 yoki 1)", explain: "YOKI kamida bitta qism 1 bo'lsa 1 bo'ladi." },
      { q: "A = 1 va B = 0. EMAS (A YOKI B) nimaga teng? (0 yoki 1)", explain: "A YOKI B = 1, EMAS 1 = 0." },
      { q: "3 ta o'zgaruvchili mulohazaning rostlik jadvalida nechta qator bor?", explain: "2³ = 8." },
    ],
  },
  algorithms: {
    teach: [
      "Algoritm bu aniq qadamlar ro'yxati. Uni tekshirish uchun izlang: har bir qadamdan keyin qiymatlarni yozib boring.",
      "«Takrorla» sikli qadamlarni belgilangan marta bajaradi. Har bir o'tishdan keyin o'zgaruvchilar yangi qiymat oladi, shuning uchun ularni jadvalga yozing.",
      "Ikkilik qidiruv sonni doim o'rtasini aytib, «katta» yoki «kichik» javobini bilish orqali topadi. Har bir urinish variantlarni ikkiga bo'ladi, shuning uchun 100 ta son uchun ham ko'pi bilan 7 ta urinish yetadi.",
    ],
    example: "x = 1. 3 marta takrorlang: x = x + 2. O'tishlardan keyin x 3, 5, 7 bo'ladi. Yakuniy qiymat 7.",
    practice: [
      { q: "x = 2. 3 marta takrorlang: x = x × 2. Oxirida x nimaga teng?", explain: "x avval 4, keyin 8, keyin 16 bo'ladi." },
      { q: "s = 0. i 1 dan 10 gacha: s = s + i. Oxirida s nimaga teng?", explain: "1 + 2 + … + 10 = 55." },
      { q: "Siz 1 dan 100 gacha sonni doim o'rtasini aytib topasiz. Eng ko'pi bilan nechta urinish kerak bo'lishi mumkin?", explain: "Har bir urinish variantlarni ikkiga bo'ladi: 100 → 50 → 25 → 12 → 6 → 3 → 1, ya'ni ko'pi bilan 7 ta urinish." },
    ],
  },
};
