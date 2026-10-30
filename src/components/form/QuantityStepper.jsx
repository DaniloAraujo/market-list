import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { MAX_QUANTITY, formatKg, kgToQuarters, quartersToKgText } from '@/utils/quantityUtils';
import { cn } from '@/lib/utils';

const MIN = 1;

const clamp = (n) => Math.min(MAX_QUANTITY, Math.max(MIN, n));

export default function QuantityStepper({ value, onChange, unit = 'un', className, ...props }) {
  const [draft, setDraft] = useState(null);
  const weight = unit === 'kg';

  const step = (delta) => onChange(clamp((Number(value) || MIN) + delta));

  const handleChange = (e) => {
    if (weight) {
      const text = e.target.value.replace(/[^\d.,]/g, '');
      if (/^\d{0,3}([.,]\d{0,2})?$/.test(text)) setDraft(text);
      return;
    }
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
    onChange(digits === '' ? '' : clamp(parseInt(digits, 10)));
  };

  const handleFocus = (e) => {
    if (weight) setDraft(quartersToKgText(Number(value) || MIN));
    e.target.select();
  };

  const handleBlur = () => {
    if (weight) {
      const parsed = parseFloat((draft ?? '').replace(',', '.'));
      if (!Number.isNaN(parsed) && parsed > 0) onChange(kgToQuarters(parsed));
      setDraft(null);
      return;
    }
    if (value === '' || value === null) onChange(MIN);
  };

  const shown = weight ? (draft ?? formatKg(Number(value) || MIN)) : value;

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
        aria-label={weight ? 'Diminuir 250 gramas' : 'Diminuir quantidade'}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        inputMode={weight ? 'decimal' : 'numeric'}
        autoComplete="off"
        value={shown}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="min-w-0 flex-1 bg-transparent text-center text-base tabular-nums focus:outline-none md:text-sm"
        {...props}
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => step(1)}
        disabled={Number(value) >= MAX_QUANTITY}
        aria-label={weight ? 'Aumentar 250 gramas' : 'Aumentar quantidade'}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
