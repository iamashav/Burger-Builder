import { TOPPING_OPTIONS } from '../../data/menu';
import { describeDrink, priceOf } from '../../lib/drink';
import { formatPrice } from '../../lib/format';
import { MAX_QUANTITY, type CartItem } from '../../store/cartSlice';
import { Button } from '../Button/Button';
import { Drawer } from '../Drawer/Drawer';
import { DrinkCup } from '../DrinkCup/DrinkCup';

export interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  total: number;
  isAuthenticated: boolean;
  onClose: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  total,
  isAuthenticated,
  onClose,
  onQuantityChange,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Drawer
      id="cart-drawer"
      label="Your order"
      side="right"
      open={open}
      onClose={onClose}
      className="w-96 max-w-[90%]"
    >
      <div className="flex items-center justify-between border-b border-smoke/15 px-5 py-4">
        <h2 className="font-display text-2xl tracking-wide">Your order</h2>
        <Button variant="ghost" className="size-9 px-0" onClick={onClose} aria-label="Close order">
          &times;
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="flex-1 px-5 py-10 text-center text-smoke">
          Nothing here yet. Build a drink and add it to your order.
        </p>
      ) : (
        <ul className="flex-1 list-none space-y-3 overflow-y-auto p-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 bg-ink/40 p-3 ring-1 ring-smoke/15">
              <DrinkCup drink={item.drink} className="h-20 w-auto shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display tracking-wide">
                  {describeDrink(item.drink).slice(0, 2).join(' ')}
                </p>
                <p className="font-mono text-[0.6875rem] text-smoke">
                  {describeDrink(item.drink).slice(2).join(' · ')}
                </p>
                {item.drink.layers.length > 0 && (
                  <p className="font-mono text-[0.6875rem] text-smoke">
                    {item.drink.layers.map((topping) => TOPPING_OPTIONS[topping].label).join(', ')}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="size-7 px-0"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      aria-label={item.quantity === 1 ? 'Remove drink' : 'One fewer'}
                    >
                      &minus;
                    </Button>
                    <span className="w-5 text-center font-mono text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      className="size-7 px-0"
                      disabled={item.quantity >= MAX_QUANTITY}
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      aria-label="One more"
                    >
                      +
                    </Button>
                  </div>
                  <span className="font-display text-flood tabular-nums">
                    {formatPrice(priceOf(item.drink) * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-smoke/15 p-5">
        <p className="mb-4 flex items-baseline justify-between">
          <span className="section-label">Total</span>
          <span className="font-display text-3xl text-flood tabular-nums">{formatPrice(total)}</span>
        </p>
        <Button className="w-full py-3.5" disabled={items.length === 0} onClick={onCheckout}>
          {isAuthenticated ? 'Checkout' : 'Sign in to check out'}
        </Button>
      </div>
    </Drawer>
  );
}
