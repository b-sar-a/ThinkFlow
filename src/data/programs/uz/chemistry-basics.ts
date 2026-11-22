import type { UzOverlay } from '../types';

export const chemistryBasicsUz: Record<string, UzOverlay> = {
  atoms: {
    teach: [
      "Atomda proton (musbat zaryadli) va neytronlardan (zaryadsiz) iborat yadro bor, uning atrofida esa elektronlar (manfiy zaryadli) harakatlanadi. Neytral atomda elektronlar soni protonlar soniga teng.",
      "Tartib raqami Z protonlar sonini bildiradi. U elementni va uning davriy jadvaldagi o'rnini belgilaydi. Massa soni A proton va neytronlar yig'indisi, shuning uchun neytronlar soni A − Z ga teng.",
      "Davriy jadvalning bir guruhidagi (ustundagi) elementlarning tashqi elektronlari soni bir xil, shu sababli ular o'xshash reaksiyaga kirishadi.",
    ],
    example: "Natriyning (Na) Z = 11 va A = 23. Unda 11 ta proton, 11 ta elektron (neytral atomda) va 23 − 11 = 12 ta neytron bor.",
    practice: [
      { q: "Xlorning tartib raqami 17. Neytral xlor atomida nechta elektron bor?", explain: "Neytral atomda elektronlar soni protonlar soniga teng: Z = 17." },
      { q: "Atomning Z = 8 va A = 16. Unda nechta neytron bor?", explain: "Neytronlar A − Z = 16 − 8 = 8 ta." },
      { q: "Uglerod-14 da 6 ta proton bor. Unda nechta neytron bor?", explain: "Massa soni 14, demak neytronlar 14 − 6 = 8 ta." },
    ],
  },
  moles: {
    teach: [
      "Moddaning molyar massasi M bir mol moddaning massasi, birligi g/mol. Molekula uchun atom massalarini qo'shing: H₂O = 2·1 + 16 = 18 g/mol.",
      "Modda miqdori n (mol), massa m va molyar massa M o'zaro bog'liq: n = m / M va m = n · M.",
      "Davriy jadvaldan yaxlitlangan atom massalarini oling: H = 1, C = 12, N = 14, O = 16, Na = 23, Cl = 35,5, Ca = 40.",
    ],
    example: "CO₂: M = 12 + 2·16 = 44 g/mol. 88 g CO₂ bu 88 / 44 = 2 mol.",
    practice: [
      { q: "NaCl ning molyar massasi necha g/mol? (Na = 23, Cl = 35,5, javobni son bilan yozing)", explain: "M = 23 + 35,5 = 58,5 g/mol." },
      { q: "36 g suvda necha mol bor? (M = 18 g/mol)", explain: "n = 36 / 18 = 2 mol." },
      { q: "0,5 mol CaCO₃ ning massasi necha gramm? (Ca = 40, C = 12, O = 16)", explain: "M = 40 + 12 + 3·16 = 100 g/mol, demak m = 0,5 · 100 = 50 g." },
    ],
  },
  equations: {
    teach: [
      "Kimyoviy reaksiya tenglamasida har bir elementning atomlari soni chap va o'ng tomonda teng bo'lishi kerak: atomlar yo'qdan paydo bo'lmaydi va yo'qolmaydi.",
      "Tenglashtirish uchun koeffitsiyentlarni (formulalar oldidagi sonlarni) o'zgartiring, formula ichidagi kichik sonlarni esa hech qachon.",
      "Har bir elementning atomlarini sanang, eng kam formulada uchraydigan elementdan boshlang va oxirida barcha elementlarni tekshiring.",
    ],
    example: "H₂ + O₂ → H₂O. Kislorod: chapda 2 ta atom, o'ngda 1 ta, shuning uchun H₂O oldiga 2 qo'yamiz: H₂ + O₂ → 2H₂O. Endi vodorod: o'ngda 4 ta, demak 2H₂ + O₂ → 2H₂O. Tekshirish: H 4 = 4, O 2 = 2. ✓",
    practice: [
      { q: "2H₂ + O₂ → ?H₂O tenglamani tenglashtiring. H₂O oldidagi koeffitsiyent nechta?", explain: "Chapdagi 4 ta vodorod atomi 2 ta H₂O molekulasini beradi (har birida 2 tadan H)." },
      { q: "N₂ + ?H₂ → 2NH₃ tenglamani tenglashtiring. H₂ oldidagi koeffitsiyent nechta?", explain: "2NH₃ da 6 ta vodorod atomi bor, demak 3H₂ kerak." },
      { q: "?Mg + O₂ → ?MgO tenglamani tenglashtiring. MgO oldidagi koeffitsiyent nechta?", explain: "O₂ da ikkita kislorod atomi bor, demak 2MgO kerak, unda 2Mg ham kerak: 2Mg + O₂ → 2MgO." },
    ],
  },
  solutions: {
    teach: [
      "Eritma erituvchida (masalan, suvda) erigan moddadan (masalan, tuzdan) iborat. Eritma massasi = erigan modda massasi + erituvchi massasi.",
      "Massa ulushi: ω = m(modda) / m(eritma) × 100%.",
      "Shu formuladan erigan modda massasini ham topish mumkin: m(modda) = ω × m(eritma) / 100.",
    ],
    example: "180 g suvda 20 g tuz eritildi: eritma 200 g, demak ω = 20 / 200 × 100 = 10%.",
    practice: [
      { q: "80 g suvda 20 g shakar eritildi. Shakarning massa ulushi necha foiz?", explain: "Eritma 20 + 80 = 100 g, demak ω = 20 / 100 × 100 = 20%." },
      { q: "250 g 8% li eritmada necha gramm tuz bor?", explain: "m = 8 × 250 / 100 = 20 g." },
      { q: "200 g eritmada 50 g tuz bor. Massa ulushi necha foiz?", explain: "ω = 50 / 200 × 100 = 25%." },
    ],
  },
};
