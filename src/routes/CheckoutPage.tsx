import { useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { ChoiceGroup } from '../components/ChoiceGroup/ChoiceGroup';
import { DrinkCup } from '../components/DrinkCup/DrinkCup';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Input } from '../components/Input/Input';
import { Spinner } from '../components/Spinner/Spinner';
import { TOPPING_OPTIONS } from '../data/menu';
import { describeDrink, priceOf } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { ASAP, pickupSlots } from '../lib/pickup';
import { checkValidity, type ValidationRules } from '../lib/validation';
import { selectUserId } from '../store/authSlice';
import { cartCleared, selectCartItems, selectCartTotal } from '../store/cartSlice';
import { usePlaceOrderMutation } from '../store/dbApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SERVER_TIMESTAMP, type Fulfilment, type OrderPayload } from '../types/order';

interface CheckoutValues {
  method: Fulfilment['method'];
  time: string;
  street: string;
  city: string;
  postcode: string;
  name: string;
  email: string;
  phone: string;
}

type TextField = Exclude<keyof CheckoutValues, 'method' | 'time'>;

interface FieldSpec {
  name: TextField;
  label: string;
  type?: string;
  autoComplete: string;
  rules: ValidationRules;
  errorMessage?: string;
  deliveryOnly?: boolean;
}

const FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Name', autoComplete: 'name', rules: { required: true } },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    rules: { required: true, isEmail: true },
    errorMessage: 'Enter a valid email address.',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    autoComplete: 'tel',
    rules: { required: true, pattern: /^\+?[\d\s()-]{7,20}$/ },
    errorMessage: 'Enter a phone number we can text when it is ready.',
  },
  {
    name: 'street',
    label: 'Street address',
    autoComplete: 'street-address',
    rules: { required: true },
    deliveryOnly: true,
  },
  {
    name: 'city',
    label: 'City',
    autoComplete: 'address-level2',
    rules: { required: true },
    deliveryOnly: true,
  },
  {
    name: 'postcode',
    label: 'Postcode',
    autoComplete: 'postal-code',
    rules: { required: true, pattern: /^[A-Za-z0-9 -]{3,10}$/ },
    errorMessage: 'Enter a valid postcode.',
    deliveryOnly: true,
  },
];

const EMPTY_VALUES: CheckoutValues = {
  method: 'pickup',
  time: ASAP,
  street: '',
  city: '',
  postcode: '',
  name: '',
  email: '',
  phone: '',
};

function fulfilmentOf(values: CheckoutValues): Fulfilment {
  return values.method === 'pickup'
    ? { method: 'pickup', time: values.time }
    : {
        method: 'delivery',
        street: values.street.trim(),
        city: values.city.trim(),
        postcode: values.postcode.trim(),
      };
}

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const userId = useAppSelector(selectUserId);

  const slots = useMemo(() => pickupSlots(new Date()), []);
  const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placeOrder, { isLoading, isError, reset }] = usePlaceOrderMutation();

  const fields = FIELDS.filter((field) => !field.deliveryOnly || values.method === 'delivery');
  const validity = Object.fromEntries(
    fields.map((field) => [field.name, checkValidity(values[field.name], field.rules)]),
  ) as Partial<Record<TextField, boolean>>;
  const formValid = Object.values(validity).every(Boolean);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!formValid || !userId) return;

    const order: OrderPayload = {
      lines: items.map((item) => ({
        drink: item.drink,
        quantity: item.quantity,
        unitPrice: priceOf(item.drink),
      })),
      total,
      fulfilment: fulfilmentOf(values),
      contact: { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() },
      userId,
      createdAt: SERVER_TIMESTAMP,
    };

    const result = await placeOrder(order);
    if (!('data' in result) || !result.data) return;

    setOrderPlaced(true);
    dispatch(cartCleared());
  };

  // Both redirects are declarative, and in this order, because clearing the cart on
  // success also empties it: checked the other way round, a finished order would bounce
  // the user to the builder instead of their orders.
  if (orderPlaced) return <Navigate to="/orders" replace />;
  if (items.length === 0) return <Navigate to="/" replace />;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-start">
      <section className="bg-ash p-6 ring-1 ring-smoke/15" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" className="font-display text-2xl tracking-wide">
          Your order
        </h2>
        <ul className="my-5 list-none space-y-4 p-0">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <DrinkCup drink={item.drink} className="h-16 w-auto shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display tracking-wide">
                  {item.quantity} &times; {describeDrink(item.drink).slice(0, 2).join(' ')}
                </p>
                <p className="font-mono text-[0.6875rem] text-smoke">
                  {[
                    ...describeDrink(item.drink).slice(2),
                    ...item.drink.layers.map((topping) => TOPPING_OPTIONS[topping].label),
                  ].join(' · ')}
                </p>
              </div>
              <span className="font-mono text-sm tabular-nums">
                {formatPrice(priceOf(item.drink) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="flex items-baseline justify-between border-t border-smoke/20 pt-4">
          <span className="section-label">Total</span>
          <span className="font-display text-3xl text-flood tabular-nums">{formatPrice(total)}</span>
        </p>
      </section>

      <section className="bg-ash p-6 ring-1 ring-smoke/15 sm:p-8">
        <h1 className="font-display text-2xl tracking-wide">Checkout</h1>
        <p className="section-label mt-1 mb-6">Pay in store or on delivery</p>

        {isError && (
          <div className="mb-5">
            <ErrorState
              title="Order not placed"
              message="We could not send your order. Nothing has been charged."
              onRetry={reset}
            />
          </div>
        )}

        {isLoading ? (
          <Spinner label="Placing your order" />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <ChoiceGroup
              legend="How do you want it?"
              value={values.method}
              onChange={(method) => setValues((current) => ({ ...current, method }))}
              choices={[
                { value: 'pickup', label: 'Pickup', detail: 'Collect in store' },
                { value: 'delivery', label: 'Delivery', detail: 'To your door' },
              ]}
            />

            {values.method === 'pickup' && (
              <Input
                elementType="select"
                label="Pickup time"
                value={values.time}
                options={slots}
                onChange={(time) => setValues((current) => ({ ...current, time }))}
              />
            )}

            {fields.map((field) => (
              <Input
                key={field.name}
                label={field.label}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
                invalid={!validity[field.name]}
                touched={touched}
                errorMessage={field.errorMessage}
              />
            ))}

            <Button type="submit" className="mt-2 w-full py-3">
              Place order &middot; {formatPrice(total)}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
