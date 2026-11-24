/** Uzbek full text of the articles (titles and summaries are in articles.ts). Keyed by article id. */
export interface ArticleUzBody {
  body: string[];
  tryIt: { question: string; answer: string };
}

export const ARTICLES_UZ: Record<string, ArticleUzBody> = {
  'physics-momentum': {
    body: [
      "Impuls bu massa va tezlikning ko'paytmasi: p = m·v. Og'ir va tez jismda impuls katta, yengil va sekin jismda kichik bo'ladi.",
      "Jismning impulsini o'zgartirish uchun kuch impulsi kerak: kuchning ta'sir qilish vaqtiga ko'paytmasi, J = F·Δt. U jism impulsining o'zgarishiga teng: F·Δt = Δp.",
      "Futbolchilar zarbani shuning uchun davom ettiradi. Oyoq to'p bilan qancha uzoq tegib tursa, Δt shuncha katta bo'ladi, demak to'p ko'proq impuls oladi va kuch bir xil bo'lsa ham tezroq uchib chiqadi.",
      "Tashqi kuchlar ta'sir qilmaydigan yopiq sistemada to'qnashuvdan oldingi umumiy impuls to'qnashuvdan keyingi umumiy impulsga teng. Bu impulsning saqlanish qonuni: u o'q otilgandagi orqaga tepishni ham, bilyard zarbasini ham tushuntiradi.",
    ],
    tryIt: {
      question: "Massasi 0,4 kg bo'lgan to'p tinch turgan edi va zarbadan keyin 20 m/s tezlik bilan uchdi. U qanday impuls oldi? Agar tegib turish 0,01 s davom etgan bo'lsa, o'rtacha kuch qancha?",
      answer: "Δp = m·v = 0,4 × 20 = 8 N·s. F = Δp / Δt = 8 / 0,01 = 800 N.",
    },
  },
  'algebra-solving-x': {
    body: [
      "Tenglama bu muvozanatdagi tarozi. Bir tomonga nima qilsangiz, ikkinchi tomonga ham shuni qilishingiz kerak, aks holda muvozanat buziladi.",
      "Maqsad x ni yolg'iz qoldirish. Amallarni teskari tartibda bekor qilamiz: avval qo'shilgan yoki ayirilganni, keyin ko'paytirilgan yoki bo'lingan narsani olib tashlaymiz.",
      "Misol: 3x + 5 = 20. Ikkala tomondan 5 ni ayiramiz: 3x = 15. Ikkala tomonni 3 ga bo'lamiz: x = 5.",
      "Har doim tekshiring: javobni joyiga qo'ying, 3·5 + 5 = 20. Ikkala tomon mos kelsa, javob to'g'ri. Tekshirish o'n soniya oladi va xatolarning ko'pini topadi.",
    ],
    tryIt: {
      question: "2x − 7 = 11 tenglamani yeching va javobni tekshiring.",
      answer: "Ikkala tomonga 7 ni qo'shamiz: 2x = 18. 2 ga bo'lamiz: x = 9. Tekshirish: 2·9 − 7 = 11. ✓",
    },
  },
  'english-peel': {
    body: [
      "Ishonarli paragrafning vazifasi bitta: bitta fikrni ilgari surish va uni isbotlash. PEEL unga to'rt qism beradi.",
      "Point (fikr): da'voingizni bitta aniq gap bilan ayting. Evidence (dalil): fakt, son yoki misol keltiring. Explanation (izoh): bu dalil fikringizni nega isbotlashini tushuntiring. Link (bog'lanish): xulosani savolga bog'lang yoki keyingi paragrafga o'ting.",
      "Eng keng tarqalgan xato Explanation ni tashlab ketish. Dalil o'z-o'zidan hech narsani isbotlamaydi: o'quvchi u nimani ko'rsatishini siz aytishingizni kutadi.",
      "Bog'lovchi so'zlar mantiqni ko'rinadigan qiladi: because, for example, this shows that, as a result, therefore.",
    ],
    tryIt: {
      question: "Mana bu mavzuda to'rt gapdan iborat PEEL paragrafini yozing: \"School should start later in the morning.\"",
      answer: "Point: School should start later because teenagers need more sleep. Evidence: Studies of sleep in teenagers suggest that they naturally fall asleep and wake later than younger children. Explanation: This means an early start leaves many students tired during the first lessons, when they learn less. Link: Therefore a later start would help students concentrate and perform better.",
    },
  },
  'biology-central-dogma': {
    body: [
      "DNK hujayraning ko'rsatmalarini saqlaydi. U to'rtta harf bilan yoziladi: A, T, C va G. Gen bu bitta oqsil retseptini saqlaydigan DNK qismi.",
      "1-qadam, transkripsiya: hujayra genni xabarchi molekulaga, mRNKga ko'chiradi. RNKda T o'rniga U bor, shuning uchun A bilan U, C bilan G juftlashadi.",
      "2-qadam, translyatsiya: ribosoma mRNKni uchta harfdan o'qiydi. Har bir uchlik, ya'ni kodon, bitta aminokislotani bildiradi. Ribosoma aminokislotalarni tartib bilan ulaydi va zanjir oqsilga aylanib buklanadi.",
      "AUG bu start kodon. Oqsillar organizmda ish bajaradi: to'qimalarni quradi, kislorodni tashiydi, reaksiyalarni tezlashtiradi. DNKda bitta harf o'zgarsa, oqsil o'zgarishi mumkin, ba'zi irsiy kasalliklar shunday paydo bo'ladi.",
    ],
    tryIt: {
      question: "DNKning matritsa zanjiri TAC CCG deb o'qiladi. mRNK qanday va birinchi kodon nima qiladi?",
      answer: "Har bir asosni juftlaymiz: T→A, A→U, C→G, demak TAC → AUG; C→G, C→G, G→C, demak CCG → GGC. mRNK: AUG GGC. Birinchi kodon AUG start kodon.",
    },
  },
  'chemistry-bonds': {
    body: [
      "Atomlar tashqi elektron qavatini to'ldirish uchun bog'lanadi. Buni uch usulda qilish mumkin.",
      "Ion bog'lanish: bir atom elektronlarini boshqasiga beradi. Odatda bu metall va metallmas orasida bo'ladi, masalan osh tuzidagi Na va Cl. Atomlar qarama-qarshi zaryadli ionlarga aylanib, bir-birini tortadi.",
      "Kovalent bog'lanish: atomlar elektronlarni birga ishlatadi. Bu metallmaslar orasida bo'ladi, masalan suvdagi vodorod va kislorod. Metall bog'lanish: metall atomlari elektronlarni umumiy \"dengizga\" beradi, shuning uchun metallar tokni o'tkazadi.",
      "Tez sinov: elementlarga qarang. Metall va metallmas: ehtimol ion. Ikkita metallmas: kovalent. Faqat metallar: metall bog'lanish.",
    ],
    tryIt: {
      question: "MgO ni qanday bog'lanish ushlab turadi va qaysi atom elektron beradi? CO₂ da-chi?",
      answer: "MgO ion bog'lanishli: magniy (metall) kislorodga ikkita elektron beradi, Mg²⁺ va O²⁻ hosil bo'ladi. CO₂ kovalent: uglerod va kislorod ikkalasi metallmas va elektronlarni birga ishlatadi.",
    },
  },
  'history-cause-chain': {
    body: [
      "Sanalarni unutish oson. Sabab va oqibat zanjirlarini esa unutmaysiz. Har qanday voqea haqida to'rtta savol bering: nima o'zgardi, nega aynan o'sha paytda, kim yutdi yoki yutqazdi, keyin nima bo'ldi.",
      "Sanoat inqilobini olaylik, u XVIII asrning ikkinchi yarmida Britaniyada boshlangan. Yangi mashinalar va takomillashtirilgan bug' mashinasi ishni uylardan fabrikalarga ko'chirdi.",
      "Bu o'zgarishning oqibatlari bo'ldi. Odamlar fabrikalarda ishlash uchun shaharlarga ko'chdi. Shaharlar tez o'sdi va gavjum bo'ldi. Ishchilar, shu jumladan bolalar, uzoq soat va xavfli sharoitda ishladi.",
      "Bunday sharoit islohotlarga olib keldi. Britaniyada 1833 yilgi Fabrika akti kabi qonunlar bolalar mehnatini cheklay boshladi. Bitta yangi texnologiya iqtisodiy, ijtimoiy va siyosiy oqibatlar keltirdi, aynan shu tartibda.",
    ],
    tryIt: {
      question: "Har kuni foydalanadigan texnologiyani tanlang, masalan smartfonni, va uchta oqibatdan zanjir tuzing: iqtisodiy, ijtimoiy, siyosiy.",
      answer: "Yagona to'g'ri javob yo'q. Namuna: iqtisodiy: ilova ishlab chiqish kabi butun yangi sohalar paydo bo'ldi. Ijtimoiy: odamlar masofadan muloqot qiladi va internetda ko'proq vaqt o'tkazadi. Siyosiy: hukumatlar ma'lumotlar va onlayn kontentni qanday tartibga solish haqida bahslashadi.",
    },
  },
};
