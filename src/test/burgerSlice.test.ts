import { describe, expect, it } from 'vitest';
import { BASE_PRICE, INGREDIENT_PRICES } from '../data/ingredients';
import { createStore } from '../store';
import {
  burgerReset,
  ingredientAdded,
  ingredientRemoved,
  selectIngredients,
  selectIsPurchasable,
  selectTotalPrice,
} from '../store/burgerSlice';

describe('burger slice', () => {
  it('starts empty, at the base price, and not purchasable', () => {
    const store = createStore();
    expect(selectIngredientTotal(store.getState())).toBe(0);
    expect(selectTotalPrice(store.getState())).toBe(BASE_PRICE);
    expect(selectIsPurchasable(store.getState())).toBe(false);
  });

  it('adds ingredients and prices them', () => {
    const store = createStore();
    store.dispatch(ingredientAdded('meat'));
    store.dispatch(ingredientAdded('cheese'));

    expect(selectIngredients(store.getState()).meat).toBe(1);
    expect(selectTotalPrice(store.getState())).toBeCloseTo(
      BASE_PRICE + INGREDIENT_PRICES.meat + INGREDIENT_PRICES.cheese,
    );
    expect(selectIsPurchasable(store.getState())).toBe(true);
  });

  it('never drops an ingredient below zero', () => {
    const store = createStore();
    store.dispatch(ingredientRemoved('salad'));

    expect(selectIngredients(store.getState()).salad).toBe(0);
    expect(selectTotalPrice(store.getState())).toBe(BASE_PRICE);
  });

  // Price used to be accumulated by repeated float add/subtract; deriving it means a
  // long add/remove sequence has to land exactly back on the base price.
  it('returns to the base price after adding and removing the same ingredients', () => {
    const store = createStore();
    for (let i = 0; i < 20; i += 1) store.dispatch(ingredientAdded('salad'));
    for (let i = 0; i < 20; i += 1) store.dispatch(ingredientRemoved('salad'));

    expect(selectTotalPrice(store.getState())).toBe(BASE_PRICE);
  });

  it('clears everything on reset', () => {
    const store = createStore();
    store.dispatch(ingredientAdded('bacon'));
    store.dispatch(burgerReset());

    expect(selectIsPurchasable(store.getState())).toBe(false);
    expect(selectTotalPrice(store.getState())).toBe(BASE_PRICE);
  });
});

function selectIngredientTotal(state: ReturnType<ReturnType<typeof createStore>['getState']>) {
  return Object.values(selectIngredients(state)).reduce((sum, count) => sum + count, 0);
}
