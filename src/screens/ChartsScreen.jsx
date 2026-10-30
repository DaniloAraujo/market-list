import { useMemo, useState } from 'react';
import { useCategories } from '@/categories/categories-context';
import CategoryDonut from '@/components/charts/CategoryDonut';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/stores/store-context';
import { categoryChartColor, resolveCategory } from '@/utils/categoryUtils';
import { formatBRL } from '@/utils/currencyUtils';
import { lineTotal } from '@/utils/quantityUtils';
import { cn } from '@/lib/utils';

const METRICS = [
  { value: 'items', label: 'Itens' },
  { value: 'value', label: 'Valor' },
];

function Stat({ label, value, strong }) {
  return (
    <div className="min-w-0 rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 truncate font-display tabular-nums', strong ? 'text-2xl font-semibold' : 'text-lg font-medium')}>
        {value}
      </p>
    </div>
  );
}

function MetricToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="O que mostrar no gráfico" className="inline-flex rounded-lg bg-muted p-0.5">
      {METRICS.map((metric) => (
        <button
          key={metric.value}
          type="button"
          role="radio"
          aria-checked={value === metric.value}
          onClick={() => onChange(metric.value)}
          className={cn(
            'h-7 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            value === metric.value && 'bg-card text-foreground'
          )}
        >
          {metric.label}
        </button>
      ))}
    </div>
  );
}

export default function ChartsScreen() {
  const store = useStore();
  const { custom } = useCategories();
  const { owned, shared, currentList, products } = store;
  const [metric, setMetric] = useState('items');

  const lists = useMemo(() => [...owned, ...shared], [owned, shared]);

  const stats = useMemo(() => {
    const priced = lineTotal;
    const total = products.reduce((sum, product) => sum + priced(product), 0);
    const inCart = products.filter((product) => product.collected).reduce((sum, product) => sum + priced(product), 0);
    const collected = products.filter((product) => product.collected).length;
    return { total, inCart, remaining: total - inCart, collected, count: products.length };
  }, [products]);

  const hasValue = stats.total > 0;
  const activeMetric = hasValue ? metric : 'items';

  const slices = useMemo(() => {
    const groups = new Map();
    for (const product of products) {
      const category = resolveCategory(product.category, custom);
      const entry = groups.get(category.key) ?? { category, items: 0, value: 0 };
      entry.items += 1;
      entry.value += lineTotal(product);
      groups.set(category.key, entry);
    }
    return [...groups.values()]
      .map(({ category, items, value }) => ({
        key: category.key,
        label: category.label,
        emoji: category.emoji,
        color: categoryChartColor(category),
        value: activeMetric === 'items' ? items : value,
      }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [products, custom, activeMetric]);

  const sliceTotal = slices.reduce((sum, slice) => sum + slice.value, 0);
  const format = (value) => (activeMetric === 'items' ? `${value}` : formatBRL(value));

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-4 pt-5 sm:pt-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Gráficos</h1>

      {!store.ready ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Carregando suas listas...</p>
      ) : lists.length === 0 || !currentList ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Crie uma lista para ver os gráficos dela.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Lista</p>
            <Select value={currentList.id} onValueChange={store.selectList}>
              <SelectTrigger aria-label="Escolher a lista do gráfico">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                    {list.role !== 'owner' && list.owner ? ` · de ${list.owner.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {stats.count === 0 ? (
            <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
              Esta lista ainda não tem itens. Adicione itens para ver o gráfico.
            </p>
          ) : (
            <>
              {hasValue ? (
                <section className="space-y-3" aria-label="Valores da lista">
                  <Stat label="Valor da lista" value={formatBRL(stats.total)} strong />
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="No carrinho" value={formatBRL(stats.inCart)} />
                    <Stat label="Falta pegar" value={formatBRL(stats.remaining)} />
                  </div>
                </section>
              ) : (
                <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                  Nenhum item desta lista tem valor. Informe o valor unitário nos itens para ver o total aqui.
                </p>
              )}

              <section className="space-y-4 rounded-xl border bg-card p-5" aria-label="Itens por categoria">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base font-semibold tracking-tight">Por categoria</h2>
                  {hasValue && <MetricToggle value={metric} onChange={setMetric} />}
                </div>

                {slices.length > 0 ? (
                  <>
                    <CategoryDonut
                      slices={slices}
                      total={sliceTotal}
                      centerValue={activeMetric === 'items' ? `${sliceTotal}` : formatBRL(sliceTotal)}
                      centerLabel={activeMetric === 'items' ? (sliceTotal === 1 ? 'item' : 'itens') : 'em valor'}
                      label={`Distribuição ${activeMetric === 'items' ? 'de itens' : 'de valor'} por categoria`}
                    />
                    <ul className="divide-y">
                      {slices.map((slice) => (
                        <li key={slice.key} className="flex items-center gap-3 py-2 text-sm">
                          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                          <span aria-hidden="true">{slice.emoji}</span>
                          <span className="min-w-0 flex-1 truncate">{slice.label}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {Math.round((slice.value / sliceTotal) * 100)}%
                          </span>
                          <span className="w-20 text-right font-medium tabular-nums">{format(slice.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">Sem dados para este gráfico.</p>
                )}
              </section>

              <section className="grid grid-cols-2 gap-3" aria-label="Progresso">
                <Stat label="Itens na lista" value={stats.count} />
                <Stat label="Já pegos" value={`${stats.collected} de ${stats.count}`} />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
