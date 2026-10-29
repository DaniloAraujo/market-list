import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN = 1;
const MAX = 999;

const clamp = (n) => Math.min(MAX, Math.max(MIN, n));

/** Seletor de quantidade com botões -/+ e digitação direta. `value` é um número. */
export default function QuantityStepper({ value, onChange, className, ...props }) {
  const step = (delta) => onChange(clamp((Number(value) || MIN) + delta));

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
    onChange(digits === '' ? '' : clamp(parseInt(digits, 10)));
  };

  const handleBlur = () => {
    if (value === '' || value === null) onChange(MIN);
  };

  const buttonClass =
    'grid h-full w-9 shrink-0 place-content-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:bg-muted';

  return (
    <div
      className={cn(
        'flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-input bg-card transition-colors focus-within:border-foreground/50 focus-within:ring-2 focus-within:ring-ring/20',
        className
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => step(-1)}
        disabled={Number(value) <= MIN}
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 bg-transparent text-center text-base tabular-nums focus:outline-none md:text-sm"
        {...props}
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => step(1)}
        disabled={Number(value) >= MAX}
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
