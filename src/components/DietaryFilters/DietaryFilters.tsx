import { FILTER_LABELS } from '../../data/menu';
import { cn } from '../../lib/cn';
import { componentsOf, itemConflicts } from '../../lib/drink';
import { DIETARY_FILTERS, type DietaryFilter, type Drink } from '../../types/drink';

export interface DietaryFiltersProps {
  drink: Drink;
  active: DietaryFilter[];
  onToggle: (filter: DietaryFilter) => void;
}

export function DietaryFilters({ drink, active, onToggle }: DietaryFiltersProps) {
  const offending = [
    ...new Set(
      componentsOf(drink)
        .filter((item) => itemConflicts(item, active).length > 0)
        .map((item) => item.label),
    ),
  ];

  return (
    <section aria-label="Dietary filters">
      <div className="flex flex-wrap items-center gap-2">
        <span className="section-label mr-1">I need</span>
        {DIETARY_FILTERS.map((filter) => {
          const on = active.includes(filter);
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(filter)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.08em] uppercase ring-1 transition-colors',
                on
                  ? 'bg-flood text-ink ring-flood'
                  : 'text-smoke ring-smoke/30 hover:text-bone hover:ring-smoke/60',
              )}
            >
              {FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>

      {offending.length > 0 && (
        <p role="status" className="mt-3 border border-danger/40 px-3 py-2 text-sm text-danger">
          Doesn&rsquo;t match your filters yet. Swap out: {offending.join(', ')}.
        </p>
      )}
    </section>
  );
}
