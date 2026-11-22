import type { UzOverlay } from '../types';

export const ieltsWritingUz: Record<string, UzOverlay> = {
  'know-the-task': {
    teach: [
      "Task 2 kamida 250 so'zli esse. Unga taxminan 40 daqiqa ajratish tavsiya etiladi. Writing bahosida u Task 1 dan ko'proq ahamiyatga ega.",
      "Ekzaminatorlar to'rt mezon bo'yicha baholaydi: Task Response (savolga to'liq javob berasizmi), Coherence and Cohesion (tuzilma va bog'lanish), Lexical Resource (lug'at) va Grammatical Range and Accuracy (grammatika).",
      "Avvalo savolni diqqat bilan o'qing va turini aniqlang: rozi yoki rozi emas, ikki fikrni muhokama qilish, afzallik va kamchiliklar, muammo va yechimlar. Har bir tur uchun reja boshqacha bo'ladi.",
    ],
    example: "\"Some people think homework should be banned. Discuss both views and give your opinion.\" Bu «ikki fikrni muhokama qiling va o'z fikringizni bildiring» turidagi savol: ikkala fikrni ham yoritish VA o'z fikringizni aytish kerak.",
    practice: [
      { q: "Task 2 uchun eng kam so'z soni nechta?", explain: "Kamida 250 ta so'z." },
      { q: "Task 2 uchun taxminan necha daqiqa ajratish tavsiya etiladi?", explain: "Taxminan 40 daqiqa." },
      { q: "Savol turini ayting: \"Do the advantages of working from home outweigh the disadvantages?\"", explain: "Afzallik va kamchiliklar, baho bilan: ikkala tomonni tortib ko'rib, qaysi biri kuchliroq ekanini aytish kerak." },
    ],
  },
  'plan-and-introduction': {
    teach: [
      "Rejaga taxminan 5 daqiqa ajrating. O'z pozitsiyangizni bitta gapda va ikki-uchta asosiy fikrni yozing, har birining sababi yoki misoli bo'lsin.",
      "Yaxshi kirish ikki qismdan iborat: savolni o'z so'zlaringiz bilan qayta ifodalang (paraphrase), so'ng pozitsiyangizni (tezis) bildiring. Ikki gap yetarli.",
      "Savolni so'zma-so'z ko'chirmang. Asosiy so'zlarni sinonimlar bilan almashtiring va gap tuzilishini o'zgartiring.",
    ],
    example: "Savol: \"Many people believe that children spend too much time on screens.\" Kirish: \"A lot of people think that young people use electronic devices too much. I largely agree, because screens harm sleep and reduce time for real activities.\"",
    practice: [
      { q: "Quyidagi mavzu uchun kirish yozing (ikki gap): \"Some people think that university education should be free for everyone.\" Keyin namuna bilan solishtiring.", explain: "Namuna: \"It is sometimes argued that governments should pay for all students' university studies. I partly agree, as free education widens access, but there are important limits to this idea.\" Tekshiring: savolni qayta ifodaladingizmi va pozitsiyangiz aniqmi?" },
      { q: "Gapni qayta ifodalang: \"Technology has made our lives easier.\"", explain: "Namuna: \"Modern devices have simplified daily life.\" Sinonimlar va yangi tuzilma, ma'no esa o'sha-o'sha." },
    ],
  },
  'body-paragraphs': {
    teach: [
      "Har bir asosiy abzats bitta asosiy fikrni rivojlantiradi. Ishonchli tuzilma PEEL: Point (fikr), Evidence yoki Example (misol), Explanation (izoh), Link (bog'lanish).",
      "Aniq mavzu gapi (fikr) bilan boshlang. Uni umumiy gap bilan emas, aniq misol bilan quvvatlang. Keyin misol fikringizni nega isbotlashini tushuntiring.",
      "Savolga bog'lab tugating. 250 so'zli esse uchun odatiy reja: har biri 90–100 so'zli ikkita asosiy abzats.",
    ],
    example: "Point: Screens harm sleep. Example: Many teenagers scroll in bed, so they fall asleep later. Explanation: Less sleep means poorer concentration at school. Link: This is one reason why limiting screen time is justified.",
    practice: [
      { q: "PEEL dagi har bir harf nimani anglatadi?", explain: "Point (fikr), Evidence yoki Example (misol), Explanation (izoh), Link (bog'lanish)." },
      { q: "Fikr: \"Public transport reduces traffic.\" Bitta aniq misol gap yozing.", explain: "Namuna: \"For instance, one metro train can carry as many passengers as several hundred cars.\" Tekshiring: misol aniqmi va fikrni quvvatlayaptimi?" },
    ],
  },
  'linking-and-checking': {
    teach: [
      "Bog'lovchi so'zlar mantiqni ko'rsatadi: because, as a result, therefore (sabab va natija); however, although, on the other hand (qarama-qarshilik); for example, for instance (misollar); firstly, in addition, finally (tartib).",
      "Ularni ortiqcha ishlatmang. Har bir fikrga bitta to'g'ri bog'lovchi beshta ketma-ket bog'lovchidan yaxshi.",
      "Oxirida 3–5 daqiqani tekshirishga qoldiring: ega va kesim moslashuvi, artikllar (a, an, the), ko'plik -s, zamonlar, imlo va 250 so'zga yetganingiz.",
    ],
    example: "Xato: \"Many students is using phones in class.\" To'g'ri: \"Many students use phones in class.\" Xato: \"Because it is useful, but it is also dangerous.\" To'g'ri: \"Although it is useful, it is also dangerous.\"",
    practice: [
      { q: "Gapni to'g'rilang: \"Nowadays, many students is using phones.\"", explain: "\"Nowadays, many students are using phones.\" (yoki \"use phones\"). Ko'plikdagi ega ko'plikdagi fe'lni talab qiladi." },
      { q: "Qaysi bog'lovchi mos keladi: \"Cars are fast. ___, they pollute the air.\" (However / Therefore)", explain: "However: bog'lovchi afzallikni kamchilikka qarshi qo'yadi." },
    ],
  },
};
