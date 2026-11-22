import type { UzOverlay } from '../types';

export const biologyBasicsUz: Record<string, UzOverlay> = {
  cell: {
    teach: [
      "Har bir tirik hujayrada membrana (nima kirishi va chiqishini boshqaradi), sitoplazma (reaksiyalar boradigan muhit) va irsiy material bor. Hayvon va o'simlik hujayralarida irsiy material yadro ichida joylashgan.",
      "Mitoxondriyalar oziq moddalardan energiya ajratadi (hujayra nafasi). Ribosomalar oqsil sintez qiladi. O'simlik hujayralarida bundan tashqari hujayra devori, xloroplastlar (fotosintez) va yirik vakuola bor.",
      "Yorug'lik mikroskopi okulyar va obyektiv kattalashtirishlarining ko'paytmasiga teng marta kattalashtiradi: umumiy kattalashtirish = okulyar × obyektiv.",
    ],
    example: "Okulyar 10× va obyektiv 20×: tasvir 10 × 20 = 200 marta kattalashadi.",
    practice: [
      { q: "Qaysi organoid fotosintezni amalga oshiradi? (bitta so'z)", explain: "Xloroplastlarda xlorofill bor, ular yorug'lik, suv va CO₂ dan shakar hosil qiladi." },
      { q: "Hujayra nafasida qaysi organoid oziqdan energiya ajratadi? (bitta so'z)", explain: "Mitoxondriyalarda nafas olish vaqtida energiya ATF shaklida to'planadi." },
      { q: "Mikroskopning okulyari 10×, obyektivi 40×. U necha marta kattalashtiradi?", explain: "10 × 40 = 400." },
    ],
  },
  division: {
    teach: [
      "Mitoz bitta hujayradan ikkita bir xil hujayra hosil qiladi. Organizm shunday o'sadi va tiklanadi. Hujayra n marta bo'linsa, 2ⁿ ta hujayra hosil bo'ladi.",
      "Odamning tana hujayrasida 46 ta xromosoma (23 juft) bor. Jinsiy hujayralarda (tuxum hujayra va spermatozoid) ikki marta kam, ya'ni 23 ta, shunda urug'langan tuxum hujayrada yana 46 ta bo'ladi.",
      "Meyoz jinsiy hujayralarni hosil qiladi. Bitta hujayra ikki marta bo'linib 4 ta hujayra beradi, ularning har birida xromosomalar soni ikki marta kam.",
    ],
    example: "Bitta hujayra mitoz bilan 4 marta bo'linadi: 2⁴ = 16 ta hujayra.",
    practice: [
      { q: "Bitta hujayra mitoz bilan 3 marta bo'linadi. Oxirida nechta hujayra hosil bo'ladi?", explain: "2³ = 8." },
      { q: "Odamning teri hujayrasida 46 ta xromosoma bor. Bitta tuxum hujayrada nechta xromosoma bor?", explain: "Jinsiy hujayralarda ikki marta kam: 46 / 2 = 23." },
      { q: "Meyozdan keyin bitta hujayradan nechta hujayra hosil bo'ladi?", explain: "Meyozda ketma-ket ikki bo'linish bor: 1 → 2 → 4 ta hujayra." },
    ],
  },
  dna: {
    teach: [
      "DNK nukleotidlarning qo'sh zanjiridir. Har bir nukleotidda to'rtta asosdan biri bor: A (adenin), T (timin), G (guanin), C (sitozin).",
      "Asoslar qat'iy qoida bo'yicha juftlashadi: A bilan T, G bilan C. Shuning uchun DNK da A miqdori T ga, G miqdori C ga teng va A + T + G + C = 100%.",
      "Ketma-ket uchta nukleotid (kodon) bitta aminokislotani kodlaydi. Oqsillar aminokislotalar zanjiridir.",
    ],
    example: "Agar asoslarning 35% i A bo'lsa, T ham 35%. G + C = 100 − 70 = 30%, demak G = 15%.",
    practice: [
      { q: "DNK molekulasida asoslarning 30% i adenin (A). Guanin (G) necha foiz?", explain: "T = 30%, demak G + C = 100 − 60 = 40%, G = 20%." },
      { q: "DNKning bir zanjiri A-T-G-C-C. Komplementar zanjirda nechta G asosi bor?", explain: "Komplementar zanjir T-A-C-G-G, unda 2 ta G bor." },
      { q: "Kodlovchi qismda 300 ta nukleotid bor (start va stop kodonlarni hisobga olmang). U nechta aminokislotani kodlaydi?", explain: "Bitta aminokislota uchun 3 ta nukleotid kerak: 300 / 3 = 100." },
    ],
  },
  genetics: {
    teach: [
      "Genning ikkita alleli bor, har biri bitta ota-onadan. Bosh harf (A) dominant allel, kichik harf (a) retsessiv allel. AA va aa gomozigota, Aa geterozigota.",
      "Dominant allel bitta nusxada bo'lsa ham organizmda namoyon bo'ladi. Retsessiv belgi faqat aa da namoyon bo'ladi.",
      "Aa × Aa chatishtirish AA : Aa : aa = 1 : 2 : 1 beradi, ya'ni 3 qismda dominant belgi, 1 qismda retsessiv belgi (3 : 1). Aa × aa chatishtirish Aa : aa = 1 : 1 beradi.",
    ],
    example: "Ikki geterozigota no'xat o'simligi (Aa × Aa) 80 ta nasl berdi. Ularning taxminan 3/4 qismi, ya'ni 60 tasida dominant belgi bor.",
    practice: [
      { q: "Ikki geterozigota ota-onaning (Aa × Aa) 64 ta zurriyoti bor. Ulardan nechtasida dominant belgi bo'lishi kutiladi?", explain: "64 ning 3/4 qismi = 48." },
      { q: "Aa × aa chatishtirishda zurriyotning necha foizi aa bo'lishi kutiladi?", explain: "Aa : aa = 1 : 1, demak yarmi, 50%." },
      { q: "AA × aa chatishtirishda zurriyotning necha foizi geterozigota (Aa)?", explain: "Har bir zurriyot bir ota-onadan A, ikkinchisidan a oladi: hammasi Aa." },
    ],
  },
};
