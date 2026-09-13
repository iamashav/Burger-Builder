import { describe, expect, it } from 'vitest';
import { DEFAULT_DRINK } from '../data/menu';
import { priceOf } from '../lib/drink';
import { createStore } from '../store';
import {
  CART_STORAGE_KEY,
  MAX_QUANTITY,
  cartCleared,
  drinkAddedToCart,
  quantityChanged,
  readStoredCart,
  selectCartCount,
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
} from '../store/cartSlice';
import type { Drink } from '../types/drink';

const MATCHA: Drink = { ...DEFAULT_DRINK, tea: 'matcha', layers: ['foam'] };

describe('cart slice', () => {
  it('adds a drink as a line and opens the drawer', () => {
    const store = createStore();
    store.dispatch(drinkAddedToCart(DEFAULT_DRINK));

    expect(selectCartItems(store.getState())).toMatchObject([{ drink: DEFAULT_DRINK, quantity: 1 }]);
    expect(selectCartOpen(store.getState())).toBe(true);
  });

  it('merges an identical drink into one line, but not one with layers in a different order', () => {
    const store = createStore();
    store.dispatch(drinkAddedToCart({ ...DEFAULT_DRINK, layers: ['tapioca', 'foam'] }));
    store.dispatch(drinkAddedToCart({ ...DEFAULT_DRINK, layers: ['tapioca', 'foam'] }));
    store.dispatch(drinkAddedToCart({ ...DEFAULT_DRINK, layers: ['foam', 'tapioca'] }));

    expect(selectCartItems(store.getState()).map((item) => item.quantity)).toEqual([2, 1]);
    expect(selectCartCount(store.getState())).toBe(3);
  });

  it('totals every line at its quantity', () => {
    const store = createStore();
    store.dispatch(drinkAddedToCart(DEFAULT_DRINK));
    store.dispatch(drinkAddedToCart(MATCHA));
    const [, matchaLine] = selectCartItems(store.getState());
    store.dispatch(quantityChanged({ id: matchaLine.id, quantity: 3 }));

    expect(selectCartTotal(store.getState())).toBeCloseTo(
      priceOf(DEFAULT_DRINK) + priceOf(MATCHA) * 3,
      10,
    );
  });

  it('removes a line when its quantity drops to zero and caps large quantities', () => {
    const store = createStore();
    store.dispatch(drinkAddedToCart(DEFAULT_DRINK));
    const [line] = selectCartItems(store.getState());

    store.dispatch(quantityChanged({ id: line.id, quantity: 500 }));
    expect(selectCartItems(store.getState())[0].quantity).toBe(MAX_QUANTITY);

    store.dispatch(quantityChanged({ id: line.id, quantity: 0 }));
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('survives a reload through localStorage', () => {
    const first = createStore();
    first.dispatch(drinkAddedToCart(MATCHA));
    first.dispatch(drinkAddedToCart(MATCHA));

    const second = createStore();
    expect(selectCartItems(second.getState())).toMatchObject([{ drink: MATCHA, quantity: 2 }]);
    expect(selectCartOpen(second.getState())).toBe(false);

    second.dispatch(cartCleared());
    expect(selectCartItems(createStore().getState())).toEqual([]);
  });

  it('drops stored lines that are not drinks on the menu', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { id: 'a', drink: MATCHA, quantity: 1 },
        { id: 'b', drink: { ...MATCHA, tea: 'coffee' }, quantity: 1 },
        { id: 'c', drink: MATCHA, quantity: -4 },
        'garbage',
      ]),
    );

    expect(readStoredCart().items).toEqual([{ id: 'a', drink: MATCHA, quantity: 1 }]);
  });

  it('starts empty when storage holds something unreadable', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{not json');
    expect(readStoredCart().items).toEqual([]);
  });
});
