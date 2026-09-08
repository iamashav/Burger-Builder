import type { IngredientCounts } from '../../types/burger';
import { Burger } from '../Burger/Burger';
import { Button } from '../Button/Button';

export interface CheckoutSummaryProps {
  ingredients: IngredientCounts;
  onCancel: () => void;
  onContinue: () => void;
}

export function CheckoutSummary({ ingredients, onCancel, onContinue }: CheckoutSummaryProps) {
  return (
    <div className="text-center">
      <h1 className="font-display text-3xl tracking-wide">We hope it tastes well</h1>
      <div className="mx-auto my-6 max-w-md">
        <Burger ingredients={ingredients} />
      </div>
      <div className="flex justify-center gap-3">
        <Button variant="danger" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}
