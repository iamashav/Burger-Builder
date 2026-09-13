import {
  FULL_SUGAR_KCAL,
  ICE_LABELS,
  MILK_OPTIONS,
  SIZE_OPTIONS,
  TEA_OPTIONS,
  TOPPING_OPTIONS,
} from '../data/menu';
import {
  ALLERGENS,
  DIETARY_FILTERS,
  type DietaryFilter,
  type Drink,
  type MenuItem,
  type Nutrition,
} from '../types/drink';

const EXCLUDED_BY: Record<DietaryFilter, (item: MenuItem) => boolean> = {
  vegan: (item) => item.animal,
  'dairy-free': (item) => item.allergens.includes('dairy'),
  'caffeine-free': (item) => item.caffeine,
};

export function describeDrink(drink: Drink): string[] {
  return [
    SIZE_OPTIONS[drink.size].label,
    TEA_OPTIONS[drink.tea].label,
    MILK_OPTIONS[drink.milk].label,
    `${drink.sweetness}% sugar`,
    ICE_LABELS[drink.ice],
  ];
}

export function componentsOf(drink: Drink): MenuItem[] {
  return [
    TEA_OPTIONS[drink.tea],
    MILK_OPTIONS[drink.milk],
    ...drink.layers.map((topping) => TOPPING_OPTIONS[topping]),
  ];
}

/** Rounded to whole cents so a price built from float parts compares and displays exactly. */
export function priceOf(drink: Drink): number {
  const total = componentsOf(drink).reduce(
    (sum, item) => sum + item.price,
    SIZE_OPTIONS[drink.size].price,
  );
  return Math.round(total * 100) / 100;
}

export function nutritionOf(drink: Drink): Nutrition {
  const { scale } = SIZE_OPTIONS[drink.size];
  const tea = TEA_OPTIONS[drink.tea];
  const milk = MILK_OPTIONS[drink.milk];
  const toppings = drink.layers.map((topping) => TOPPING_OPTIONS[topping]);

  const poured = (tea.kcal + milk.kcal + (FULL_SUGAR_KCAL * drink.sweetness) / 100) * scale;
  const scooped = toppings.reduce((sum, item) => sum + item.kcal, 0);

  const present = new Set(componentsOf(drink).flatMap((item) => item.allergens));

  return {
    kcal: Math.round(poured + scooped),
    allergens: ALLERGENS.filter((allergen) => present.has(allergen)),
    caffeine: tea.caffeine,
  };
}

export function itemConflicts(item: MenuItem, filters: readonly DietaryFilter[]): DietaryFilter[] {
  return filters.filter((filter) => EXCLUDED_BY[filter](item));
}

export function drinkConflicts(drink: Drink, filters: readonly DietaryFilter[]): DietaryFilter[] {
  const items = componentsOf(drink);
  return DIETARY_FILTERS.filter(
    (filter) => filters.includes(filter) && items.some((item) => EXCLUDED_BY[filter](item)),
  );
}
