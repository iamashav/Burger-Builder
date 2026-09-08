import { INGREDIENT_LABELS, INGREDIENT_PRICES } from '../../data/ingredients';
import { INGREDIENTS, type Ingredient, type IngredientCounts } from '../../types/burger';
import { BuildControl } from '../BuildControl/BuildControl';
import { Button } from '../Button/Button';

export interface BuildControlsProps {
  ingredients: IngredientCounts;
  price: number;
  purchasable: boolean;
  isAuthenticated: boolean;
  onAdd: (ingredient: Ingredient) => void;
  onRemove: (ingredient: Ingredient) => void;
  onOrder: () => void;
}

export function BuildControls({
  ingredients,
  price,
  purchasable,
  isAuthenticated,
  onAdd,
  onRemove,
  onOrder,
}: BuildControlsProps) {
  return (
    <section className="w-full bg-ash p-5 ring-1 ring-smoke/15" aria-label="Burger controls">
      <p className="mb-4 flex items-baseline justify-between">
        <span className="section-label">Current price</span>
        <span className="font-display text-3xl text-flood tabular-nums">
          ${price.toFixed(2)}
        </span>
      </p>

      <div className="mb-5">
        {INGREDIENTS.map((ingredient) => (
          <BuildControl
            key={ingredient}
            label={INGREDIENT_LABELS[ingredient]}
            count={ingredients[ingredient]}
            price={INGREDIENT_PRICES[ingredient]}
            disabled={ingredients[ingredient] <= 0}
            onAdd={() => onAdd(ingredient)}
            onRemove={() => onRemove(ingredient)}
          />
        ))}
      </div>

      <Button className="w-full py-3.5" disabled={!purchasable} onClick={onOrder}>
        {isAuthenticated ? 'Order now' : 'Sign in to order'}
      </Button>
    </section>
  );
}
