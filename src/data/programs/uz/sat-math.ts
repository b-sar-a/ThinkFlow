import type { UzOverlay } from '../types';

export const satMathUz: Record<string, UzOverlay> = {
  'linear-word-problems': {
    teach: [
      "SAT savollarining ko'pi niqoblangan chiziqli tenglamadir. Doimiy to'lov va stavka: jami = doimiy + stavka × miqdor.",
      "Shartni o'qing, noma'lumni belgilang va bitta tenglama tuzing. Uni yechib, javob masala mazmuniga mos kelishini tekshiring.",
      "Qavslar bo'lsa yoki x ikkala tomonda bo'lsa, avval qavslarni oching va x li hadlarni bir tomonga yig'ing.",
    ],
    example: "Sport zaliga a'zo bo'lish $20, oyiga esa $15. m oydan keyin narx 20 + 15m. Agar u $125 bo'lsa: 15m = 105, demak m = 7.",
    practice: [
      { q: "Chilangar $40 va soatiga $25 oladi. Hisob $165. Necha soat ishladi?", explain: "40 + 25h = 165, demak 25h = 125 va h = 5." },
      { q: "3(2x − 4) = 2x + 8 tenglamani yeching. x = ?", explain: "6x − 12 = 2x + 8, demak 4x = 20 va x = 5." },
      { q: "Agar 4x + 2y = 20 va y = 2 bo'lsa, x nimaga teng?", explain: "4x + 4 = 20, demak 4x = 16 va x = 4." },
    ],
  },
  'percent-ratio': {
    teach: [
      "Foiz «yuzdan» degani. Sonning p% ini topish uchun uni p/100 ga ko'paytiring. p% ga oshirish uchun 1 + p/100 ga, kamaytirish uchun 1 − p/100 ga ko'paytiring.",
      "A soni B ning necha foizi ekanini topish uchun A / B × 100 ni hisoblang.",
      "a : b nisbat butunni a + b teng qismga bo'ladi. Bir qism butunni (a + b) ga bo'lganga teng.",
    ],
    example: "50 ni 20% ga oshirish: 50 × 1,2 = 60. 40 ni 2 : 3 nisbatda bo'lish: bir qism 40 / 5 = 8, demak ulushlar 16 va 24.",
    practice: [
      { q: "$80 turadigan kurtka narxi 25% ga arzonlashdi. Yangi narx necha dollar?", explain: "80 × 0,75 = 60." },
      { q: "45 soni 60 ning necha foizi?", explain: "45 / 60 = 0,75, ya'ni 75%." },
      { q: "O'g'il bolalar va qizlar nisbati 3 : 5, jami 24 o'quvchi. O'g'il bolalar nechta?", explain: "Bir qism 24 / 8 = 3, demak o'g'il bolalar 3 × 3 = 9 ta." },
    ],
  },
  'quadratics-factoring': {
    teach: [
      "Qavslarni ochish uchun har bir hadni har bir hadga ko'paytiring: (x + 3)(x − 4) = x² − 4x + 3x − 12 = x² − x − 12.",
      "x² + bx + c ni ko'paytuvchilarga ajratish uchun ko'paytmasi c ga, yig'indisi b ga teng ikki sonni toping.",
      "Ko'paytma faqat ko'paytuvchilardan biri nolga teng bo'lganda nolga teng. Ajratilgan tenglamadan yechimlar shunday o'qiladi. (x + a)² = x² + 2ax + a² formulasini eslab qoling.",
    ],
    example: "x² − x − 12 = 0. Ko'paytmasi −12, yig'indisi −1 bo'lgan sonlar: −4 va 3. Demak (x − 4)(x + 3) = 0 va x = 4 yoki x = −3.",
    practice: [
      { q: "x² − 9 = 0 tenglamaning musbat yechimi nimaga teng?", explain: "x² = 9, demak x = 3 yoki −3. Musbati 3." },
      { q: "x² − x − 6 = 0 tenglamaning musbat yechimi nimaga teng?", explain: "(x − 3)(x + 2) = 0, demak x = 3 yoki −2. Musbati 3." },
      { q: "Agar x² + bx + 4 ifoda barcha x da (x + 2)² ga teng bo'lsa, b nimaga teng?", explain: "(x + 2)² = x² + 4x + 4, demak b = 4." },
    ],
  },
  'geometry-basics': {
    teach: [
      "Katetlari a va b, gipotenuzasi c bo'lgan to'g'ri burchakli uchburchakda: a² + b² = c². Eslab qolish kerak bo'lgan uchliklar: 3-4-5, 5-12-13, 8-15-17.",
      "Radiusi r bo'lgan aylana: doira yuzi = πr², aylana uzunligi = 2πr. SAT javoblarida π ko'pincha harf bilan qoldiriladi.",
      "Chizma chizing, berilganlarni belgilang va ma'lumni noma'lum bilan bog'laydigan formulani tanlang.",
    ],
    example: "Katetlar 6 va 8: c² = 36 + 64 = 100, demak c = 10. Radiusi r = 3 bo'lgan doiraning yuzi 9π.",
    practice: [
      { q: "To'g'ri burchakli uchburchakning katetlari 5 va 12. Gipotenuza nimaga teng?", explain: "25 + 144 = 169, demak c = 13." },
      { q: "Doiraning radiusi 4. Uning yuzi kπ ga teng. k nimaga teng?", explain: "Yuz = π·4² = 16π." },
      { q: "To'g'ri burchakli uchburchakning gipotenuzasi 13, bir kateti 5. Ikkinchi kateti nimaga teng?", explain: "b² = 169 − 25 = 144, demak b = 12." },
    ],
  },
};
