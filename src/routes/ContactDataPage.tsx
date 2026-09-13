import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Input } from '../components/Input/Input';
import { Spinner } from '../components/Spinner/Spinner';
import { EMPTY_ORDER_FORM, ORDER_FORM_FIELDS } from '../data/orderForm';
import { formatPrice } from '../lib/format';
import { checkValidity } from '../lib/validation';
import { selectUserId } from '../store/authSlice';
import { usePlaceOrderMutation } from '../store/dbApi';
import {
  drinkHistoryCleared,
  drinkReset,
  selectDrink,
  selectDrinkPrice,
} from '../store/drinkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { OrderFormValues } from '../types/order';

export function ContactDataPage() {
  const dispatch = useAppDispatch();

  const drink = useAppSelector(selectDrink);
  const price = useAppSelector(selectDrinkPrice);
  const userId = useAppSelector(selectUserId);

  const [values, setValues] = useState<OrderFormValues>(EMPTY_ORDER_FORM);
  const [touched, setTouched] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placeOrder, { isLoading, isError, reset }] = usePlaceOrderMutation();

  const fieldValidity = ORDER_FORM_FIELDS.map((field) =>
    checkValidity(values[field.name], field.rules),
  );
  const formValid = fieldValidity.every(Boolean);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!formValid || !userId) return;

    const result = await placeOrder({ drink, price, orderData: values, userId });
    if (!('data' in result) || !result.data) return;

    setOrderPlaced(true);
    dispatch(drinkReset());
    // A fresh drink after ordering should not undo back into the one just bought.
    dispatch(drinkHistoryCleared());
  };

  if (orderPlaced) return <Navigate to="/orders" replace />;

  return (
    <div className="mx-auto max-w-md bg-ash p-6 ring-1 ring-smoke/15 sm:p-8">
      <h1 className="font-display text-2xl tracking-wide">Where is it going?</h1>
      <p className="section-label mt-1 mb-6">Total {formatPrice(price)}</p>

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
          {ORDER_FORM_FIELDS.map((field, index) => (
            <Input
              key={field.name}
              elementType={field.elementType}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              options={field.options}
              value={values[field.name]}
              onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
              invalid={!fieldValidity[index]}
              touched={touched}
              errorMessage={field.errorMessage}
            />
          ))}

          <Button type="submit" className="mt-2 w-full py-3">
            Place order
          </Button>
        </form>
      )}
    </div>
  );
}
