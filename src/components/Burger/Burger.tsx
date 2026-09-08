import { INGREDIENTS, type IngredientCounts } from '../../types/burger';
import { BurgerIngredient } from '../BurgerIngredient/BurgerIngredient';

export interface BurgerProps {
  ingredients: IngredientCounts;
}

export function Burger({ ingredients }: BurgerProps) {
  const layers = INGREDIENTS.flatMap((name) =>
    Array.from({ length: ingredients[name] }, (_, index) => (
      <BurgerIngredient key={`${name}-${index}`} type={name} />
    )),
  );

  return (
    <div
      className="mx-auto h-[300px] w-[min(100%,360px)] shrink-0 overflow-hidden text-center font-display text-lg sm:h-[360px] sm:w-[min(100%,420px)] lg:h-[440px] lg:w-[480px]"
      data-testid="burger"
    >
      <BurgerIngredient type="bread-top" />
      {layers.length > 0 ? (
        layers
      ) : (
        <p className="section-label py-8">Start adding ingredients</p>
      )}
      <BurgerIngredient type="bread-bottom" />
    </div>
  );
}
