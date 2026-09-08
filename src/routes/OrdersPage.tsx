import { ErrorState } from '../components/ErrorState/ErrorState';
import { OrderCard } from '../components/OrderCard/OrderCard';
import { Spinner } from '../components/Spinner/Spinner';
import { selectUserId } from '../store/authSlice';
import { useGetOrdersQuery } from '../store/dbApi';
import { useAppSelector } from '../store/hooks';

export function OrdersPage() {
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
          No orders yet. Build a burger and it will show up here.
        </p>
      )}

      {orders && orders.length > 0 && (
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}
