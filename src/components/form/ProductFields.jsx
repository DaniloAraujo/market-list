import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import Field from './Field';
import CategorySelect from './CategorySelect';
import QuantityStepper from './QuantityStepper';
import CurrencyInput from './CurrencyInput';
import { cn } from '@/lib/utils';

/**
 * Campos de um produto, compartilhados entre o formulário de adicionar e o diálogo de editar.
 * `values`: { name, category, quantity, priceCents }
 */
export const NameField = forwardRef(({ value, error, onChange, label = 'Produto', ...props }, ref) => (
  <Field label={label} error={error}>
    <Input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ex: Arroz, detergente, maçã..."
      maxLength={80}
      autoComplete="off"
      enterKeyHint="done"
      {...props}
    />
  </Field>
));
NameField.displayName = 'NameField';

export function DetailFields({ values, onChange, compact = false }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 [&>*]:min-w-0', !compact && 'md:grid-cols-[1.3fr_1fr_1fr]')}>
      <Field label="Categoria" className={cn('col-span-2', !compact && 'md:col-span-1')}>
        <CategorySelect value={values.category} onValueChange={(category) => onChange({ category })} />
      </Field>
      <Field label="Quantidade">
        <QuantityStepper value={values.quantity} onChange={(quantity) => onChange({ quantity })} />
      </Field>
      <Field label="Valor unitário" optional>
        <CurrencyInput value={values.priceCents} onChange={(priceCents) => onChange({ priceCents })} />
      </Field>
    </div>
  );
}

export default function ProductFields({ values, errors = {}, onChange, compact }) {
  return (
    <div className="space-y-4">
      <NameField value={values.name} error={errors.name} onChange={(name) => onChange({ name })} />
      <DetailFields values={values} onChange={onChange} compact={compact} />
    </div>
  );
}
