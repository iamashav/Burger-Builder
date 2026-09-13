import type { Nutrition } from '../../types/drink';

export function NutritionPanel({ nutrition }: { nutrition: Nutrition }) {
  return (
    <section className="bg-ash p-5 ring-1 ring-smoke/15" aria-label="Nutrition">
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="section-label">Energy</dt>
          <dd className="m-0 font-display text-2xl tabular-nums">{nutrition.kcal} kcal</dd>
        </div>
        <div>
          <dt className="section-label">Caffeine</dt>
          <dd className="m-0 font-display text-2xl">{nutrition.caffeine ? 'Yes' : 'None'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="section-label mb-1.5">Allergens</dt>
          <dd className="m-0">
            {nutrition.allergens.length === 0 ? (
              <span className="text-smoke">None of the listed allergens</span>
            ) : (
              <ul className="flex list-none flex-wrap gap-2 p-0">
                {nutrition.allergens.map((allergen) => (
                  <li
                    key={allergen}
                    className="border border-danger/40 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-danger uppercase"
                  >
                    {allergen}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
