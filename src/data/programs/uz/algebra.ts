import type { UzOverlay } from '../types';

export const algebraUz: Record<string, UzOverlay> = {
  'linear-equations': {
    teach: [
      "Chiziqli tenglamada noma'lum x faqat birinchi darajada qatnashadi, masalan 4x − 9 = 19. Uni yechish x ning shunday qiymatini topish demakki, tenglikning ikkala tomoni teng bo'lsin.",
      "Qoida: ikkala tomonga ham bir xil amalni bajaring. x qatnashmagan sonlarni bir tomonga o'tkazing, so'ng x oldidagi songa bo'ling.",
      "Qavslar bo'lsa, avval ularni oching: a(b + c) = ab + ac. Keyin x li hadlarni bir tomonga yig'ing.",
    ],
    example: "4x − 9 = 19. Ikkala tomonga 9 qo'shamiz: 4x = 28. 4 ga bo'lamiz: x = 7. Tekshirish: 4·7 − 9 = 19. ✓",
    practice: [
      { q: "5x + 3 = 38 tenglamani yeching. x = ?", explain: "5x = 35, demak x = 7." },
      { q: "7 − 2x = 1 tenglamani yeching. x = ?", explain: "−2x = −6, demak x = 3." },
      { q: "3(x + 2) = 2x + 11 tenglamani yeching. x = ?", explain: "3x + 6 = 2x + 11, demak x = 5." },
    ],
  },
  systems: {
    teach: [
      "Sistemada ikkita tenglama va ikkita noma'lum bo'ladi, masalan x + y = 10 va x − y = 2. Ikkala tenglamaga ham mos keladigan x va y kerak.",
      "Qo'shish usuli: tenglamalarni qo'shing yoki ayiring, shunda bitta noma'lum yo'qoladi. O'rniga qo'yish usuli: bitta tenglamadan bir noma'lumni ifodalab, ikkinchisiga qo'ying.",
      "Ikkinchi noma'lum birinchisidan keyin topiladi, tekshirish esa ikkala tenglamada ham bajariladi.",
    ],
    example: "x + y = 10 va x − y = 2. Qo'shamiz: 2x = 12, demak x = 6. Unda y = 10 − 6 = 4. Tekshirish: 6 − 4 = 2. ✓",
    practice: [
      { q: "x + y = 12 va x − y = 4. x = ?", explain: "Qo'shamiz: 2x = 16, demak x = 8 (y = 4)." },
      { q: "2x + y = 11 va x = 3. y = ?", explain: "2·3 + y = 11, demak y = 5." },
      { q: "x + 2y = 14 va x − 2y = −2. y = ?", explain: "Qo'shamiz: 2x = 12, x = 6. Unda 6 + 2y = 14, demak y = 4." },
    ],
  },
  quadratics: {
    teach: [
      "Kvadrat tenglama ax² + bx + c = 0 ko'rinishda bo'ladi, bunda a ≠ 0. D = b² − 4ac diskriminanti uning nechta haqiqiy ildizi borligini ko'rsatadi.",
      "D > 0 bo'lsa, ikkita ildiz bor, D = 0 bo'lsa, bitta, D < 0 bo'lsa, haqiqiy ildiz yo'q.",
      "Ildizlar x = (−b ± √D) / (2a) formula bo'yicha topiladi. Oddiy hollarda ifodani ko'paytuvchilarga ham ajratish mumkin.",
    ],
    example: "x² − 5x + 6 = 0. D = 25 − 24 = 1. x = (5 ± 1) / 2, demak x = 3 yoki x = 2.",
    practice: [
      { q: "x² − 6x + 5 = 0 tenglamaning diskriminantini toping.", explain: "D = 36 − 4·1·5 = 16." },
      { q: "x² − 6x + 5 = 0 tenglamaning katta ildizi nimaga teng?", explain: "x = (6 ± 4) / 2, demak x = 5 yoki x = 1. Kattasi 5." },
      { q: "x² + 2x + 5 = 0 tenglamaning nechta haqiqiy ildizi bor?", explain: "D = 4 − 20 = −16 < 0, demak ildiz yo'q." },
    ],
  },
  'linear-functions': {
    teach: [
      "Chiziqli funksiya y = kx + b ko'rinishda bo'ladi. Uning grafigi to'g'ri chiziq. k soni burchak koeffitsiyenti, b esa chiziqning y o'qini kesib o'tadigan nuqtasi.",
      "Ikki nuqta (x₁, y₁) va (x₂, y₂) bo'yicha burchak koeffitsiyenti: k = (y₂ − y₁) / (x₂ − x₁). k > 0 bo'lsa chiziq yuqoriga, k < 0 bo'lsa pastga yo'naladi.",
      "Chiziqning x o'qi bilan kesishishini topish uchun y = 0 qo'yib, tenglamani yeching.",
    ],
    example: "To'g'ri chiziq (0, 2) va (2, 6) nuqtalardan o'tadi. k = (6 − 2) / (2 − 0) = 2, b = 2, demak y = 2x + 2.",
    practice: [
      { q: "(1, 3) va (3, 11) nuqtalardan o'tuvchi chiziqning burchak koeffitsiyentini toping.", explain: "k = (11 − 3) / (3 − 1) = 4." },
      { q: "y = −x + 5 uchun x = 2 bo'lganda y ni toping.", explain: "y = −2 + 5 = 3." },
      { q: "y = 3x − 6 chiziq x o'qini qayerda kesadi? x ni toping.", explain: "0 = 3x − 6, demak x = 2." },
    ],
  },
};
