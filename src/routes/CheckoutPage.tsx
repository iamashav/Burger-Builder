import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { DrinkCup } from '../components/DrinkCup/DrinkCup';
import { describeDrink } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { selectDrink, selectDrinkPrice } from '../store/drinkSlice';
import { useAppSelector } from '../store/hooks';

export function CheckoutPage() {
  const navigate = useNavigate();
  const drink = useAppSelector(selectDrink);
  const price = useAppSelector(selectDrinkPrice);

  return (
    <div className="text-center">
      <h1 className="font-display text-3xl tracking-wide">Check your drink</h1>
      <DrinkCup drink={drink} className="mx-auto my-6 h-[280px] w-auto" />
      <p className="font-mono text-xs text-smoke">{describeDrink(drink).join(' · ')}</p>
      <p className="mt-2 font-display text-2xl text-flood tabular-nums">{formatPrice(price)}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/')}>
          Keep editing
        </Button>
        <Button onClick={() => navigate('/checkout/contact-data')}>Continue</Button>
      </div>
    </div>
  );
}
