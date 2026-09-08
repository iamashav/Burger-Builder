import { INGREDIENT_LABELS } from '../../data/ingredients';
import { INGREDIENTS, type IngredientCounts } from '../../types/burger';
import { Button } from '../Button/Button';

export interface OrderSummaryProps {
  ingredients: IngredientCounts;
  price: number;
  onCancel: () => void;
  onContinue: () => void;
}

export function OrderSummary({ ingredients, price, onCancel, onContinue }: OrderSummaryProps) {
  const chosen = INGREDIENTS.filter((ingredient) => ingredients[ingredient] > 0);

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide">Your order</h2>
      <p className="section-label mt-1">A burger with these ingredients</p>

      <ul className="my-5 space-y-1.5">
        {chosen.map((ingredient) => (
          <li key={ingredient} className="flex justify-between font-mono text-sm">
            <span>{INGREDIENT_LABELS[ingredient]}</span>
            <span className="tabular-nums text-smoke">&times;{ingredients[ingredient]}</span>
          </li>
        ))}
      </ul>

      <p className="flex items-baseline justify-between border-t border-smoke/20 pt-4">
        <span className="section-label">Total</span>
        <span className="font-display text-2xl text-flood tabular-nums">
          ${price.toFixed(2)}
        </span>
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
