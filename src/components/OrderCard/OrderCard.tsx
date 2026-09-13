import { TOPPING_OPTIONS } from '../../data/menu';
import { describeDrink } from '../../lib/drink';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/order';

export function OrderCard({ order }: { order: Order }) {
  return (
    <li className="bg-ash p-5 ring-1 ring-smoke/15">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-lg tracking-wide">
          {order.orderData?.name ?? 'Order'}
        </h3>
        <span className="font-display text-xl text-flood tabular-nums">
          {formatPrice(Number(order.price))}
        </span>
      </div>

      {/* Orders written before the drink model have no drink to describe. */}
      {order.drink && (
        <>
          <p className="mt-2 font-mono text-xs text-smoke">
            {describeDrink(order.drink).join(' · ')}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(order.drink.layers ?? []).map((topping, index) => (
              <li
                key={`${topping}-${index}`}
                className="border border-smoke/25 px-2 py-1 font-mono text-[0.6875rem] text-smoke"
              >
                {TOPPING_OPTIONS[topping]?.label ?? topping}
              </li>
            ))}
          </ul>
        </>
      )}

      {order.orderData?.deliveryMethod && (
        <p className="section-label mt-3">Delivery: {order.orderData.deliveryMethod}</p>
      )}
    </li>
  );
}
