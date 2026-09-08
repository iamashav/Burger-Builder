import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Burger } from '../components/Burger/Burger';
import { BuildControls } from '../components/BuildControls/BuildControls';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { Modal } from '../components/Modal/Modal';
import { OrderSummary } from '../components/OrderSummary/OrderSummary';
import { Spinner } from '../components/Spinner/Spinner';
import { redirectPathSet, selectIsAuthenticated } from '../store/authSlice';
import {
  ingredientAdded,
  ingredientRemoved,
  selectIngredients,
  selectIsPurchasable,
  selectTotalPrice,
} from '../store/burgerSlice';
import { useGetIngredientsQuery } from '../store/dbApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function BurgerBuilderPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);

  const { isLoading, isError, refetch } = useGetIngredientsQuery();
  const ingredients = useAppSelector(selectIngredients);
  const price = useAppSelector(selectTotalPrice);
  const purchasable = useAppSelector(selectIsPurchasable);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleOrder = () => {
    if (isAuthenticated) {
      setPurchasing(true);
      return;
    }
    dispatch(redirectPathSet('/checkout'));
    navigate('/auth');
  };

  if (isLoading) return <Spinner label="Loading ingredients" />;
  if (isError) {
    return (
      <ErrorState
        title="Ingredients unavailable"
        message="We could not reach the kitchen to load the ingredient list."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <>
      <h1 className="sr-only">Build your burger</h1>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        <Burger ingredients={ingredients} />
        <div className="w-full max-w-md lg:sticky lg:top-20">
          <BuildControls
            ingredients={ingredients}
            price={price}
            purchasable={purchasable}
            isAuthenticated={isAuthenticated}
            onAdd={(ingredient) => dispatch(ingredientAdded(ingredient))}
            onRemove={(ingredient) => dispatch(ingredientRemoved(ingredient))}
            onOrder={handleOrder}
          />
        </div>
      </div>

      <Modal open={purchasing} onClose={() => setPurchasing(false)} title="Your order">
        <OrderSummary
          ingredients={ingredients}
          price={price}
          onCancel={() => setPurchasing(false)}
          onContinue={() => navigate('/checkout')}
        />
      </Modal>
    </>
  );
}
