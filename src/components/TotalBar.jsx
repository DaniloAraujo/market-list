import { formatBRL } from '@/utils/currencyUtils';

export default function TotalBar({ products }) {
  const total = products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
  if (total <= 0) return null;

  const inCart = products.filter((p) => p.collected).reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-baseline justify-between border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="text-sm text-muted-foreground">
        Total <span className="ml-1 font-display text-lg font-semibold tabular-nums text-foreground">{formatBRL(total)}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        No carrinho <span className="ml-1 font-medium tabular-nums text-foreground">{formatBRL(inCart)}</span>
      </p>
    </div>
  );
}
