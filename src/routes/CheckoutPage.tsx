import { Navigate, useNavigate } from 'react-router-dom';
import { CheckoutSummary } from '../components/CheckoutSummary/CheckoutSummary';
import { selectIngredients, selectIsPurchasable } from '../store/burgerSlice';
import { useAppSelector } from '../store/hooks';

export function CheckoutPage() {
  const navigate = useNavigate();
  const ingredients = useAppSelector(selectIngredients);
  const purchasable = useAppSelector(selectIsPurchasable);

  // Reaching checkout with an empty burger means a stale link or a reload after ordering.
  if (!purchasable) return <Navigate to="/" replace />;

  return (
    <CheckoutSummary
      ingredients={ingredients}
      onCancel={() => navigate('/')}
      onContinue={() => navigate('/checkout/contact-data')}
    />
  );
}
