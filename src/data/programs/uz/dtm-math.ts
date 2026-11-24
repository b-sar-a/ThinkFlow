import type { UzOverlay } from '../types';

export const dtmMathUz: Record<string, UzOverlay> = {
  percent: {
    teach: [
      "N sonining p% i bu N · p / 100. N ni p% ga oshirish uchun uni (1 + p/100) ga ko'paytiring; p% ga kamaytirish uchun (1 − p/100) ga ko'paytiring.",
      "Foizdagi o'zgarish: (yangi − eski) / eski × 100%. Doim eski qiymatga bo'ling.",
      "a / b = c / d proporsiya a · d = b · c degani. Bir miqdor boshqasi bilan bir xil nisbatda o'sganda qo'llanadi, masalan narx va buyumlar soni.",
    ],
    example: "80 000 narx 25% ga arzonlashtirildi: 80 000 × 0,75 = 60 000.",
    practice: [
      { q: "240 ning 15% i nechaga teng?", explain: "240 × 15 / 100 = 36." },
      { q: "Narx 50 dan 65 gacha oshdi. U necha foizga oshdi?", explain: "(65 − 50) / 50 × 100% = 30%. Eski narxga, ya'ni 50 ga bo'lamiz." },
      { q: "8 ta daftar 36 000 turadi. Xuddi shunday 5 ta daftar qancha turadi?", explain: "Bitta daftar 36 000 / 8 = 4 500 turadi, demak 5 tasi 22 500." },
    ],
  },
  equations: {
    teach: [
      "a x² + b x + c = 0 uchun diskriminant D = b² − 4ac. D > 0 bo'lsa ikkita ildiz, D = 0 bo'lsa bitta, D < 0 bo'lsa ildiz yo'q.",
      "Viyet teoremasi: ildizlar yig'indisi −b / a ga, ko'paytmasi c / a ga teng. Tenglamani yechmasdan yig'indi va ko'paytmani topish mumkin.",
      "Chiziqli tengsizlik tenglama kabi yechiladi, lekin manfiy songa ko'paytirilganda yoki bo'linganda belgi teskarisiga o'zgaradi.",
    ],
    example: "x² − 5x + 6 = 0: D = 25 − 24 = 1, ildizlar (5 ± 1) / 2, ya'ni 2 va 3. Tekshirish: 2 + 3 = 5 va 2 · 3 = 6.",
    practice: [
      { q: "x² − 7x + 10 = 0 tenglama ildizlarining yig'indisi nimaga teng?", explain: "Viyet teoremasiga ko'ra yig'indi −b / a = 7. (Ildizlar 2 va 5.)" },
      { q: "3x − 4 > 11 tengsizlikni qanoatlantiradigan eng kichik butun x qanday?", explain: "3x > 15, demak x > 5. 5 dan katta eng kichik butun son 6." },
      { q: "2x² + 3x − 5 = 0 tenglamaning diskriminanti nimaga teng?", explain: "D = 3² − 4 · 2 · (−5) = 9 + 40 = 49." },
    ],
  },
  progressions: {
    teach: [
      "Arifmetik progressiya: har bir had bir xil d qo'shish bilan hosil bo'ladi. n-had a₁ + (n − 1)d, dastlabki n ta hadning yig'indisi n (a₁ + aₙ) / 2.",
      "Geometrik progressiya: har bir had bir xil q ga ko'paytiriladi. n-had b₁ · q^(n−1).",
      "Ularni ajratish uchun oraliqlarga qarang: bir xil ayirma arifmetik, bir xil nisbat geometrik progressiya.",
    ],
    example: "3, 7, 11, … da d = 4, demak 10-had 3 + 9 · 4 = 39.",
    practice: [
      { q: "Arifmetik progressiyada a₁ = 5 va d = 3. 8-had nimaga teng?", explain: "a₈ = 5 + 7 · 3 = 26." },
      { q: "1 + 2 + 3 + … + 20 yig'indi nimaga teng?", explain: "S = 20 · (1 + 20) / 2 = 210." },
      { q: "Geometrik progressiyada b₁ = 2 va q = 3. 5-had nimaga teng?", explain: "b₅ = 2 · 3⁴ = 2 · 81 = 162." },
    ],
  },
  geometry: {
    teach: [
      "To'g'ri burchakli uchburchak: Pifagor teoremasiga ko'ra c² = a² + b², bunda c gipotenuza. Uchburchak yuzi asos va balandlik ko'paytmasining yarmi.",
      "Doira: aylana uzunligi 2πr, yuzi πr². To'g'ri to'rtburchak: yuzi a · b.",
      "Jismlar: to'g'ri burchakli parallelepipedning hajmi a · b · c, silindrniki π r² h.",
    ],
    example: "Katetlari 6 va 8 bo'lgan to'g'ri burchakli uchburchakning gipotenuzasi √(36 + 64) = 10.",
    practice: [
      { q: "To'g'ri burchakli uchburchakning katetlari 5 va 12. Gipotenuza nimaga teng?", explain: "√(25 + 144) = √169 = 13." },
      { q: "Uchburchakning asosi 10, balandligi 7. Uning yuzi nimaga teng?", explain: "Yuz = 10 · 7 / 2 = 35." },
      { q: "Tomonlari 2, 3 va 4 bo'lgan to'g'ri burchakli parallelepipedning hajmi nimaga teng?", explain: "V = 2 · 3 · 4 = 24." },
    ],
  },
};
