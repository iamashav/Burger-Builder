import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DRINK,
  FULL_SUGAR_KCAL,
  MILK_OPTIONS,
  SIZE_OPTIONS,
  TEA_OPTIONS,
  TOPPING_OPTIONS,
} from '../data/menu';
import { drinkConflicts, itemConflicts, nutritionOf, priceOf } from '../lib/drink';
import type { Drink } from '../types/drink';

const plainBlackTea: Drink = {
  size: 'regular',
  tea: 'black',
  milk: 'none',
  sweetness: 0,
  ice: 'regular',
  layers: [],
};

describe('priceOf', () => {
  it('charges the cup size for a plain tea', () => {
    expect(priceOf(plainBlackTea)).toBe(SIZE_OPTIONS.regular.price);
  });

  it('adds the tea, milk and every topping scoop', () => {
    const drink: Drink = {
      ...plainBlackTea,
      size: 'large',
      tea: 'matcha',
      milk: 'oat',
      layers: ['tapioca', 'tapioca', 'foam'],
    };

    const expected =
      SIZE_OPTIONS.large.price +
      TEA_OPTIONS.matcha.price +
      MILK_OPTIONS.oat.price +
      TOPPING_OPTIONS.tapioca.price * 2 +
      TOPPING_OPTIONS.foam.price;

    expect(priceOf(drink)).toBeCloseTo(expected, 10);
  });

  it('returns whole cents even when the parts are inexact floats', () => {
    const drink: Drink = { ...plainBlackTea, layers: ['grass', 'coconut', 'redbean'] };
    const price = priceOf(drink);
    expect(Math.round(price * 100) / 100).toBe(price);
  });

  it('ignores layer order', () => {
    const a: Drink = { ...plainBlackTea, layers: ['tapioca', 'foam'] };
    const b: Drink = { ...plainBlackTea, layers: ['foam', 'tapioca'] };
    expect(priceOf(a)).toBe(priceOf(b));
  });
});

describe('nutritionOf', () => {
  it('scales poured calories with sweetness and size but not toppings', () => {
    const sweet: Drink = { ...plainBlackTea, sweetness: 100 };
    expect(nutritionOf(sweet).kcal).toBe(TEA_OPTIONS.black.kcal + FULL_SUGAR_KCAL);

    const largeWithPearls: Drink = { ...sweet, size: 'large', layers: ['tapioca'] };
    expect(nutritionOf(largeWithPearls).kcal).toBe(
      Math.round(
        (TEA_OPTIONS.black.kcal + FULL_SUGAR_KCAL) * SIZE_OPTIONS.large.scale +
          TOPPING_OPTIONS.tapioca.kcal,
      ),
    );
  });

  it('lists each allergen once, in a stable order', () => {
    const drink: Drink = { ...plainBlackTea, milk: 'almond', layers: ['foam', 'pudding'] };
    expect(nutritionOf(drink).allergens).toEqual(['dairy', 'egg', 'nuts']);
  });

  it('reports caffeine from the tea base', () => {
    expect(nutritionOf(plainBlackTea).caffeine).toBe(true);
    expect(nutritionOf({ ...plainBlackTea, tea: 'taro' }).caffeine).toBe(false);
  });
});

describe('dietary conflicts', () => {
  it('flags animal products for vegans and dairy for dairy-free', () => {
    expect(itemConflicts(TOPPING_OPTIONS.pudding, ['vegan', 'dairy-free'])).toEqual([
      'vegan',
      'dairy-free',
    ]);
    expect(itemConflicts(MILK_OPTIONS.oat, ['vegan', 'dairy-free'])).toEqual([]);
  });

  it('only reports filters that are switched on', () => {
    expect(drinkConflicts(DEFAULT_DRINK, [])).toEqual([]);
    expect(drinkConflicts(DEFAULT_DRINK, ['caffeine-free'])).toEqual(['caffeine-free']);
  });

  it('finds conflicts anywhere in the drink', () => {
    const drink: Drink = { ...plainBlackTea, tea: 'taro', layers: ['tapioca', 'foam'] };
    expect(drinkConflicts(drink, ['caffeine-free', 'dairy-free', 'vegan'])).toEqual([
      'vegan',
      'dairy-free',
    ]);
  });
});
