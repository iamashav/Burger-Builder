import { INGREDIENT_LABELS } from '../../data/ingredients';
import { INGREDIENTS, type Order } from '../../types/burger';

export function OrderCard({ order }: { order: Order }) {
  const chosen = INGREDIENTS.filter((ingredient) => (order.ingredients[ingredient] ?? 0) > 0);

  return (
    <li className="bg-ash p-5 ring-1 ring-smoke/15">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-lg tracking-wide">
          {order.orderData?.name ?? 'Order'}
        </h3>
        <span className="font-display text-xl text-flood tabular-nums">
          ${Number(order.price).toFixed(2)}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {chosen.map((ingredient) => (
          <li
            key={ingredient}
            className="border border-smoke/25 px-2 py-1 font-mono text-[0.6875rem] text-smoke"
          >
            {INGREDIENT_LABELS[ingredient]} &times;{order.ingredients[ingredient]}
          </li>
        ))}
      </ul>

      {order.orderData?.deliveryMethod && (
        <p className="section-label mt-3">Delivery: {order.orderData.deliveryMethod}</p>
      )}
    </li>
  );
}
