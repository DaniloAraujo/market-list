import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Field from './Field';
import CategorySelect from './CategorySelect';
import QuantityStepper from './QuantityStepper';
import UnitToggle from './UnitToggle';
import CurrencyInput from './CurrencyInput';
import { priceLabel, quantityAfterUnitChange } from '@/utils/quantityUtils';
import { cn } from '@/lib/utils';

export const NOTE_MAX = 255;

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
  const unit = values.unit ?? 'un';

  return (
    <div className={cn('grid grid-cols-2 gap-3 [&>*]:min-w-0', !compact && 'md:grid-cols-[1.3fr_1fr_1fr]')}>
      <Field label="Categoria" tallLabel className={cn('col-span-2', !compact && 'md:col-span-1')}>
        <CategorySelect value={values.category} onValueChange={(category) => onChange({ category })} />
      </Field>
      <Field
        label="Quantidade"
        action={
          <UnitToggle
            value={unit}
            onChange={(next) => onChange({ unit: next, quantity: quantityAfterUnitChange(unit, next, values.quantity) })}
          />
        }
      >
        <QuantityStepper value={values.quantity} unit={unit} onChange={(quantity) => onChange({ quantity })} />
      </Field>
      <Field label={priceLabel(unit)} optional tallLabel>
        <CurrencyInput value={values.priceCents} onChange={(priceCents) => onChange({ priceCents })} />
      </Field>
      <Field
        label="Observação"
        optional
        hint={`${(values.note ?? '').length}/${NOTE_MAX}`}
        className={cn('col-span-2', !compact && 'md:col-span-3')}
      >
        <Textarea
          value={values.note ?? ''}
          onChange={(e) => onChange({ note: e.target.value })}
          maxLength={NOTE_MAX}
          rows={2}
          placeholder="Marca, tamanho, onde comprar..."
        />
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
