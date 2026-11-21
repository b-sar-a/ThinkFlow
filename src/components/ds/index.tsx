import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import { useTr } from '../../context/LanguageContext';

/**
 * ThinkFlow workspace design system.
 * One radius scale (6 / 8 / 12), one shadow, one type scale, colours only from tokens
 * (see :root in index.css). Used by every screen after sign-in; the landing page and the
 * sign-in modal keep their own look.
 */

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/* ---------- Surfaces ---------- */

export const Panel = ({ as: Tag = "div", className, ...props }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) => (
  <Tag className={cn("rounded-xl border border-line bg-panel shadow-[var(--shadow-1)]", className)} {...props} />
);

/* ---------- Buttons ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'border border-line-strong bg-panel text-fg hover:bg-panel-2',
  ghost: 'text-fg-muted hover:bg-panel-2 hover:text-fg',
  danger: 'border border-line-strong bg-panel text-bad hover:bg-bad-soft',
};
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[15px] sm:h-10 sm:text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export const IconButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(({ label, className, type = 'button', children, ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-panel-2 hover:text-fg sm:size-10',
      className
    )}
    {...props}
  >
    {children}
  </button>
));
IconButton.displayName = 'IconButton';

/* ---------- Forms ---------- */

const CONTROL =
  'w-full rounded-lg border border-line-strong bg-panel px-3 text-[15px] text-fg placeholder:text-fg-muted/70 transition-colors duration-150 hover:border-fg-muted disabled:cursor-not-allowed disabled:opacity-60';

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(CONTROL, 'h-11 sm:h-10', className)} {...props} />
);
TextInput.displayName = 'TextInput';

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(CONTROL, 'min-h-24 resize-y py-2.5', className)} {...props} />
);
TextArea.displayName = 'TextArea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(CONTROL, 'h-11 sm:h-10', className)} {...props} />
);
Select.displayName = 'Select';

/** Visible label above the control; the control sits inside the label so they are linked. */
export const Field = ({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={cn('block', className)}>
    <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
    {children}
    {hint && !error && <span className="mt-1.5 block text-sm text-fg-muted">{hint}</span>}
    {error && (
      <span role="alert" className="mt-1.5 block text-sm text-bad">
        {error}
      </span>
    )}
  </label>
);

export const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-150',
      checked ? 'border-brand bg-brand' : 'border-line-strong bg-panel-2'
    )}
  >
    <span
      className={cn(
        'inline-block size-4 rounded-full transition-transform duration-150',
        checked ? 'translate-x-6 bg-on-brand' : 'translate-x-1 bg-fg-muted'
      )}
    />
  </button>
);

/** A few mutually exclusive choices (language, depth, style). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-0.5 rounded-lg border border-line bg-panel-2 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-10 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors duration-150 sm:min-h-8',
            value === option.value ? 'bg-panel text-fg shadow-[var(--shadow-1)]' : 'text-fg-muted hover:text-fg'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Toggleable chip, used for interests and choices. */
export const Chip = ({
  selected,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      'min-h-10 cursor-pointer rounded-lg border px-3 text-sm font-medium transition-colors duration-150',
      selected
        ? 'border-brand bg-brand-soft text-brand'
        : 'border-line-strong bg-panel text-fg hover:bg-panel-2',
      className
    )}
    {...props}
  />
);

/** Underline tabs (one panel visible at a time). */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px min-h-11 shrink-0 cursor-pointer border-b-2 px-3 text-[15px] font-medium transition-colors duration-150 sm:min-h-10",
            value === tab.id ? "border-brand text-brand" : "border-transparent text-fg-muted hover:text-fg"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Content ---------- */

type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad' | 'hl';
const TONE: Record<Tone, string> = {
  neutral: 'bg-panel-2 text-fg-muted',
  brand: 'bg-brand-soft text-brand',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  hl: 'bg-hl text-on-hl',
};

export const Badge = ({ tone = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) => (
  <span
    className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', TONE[tone], className)}
    {...props}
  />
);

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) => (
  <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px] sm:leading-9">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-[15px] text-fg-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h2 className="text-base font-semibold text-fg">{children}</h2>
    {action}
  </div>
);

export const EmptyState = ({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-dashed border-line-strong bg-panel px-6 py-12 text-center">
    <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-panel-2 text-fg-muted" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-fg">{title}</h3>
    {text && <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">{text}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export const Spinner = ({ label, className }: { label?: string; className?: string }) => {
  const tr = useTr();
  return (
    <div role="status" className={cn('flex items-center justify-center gap-2 py-16 text-sm text-fg-muted', className)}>
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span className={label ? undefined : 'sr-only'}>{label ?? tr('Loading…', 'Загрузка…', 'Yuklanmoqda…')}</span>
    </div>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-panel-2', className)} />
);

export const ProgressBar = ({
  value,
  label,
  tone = 'brand',
  className,
}: {
  value: number;
  label: string;
  tone?: 'brand' | 'hl' | 'ok' | 'bad';
  className?: string;
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = { brand: 'bg-brand', hl: 'bg-hl', ok: 'bg-ok', bad: 'bg-bad' }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('h-2 overflow-hidden rounded-full bg-panel-2', className)}
    >
      <div className={cn('h-full rounded-full', fill)} style={{ width: `${clamped}%` }} />
    </div>
  );
};

/** Inline message. Colour is never the only signal: every tone has an icon. */
export const Notice = ({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'ok' | 'warn' | 'bad';
  children: React.ReactNode;
  className?: string;
}) => {
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'neutral' ? Info : AlertCircle;
  const style = {
    neutral: 'border-line bg-panel-2 text-fg',
    ok: 'border-ok/30 bg-ok-soft text-ok',
    warn: 'border-warn/30 bg-warn-soft text-warn',
    bad: 'border-bad/30 bg-bad-soft text-bad',
  }[tone];
  return (
    <div role={tone === 'bad' || tone === 'warn' ? 'alert' : 'status'} className={cn('flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm', style, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export const Avatar = ({
  name,
  src,
  className,
}: {
  name?: string;
  src?: string;
  className?: string;
}) => (
  <span
    className={cn('inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand', className)}
    aria-hidden="true"
  >
    {src ? <img src={src} alt="" className="size-full object-cover" /> : (name?.trim()?.[0] || 'U').toUpperCase()}
  </span>
);

/* ---------- Overlay ---------- */

export const Modal = ({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const titleId = useId();
  const tr = useTr();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button:not([data-modal-close])')?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/50 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-xl border border-line bg-panel shadow-[var(--shadow-pop)]', className)}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 id={titleId} className="text-base font-semibold text-fg">
            {title}
          </h2>
          <IconButton label={tr('Close', 'Закрыть', 'Yopish')} onClick={onClose} data-modal-close>
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
