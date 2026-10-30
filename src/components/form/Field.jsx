import { useId, cloneElement } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Field({ label, hint, error, optional, action, className, children }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id} className="flex items-baseline gap-1.5">
            {label}
            {optional && <span className="text-xs font-normal text-muted-foreground">(opcional)</span>}
          </Label>
          {action}
        </div>
      )}
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
