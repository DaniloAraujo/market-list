import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/currencyUtils';
import { cn } from '@/lib/utils';

/**
 * Campo de valor em reais com máscara de centavos (digita 1250 -> 12,50).
 * `value` e `onChange` trabalham com a string de dígitos em centavos.
 */
const CurrencyInput = forwardRef(({ value, onChange, className, ...props }, ref) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
      R$
    </span>
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      placeholder="0,00"
      maxLength={14}
      className={cn('pl-9 tabular-nums', className)}
      value={formatCurrency(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').replace(/^0+/, ''))}
      {...props}
    />
  </div>
));
CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
