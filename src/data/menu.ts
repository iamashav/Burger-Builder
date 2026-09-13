import type {
  DietaryFilter,
  Drink,
  Ice,
  Milk,
  MenuItem,
  Size,
  SizeOption,
  Tea,
  Topping,
} from '../types/drink';

export const MAX_LAYERS = 4;

/** Sugar syrup at 100% sweetness in a regular cup. */
export const FULL_SUGAR_KCAL = 120;

type Traits = Partial<Pick<MenuItem, 'allergens' | 'animal' | 'caffeine'>>;

function item(label: string, price: number, kcal: number, colour: string, traits: Traits = {}) {
  return { label, price, kcal, colour, allergens: [], animal: false, caffeine: false, ...traits };
}

export const SIZE_OPTIONS: Record<Size, SizeOption> = {
  regular: { label: 'Regular', ml: 500, price: 5.5, scale: 1 },
  large: { label: 'Large', ml: 700, price: 6.5, scale: 1.4 },
};

export const TEA_OPTIONS: Record<Tea, MenuItem> = {
  black: item('Assam black', 0, 5, '#7a3e1d', { caffeine: true }),
  jasmine: item('Jasmine green', 0, 5, '#c9b458', { caffeine: true }),
  oolong: item('Roasted oolong', 0.3, 5, '#a0612b', { caffeine: true }),
  matcha: item('Matcha', 0.8, 20, '#7fa650', { caffeine: true }),
  taro: item('Taro', 0.6, 90, '#b39bc8'),
};

export const MILK_OPTIONS: Record<Milk, MenuItem> = {
  none: item('No milk', 0, 0, 'transparent'),
  whole: item('Whole milk', 0, 90, '#f5efe6', { allergens: ['dairy'], animal: true }),
  oat: item('Oat milk', 0.5, 70, '#ece0c8', { allergens: ['gluten'] }),
  almond: item('Almond milk', 0.5, 30, '#efe6d8', { allergens: ['nuts'] }),
};

export const TOPPING_OPTIONS: Record<Topping, MenuItem> = {
  tapioca: item('Tapioca pearls', 0.7, 150, '#3b2418'),
  popping: item('Mango popping boba', 0.8, 70, '#f2a93b'),
  grass: item('Grass jelly', 0.6, 40, '#2b2b24'),
  coconut: item('Coconut jelly', 0.6, 60, '#f3f0e2'),
  pudding: item('Egg pudding', 0.8, 110, '#e9c46a', { allergens: ['egg', 'dairy'], animal: true }),
  redbean: item('Red bean', 0.6, 100, '#7b2d26'),
  foam: item('Cheese foam', 1, 130, '#fff8e7', { allergens: ['dairy'], animal: true }),
};

export const ICE_LABELS: Record<Ice, string> = {
  none: 'No ice',
  less: 'Less ice',
  regular: 'Regular ice',
};

export const FILTER_LABELS: Record<DietaryFilter, string> = {
  vegan: 'Vegan',
  'dairy-free': 'Dairy-free',
  'caffeine-free': 'Caffeine-free',
};

export const DEFAULT_DRINK: Drink = {
  size: 'regular',
  tea: 'black',
  milk: 'whole',
  sweetness: 50,
  ice: 'regular',
  layers: ['tapioca'],
};
