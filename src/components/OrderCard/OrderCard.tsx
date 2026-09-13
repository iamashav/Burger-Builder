import { TOPPING_OPTIONS } from '../../data/menu';
import { describeDrink } from '../../lib/drink';
import { formatPrice } from '../../lib/format';
import { ASAP } from '../../lib/pickup';
import type { Drink } from '../../types/drink';
import type { Fulfilment, Order } from '../../types/order';
import { Button } from '../Button/Button';
import { DrinkCup } from '../DrinkCup/DrinkCup';

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function describeFulfilment(fulfilment: Fulfilment) {
  if (fulfilment.method === 'delivery') return `Delivery to ${fulfilment.street}, ${fulfilment.city}`;
  return fulfilment.time === ASAP ? 'Pickup, as soon as possible' : `Pickup at ${fulfilment.time}`;
}

export interface OrderCardProps {
  order: Order;
  onMakeAgain: (drink: Drink) => void;
}

export function OrderCard({ order, onMakeAgain }: OrderCardProps) {
  return (
    <li className="bg-ash p-5 ring-1 ring-smoke/15">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-lg tracking-wide">
          {order.createdAt ? DATE_FORMAT.format(order.createdAt) : 'Order'}
        </h3>
        <span className="font-display text-xl text-flood tabular-nums">
          {formatPrice(order.total)}
        </span>
      </div>
      <p className="section-label mt-1">{describeFulfilment(order.fulfilment)}</p>

      <ul className="mt-4 list-none space-y-3 p-0">
        {order.lines.map((line, index) => (
          <li key={index} className="flex items-center gap-3">
            <DrinkCup drink={line.drink} className="h-14 w-auto shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-display tracking-wide">
                {line.quantity} &times; {describeDrink(line.drink).slice(0, 2).join(' ')}
              </p>
              <p className="font-mono text-[0.6875rem] text-smoke">
                {[
                  ...describeDrink(line.drink).slice(2),
                  ...line.drink.layers.map((topping) => TOPPING_OPTIONS[topping].label),
                ].join(' · ')}
              </p>
            </div>
            <Button
              variant="ghost"
              className="shrink-0 px-3 py-2 text-[0.625rem]"
              onClick={() => onMakeAgain(line.drink)}
              aria-label={`Make this again: ${describeDrink(line.drink).slice(0, 2).join(' ')}`}
            >
              Make again
            </Button>
          </li>
        ))}
      </ul>
    </li>
  );
}
