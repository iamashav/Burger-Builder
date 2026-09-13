import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { OrderCard } from '../components/OrderCard/OrderCard';
import { Spinner } from '../components/Spinner/Spinner';
import { selectUserId } from '../store/authSlice';
import { useGetOrdersQuery } from '../store/dbApi';
import { drinkLoaded } from '../store/drinkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function OrdersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector(selectUserId);
  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useGetOrdersQuery(userId ?? '', { skip: !userId });

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl tracking-wide">Your orders</h1>

      {isLoading && <Spinner label="Loading orders" />}

      {isError && <ErrorState title="Orders unavailable" onRetry={() => void refetch()} />}

      {orders && orders.length === 0 && (
        <p className="bg-ash p-6 text-center text-smoke ring-1 ring-smoke/15">
          No orders yet. Build a drink and it will show up here.
        </p>
      )}

      {orders && orders.length > 0 && (
        <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onMakeAgain={(drink) => {
                dispatch(drinkLoaded(drink));
                navigate('/');
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
