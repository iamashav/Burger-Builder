export const SIZES = ['regular', 'large'] as const;
export const TEAS = ['black', 'jasmine', 'oolong', 'matcha', 'taro'] as const;
export const MILKS = ['none', 'whole', 'oat', 'almond'] as const;
export const TOPPINGS = [
  'tapioca',
  'popping',
  'grass',
  'coconut',
  'pudding',
  'redbean',
  'foam',
] as const;
export const SWEETNESS_LEVELS = [0, 25, 50, 75, 100] as const;
export const ICE_LEVELS = ['none', 'less', 'regular'] as const;
export const ALLERGENS = ['dairy', 'egg', 'gluten', 'nuts'] as const;
export const DIETARY_FILTERS = ['vegan', 'dairy-free', 'caffeine-free'] as const;

export type Size = (typeof SIZES)[number];
export type Tea = (typeof TEAS)[number];
export type Milk = (typeof MILKS)[number];
export type Topping = (typeof TOPPINGS)[number];
export type Sweetness = (typeof SWEETNESS_LEVELS)[number];
export type Ice = (typeof ICE_LEVELS)[number];
export type Allergen = (typeof ALLERGENS)[number];
export type DietaryFilter = (typeof DIETARY_FILTERS)[number];

export interface Drink {
  size: Size;
  tea: Tea;
  milk: Milk;
  sweetness: Sweetness;
  ice: Ice;
  /** Bottom of the cup first. Order matters: it is what the cup draws and what gets made. */
  layers: Topping[];
}

export interface MenuItem {
  label: string;
  price: number;
  kcal: number;
  allergens: Allergen[];
  animal: boolean;
  caffeine: boolean;
  colour: string;
}

export interface SizeOption {
  label: string;
  ml: number;
  price: number;
  /** Multiplier for everything poured (tea, milk, sugar); toppings are portioned per scoop. */
  scale: number;
}

export interface Nutrition {
  kcal: number;
  allergens: Allergen[];
  caffeine: boolean;
}
