import {
  FULL_SUGAR_KCAL,
  ICE_LABELS,
  MAX_LAYERS,
  MILK_OPTIONS,
  SIZE_OPTIONS,
  TEA_OPTIONS,
  TOPPING_OPTIONS,
} from '../data/menu';
import {
  ALLERGENS,
  DIETARY_FILTERS,
  ICE_LEVELS,
  MILKS,
  SIZES,
  SWEETNESS_LEVELS,
  TEAS,
  TOPPINGS,
  type DietaryFilter,
  type Drink,
  type MenuItem,
  type Nutrition,
} from '../types/drink';

function isOneOf<T>(options: readonly T[], value: unknown): value is T {
  return options.includes(value as T);
}

/**
 * Drinks come back from localStorage and the database, neither of which the type system
 * can vouch for. Anything that is not a drink this menu can make is rejected outright.
 */
export function parseDrink(value: unknown): Drink | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  // The Realtime Database does not store empty arrays, so a drink with no toppings
  // comes back with no `layers` key at all.
  const layers = candidate.layers ?? [];

  if (
    !isOneOf(SIZES, candidate.size) ||
    !isOneOf(TEAS, candidate.tea) ||
    !isOneOf(MILKS, candidate.milk) ||
    !isOneOf(SWEETNESS_LEVELS, candidate.sweetness) ||
    !isOneOf(ICE_LEVELS, candidate.ice) ||
    !Array.isArray(layers) ||
    layers.length > MAX_LAYERS ||
    !layers.every((layer) => isOneOf(TOPPINGS, layer))
  ) {
    return null;
  }

  return {
    size: candidate.size,
    tea: candidate.tea,
    milk: candidate.milk,
    sweetness: candidate.sweetness,
    ice: candidate.ice,
    layers: [...layers],
  };
}

export function sameDrink(a: Drink, b: Drink): boolean {
  return (
    a.size === b.size &&
    a.tea === b.tea &&
    a.milk === b.milk &&
    a.sweetness === b.sweetness &&
    a.ice === b.ice &&
    a.layers.length === b.layers.length &&
    a.layers.every((layer, index) => layer === b.layers[index])
  );
}

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
