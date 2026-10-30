import { UNITS } from '@/utils/quantityUtils';
import { cn } from '@/lib/utils';

export default function UnitToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Unidade de medida" className="inline-flex rounded-md bg-muted p-0.5">
      {UNITS.map((unit) => (
        <button
          key={unit.value}
          type="button"
          role="radio"
          aria-checked={value === unit.value}
          aria-label={unit.name}
          title={unit.name}
          onClick={() => onChange(unit.value)}
          className={cn(
            'h-5 min-w-8 rounded px-1.5 text-[11px] font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            value === unit.value && 'bg-card text-foreground'
          )}
        >
          {unit.label}
        </button>
      ))}
    </div>
  );
}
