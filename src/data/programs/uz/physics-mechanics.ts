import type { UzOverlay } from '../types';

export const physicsMechanicsUz: Record<string, UzOverlay> = {
  'uniform-motion': {
    teach: [
      "Tezlik jismning qanchalik tez harakatlanishini ko'rsatadi: v = s / t, bunda s yo'l, t vaqt. Birligi m/s yoki km/soat.",
      "Tekis harakatda tezlik o'zgarmaydi, shuning uchun yo'l s = v · t, vaqt esa t = s / v.",
      "Birliklarni doim tekshiring. km/soat ni m/s ga o'tkazish uchun 3,6 ga bo'ling.",
    ],
    example: "Velosipedchi 150 m yo'lni 30 s da bosib o'tadi. v = 150 / 30 = 5 m/s. 10 s da u 5 · 10 = 50 m yuradi.",
    practice: [
      { q: "Avtomobil 2 soatda 120 km yo'l yuradi. Uning tezligi necha km/soat?", explain: "v = 120 / 2 = 60 km/soat." },
      { q: "Yuguruvchining tezligi 12 m/s. U 4 s da necha metr yuguradi?", explain: "s = 12 · 4 = 48 m." },
      { q: "15 m/s tezlik bilan 90 m yo'lni necha sekundda bosib o'tish mumkin?", explain: "t = 90 / 15 = 6 s." },
    ],
  },
  acceleration: {
    teach: [
      "Tezlanish tezlik qanchalik tez o'zgarishini ko'rsatadi: a = (v − v₀) / t. Birligi m/s².",
      "Bundan oxirgi tezlik v = v₀ + a · t. Jism sekinlashsa, tezlanish manfiy bo'ladi.",
      "Tinch holatdan boshlagan jism uchun v₀ = 0. To'xtagan jism uchun v = 0.",
    ],
    example: "Avtomobil 5 s da tezligini 0 dan 20 m/s gacha oshiradi. a = (20 − 0) / 5 = 4 m/s².",
    practice: [
      { q: "Jism tinch holatdan a = 3 m/s² tezlanish bilan harakat boshladi. 4 s dan keyin tezligi necha m/s?", explain: "v = 0 + 3 · 4 = 12 m/s." },
      { q: "v₀ = 5 m/s, a = 2 m/s², t = 3 s. v necha m/s?", explain: "v = 5 + 2 · 3 = 11 m/s." },
      { q: "30 m/s tezlik bilan ketayotgan avtomobil a = −6 m/s² bilan tormozlanadi. U necha sekundda to'xtaydi?", explain: "0 = 30 − 6t, demak t = 5 s." },
    ],
  },
  'newton-second-law': {
    teach: [
      "Nyutonning ikkinchi qonuni: F = m · a. Teng ta'sir etuvchi kuch massa bilan tezlanishning ko'paytmasiga teng. Kuch birligi nyuton (N).",
      "Jismning og'irligi unga ta'sir etuvchi og'irlik kuchi: P = m · g. Maktab masalalarida g = 10 m/s² deb olinadi (aniqrog'i 9,8).",
      "Bir xil kuch og'irroq jismga kamroq tezlanish beradi: a = F / m.",
    ],
    example: "Massasi 5 kg bo'lgan jismga 20 N kuch ta'sir qiladi. a = F / m = 20 / 5 = 4 m/s².",
    practice: [
      { q: "m = 3 kg va a = 6 m/s². Kuch necha N?", explain: "F = 3 · 6 = 18 N." },
      { q: "F = 40 N va m = 8 kg. Tezlanish necha m/s²?", explain: "a = 40 / 8 = 5 m/s²." },
      { q: "Massasi 6 kg bo'lgan jismning og'irligi necha N (g = 10 m/s²)?", explain: "P = 6 · 10 = 60 N." },
    ],
  },
  'work-energy': {
    teach: [
      "Kuchning harakat yo'nalishidagi ishi: A = F · s. Birligi joul (J).",
      "Quvvat ish qanchalik tez bajarilishini ko'rsatadi: P = A / t. Birligi vatt (W).",
      "Harakatdagi jism kinetik energiyaga ega: E = m·v² / 2. h balandlikka ko'tarilgan jism potensial energiyaga ega: E = m·g·h.",
    ],
    example: "50 N kuch qutini 4 m siljitadi: A = 50 · 4 = 200 J.",
    practice: [
      { q: "10 s da 500 J ish bajarildi. Quvvat necha vatt?", explain: "P = 500 / 10 = 50 W." },
      { q: "Massasi 2 kg bo'lgan jism 3 m/s tezlik bilan harakatlanyapti. Kinetik energiyasi necha J?", explain: "E = 2 · 3² / 2 = 9 J." },
      { q: "Massasi 5 kg bo'lgan jism 2 m ga ko'tarildi (g = 10 m/s²). U qancha potensial energiya oldi (J)?", explain: "E = 5 · 10 · 2 = 100 J." },
    ],
  },
  momentum: {
    teach: [
      "Impuls massa bilan tezlikning ko'paytmasi: p = m · v. Birligi kg·m/s. Tezlik kabi u ham yo'nalishga ega.",
      "Yopiq sistemada umumiy impuls saqlanadi: to'qnashuvdan oldingi impuls to'qnashuvdan keyingiga teng.",
      "To'qnashgandan keyin jismlar yopishib qolsa, ular umumiy tezlik bilan harakatlanadi: v = (umumiy impuls) / (umumiy massa).",
    ],
    example: "Massasi 2 kg bo'lgan aravacha 3 m/s tezlik bilan harakatlanadi: p = 6 kg·m/s. U tinch turgan 1 kg li aravachaga urilib, yopishib qoladi: v = 6 / 3 = 2 m/s.",
    practice: [
      { q: "Massasi 0,5 kg bo'lgan to'p 8 m/s tezlik bilan harakatlanyapti. Uning impulsi necha kg·m/s?", explain: "p = 0,5 · 8 = 4 kg·m/s." },
      { q: "Massasi 1500 kg bo'lgan avtomobil 20 m/s tezlik bilan ketyapti. Uning impulsi necha kg·m/s?", explain: "p = 1500 · 20 = 30 000 kg·m/s." },
      { q: "5 m/s tezlikdagi 4 kg li aravacha tinch turgan 1 kg li aravachaga urilib, ular yopishib qoladi. Ularning tezligi necha m/s?", explain: "p = 4 · 5 = 20, umumiy massa 5 kg, demak v = 4 m/s." },
    ],
  },
};
