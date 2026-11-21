
import React from 'react';
import { Atom, BookOpen, Calculator, Dna, FlaskConical, Landmark, PenTool } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_ARTICLES } from '../../constants';
import { Badge, PageHeader, Panel } from '../ds';

export const Articles: React.FC = () => {
  const { t, language } = useLanguage();

  const translatedArticles = INITIAL_ARTICLES.map(article => {
    if (language === 'ru') {
      const ruArticles: Record<string, any> = {
        'p1': { title: 'Импульс в спорте', content: 'Физика — это не только книги. Когда игрок бьет по мячу, закон сохранения импульса — это то, что заставляет его лететь...', author: 'Д-р Ньютон' },
        'a1': { title: 'Алгоритм жизни', content: 'Переменные — это пустые слоты, ждущие цели. Решить уравнение X — значит решить неизвестное в вашем будущем...', author: 'Аль-Хорезми' },
        'e1': { title: 'Убедительные потоки', content: 'В английском языке поток — это всё. Дело не в словах, а в ритме логики...', author: 'Шекспир' },
        'b1': { title: 'Логика клеток', content: 'Каждая клетка в вашем теле — это крошечный компьютер, выполняющий инструкции. Понимание биологии — это понимание совершенного ПО...', author: 'Дарвин' },
        'c1': { title: 'Атомные связи', content: 'Химия — это изучение отношений. То, как атомы выбирают связь или отталкивание, является основой всего, к чему мы прикасаемся...', author: 'Кюри' },
        'h1': { title: 'Паттерны времени', content: 'История не повторяется, но она рифмуется. Распознавание паттернов прошлого позволяет нам предсказывать потоки будущего...', author: 'Геродот' }
      };
      return { ...article, ...ruArticles[article.id] };
    }
    if (language === 'uz') {
      const uzArticles: Record<string, any> = {
        'p1': { title: 'Sportda impuls', content: 'Fizika faqat kitoblarda emas. O\'yinchi to\'pni tepganida, impulsning saqlanish qonuni uni parvoz qildiradi...', author: 'Doktor Nyuton' },
        'a1': { title: 'Hayot algoritmi', content: 'O\'zgaruvchilar - bu maqsadni kutayotgan bo\'sh joylar. X ni topish - kelajagingizdagi noma\'lumni topishdir...', author: 'Al-Xorazmiy' },
        'e1': { title: 'Ishonarli oqimlar', content: 'Ingliz tilida oqim hamma narsadir. Gap so\'zlarda emas, mantiq ritmida...', author: 'Shekspir' },
        'b1': { title: 'Hujayralar mantig\'i', content: 'Tanangizdagi har bir hujayra ko\'rsatmalarni bajaradigan kichik kompyuterdir. Biologiyani tushunish - bu eng mukammal dasturiy ta\'minotni tushunishdir...', author: 'Darvin' },
        'c1': { title: 'Atom aloqalari', content: 'Kimyo - bu munosabatlarni o\'rganishdir. Atomlar qanday qilib bog\'lanishni yoki itarishni tanlashi biz tegadigan hamma narsaning asosidir...', author: 'Kyuri' },
        'h1': { title: 'Vaqt naqshlari', content: 'Tarix takrorlanmaydi, lekin u qofiyalanadi. O\'tmish naqshlarini tan olish bizga kelajak oqimlarini bashorat qilish imkonini beradi...', author: 'Gerodot' }
      };
      return { ...article, ...uzArticles[article.id] };
    }
    return article;
  });

  const icon = (subject: string) => {
    switch (subject) {
      case "Physics": return Atom;
      case "Algebra": return Calculator;
      case "English": return PenTool;
      case "Biology": return Dna;
      case "Chemistry": return FlaskConical;
      case "History": return Landmark;
      default: return BookOpen;
    }
  };

  return (
    <>
      <PageHeader title={t.articles} description={t.articlesSub} />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {translatedArticles.map((article) => {
          const Icon = icon(article.subject);
          return (
            <li key={article.id}>
              <Panel as="article" className="flex h-full flex-col p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>
                  <Badge>{article.subject}</Badge>
                </div>
                <h2 className="text-lg font-semibold leading-snug text-fg">{article.title}</h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-fg-muted">{article.content}</p>
                <p className="mt-4 text-sm text-fg-muted">{article.author}</p>
              </Panel>
            </li>
          );
        })}
      </ul>
    </>
  );
};
