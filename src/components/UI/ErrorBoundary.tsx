import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const COPY = {
  ru: { title: 'Что-то пошло не так', text: 'Страница не загрузилась. Обнови её — обычно этого достаточно.', button: 'Обновить страницу' },
  uz: { title: 'Nimadir xato ketdi', text: 'Sahifa yuklanmadi. Uni yangilang — odatda shu yetarli.', button: 'Sahifani yangilash' },
  en: { title: 'Something went wrong', text: 'The page did not load. Reloading it usually fixes this.', button: 'Reload page' },
};

const readLanguage = (): keyof typeof COPY => {
  try {
    const saved = localStorage.getItem('tf_lang');
    if (saved === 'ru' || saved === 'uz' || saved === 'en') return saved;
  } catch { /* storage blocked */ }
  return 'ru';
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (!this.state.hasError) return this.props.children;
    const copy = COPY[readLanguage()];
    return (
      <div className="app-shell flex min-h-dvh items-center justify-center p-6">
        <div role="alert" className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-[var(--shadow-1)]">
          <h1 className="text-xl font-semibold text-fg">{copy.title}</h1>
          <p className="mt-2 text-[15px] text-fg-muted">{copy.text}</p>
          <details className="mt-4 text-sm text-fg-muted">
            <summary className="cursor-pointer">Details</summary>
            <code className="mt-2 block overflow-auto rounded-lg bg-panel-2 p-3 text-xs">{this.state.error?.toString()}</code>
          </details>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-11 w-full cursor-pointer rounded-lg bg-brand text-[15px] font-medium text-on-brand transition-colors duration-150 hover:bg-brand-hover"
          >
            {copy.button}
          </button>
        </div>
      </div>
    );
  }
}
