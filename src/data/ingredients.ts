import type { Ingredient, IngredientCounts } from '../types/burger';

export const BASE_PRICE = 4;

export const INGREDIENT_PRICES: Record<Ingredient, number> = {
  salad: 0.5,
  bacon: 0.7,
  cheese: 0.4,
  meat: 1.3,
};

export const INGREDIENT_LABELS: Record<Ingredient, string> = {
  salad: 'Salad',
  bacon: 'Bacon',
  cheese: 'Cheese',
  meat: 'Meat',
};

export const EMPTY_INGREDIENTS: IngredientCounts = {
  salad: 0,
  bacon: 0,
  cheese: 0,
  meat: 0,
};
