import { describe, expect, it } from 'vitest';
import { DEFAULT_DRINK, MAX_LAYERS } from '../data/menu';
import { priceOf } from '../lib/drink';
import { createStore } from '../store';
import {
  drinkLoaded,
  drinkRedone,
  drinkReset,
  drinkUndone,
  layerMoved,
  milkChosen,
  selectCanAddTopping,
  selectCanRedo,
  selectCanUndo,
  selectDrink,
  selectDrinkPrice,
  sweetnessSet,
  teaChosen,
  toppingAdded,
  toppingRemoved,
} from '../store/drinkSlice';
import { filterToggled, selectDrinkConflicts } from '../store/filtersSlice';
import type { Drink } from '../types/drink';

const layersOf = (store: ReturnType<typeof createStore>) => selectDrink(store.getState()).layers;

function storeWithLayers(layers: Drink['layers']) {
  const store = createStore();
  store.dispatch(drinkLoaded({ ...DEFAULT_DRINK, layers }));
  return store;
}

describe('drink slice', () => {
  it('starts on the default drink with nothing to undo', () => {
    const store = createStore();
    expect(selectDrink(store.getState())).toEqual(DEFAULT_DRINK);
    expect(selectCanUndo(store.getState())).toBe(false);
    expect(selectCanRedo(store.getState())).toBe(false);
  });

  it('stacks toppings bottom-up and stops at cup capacity', () => {
    const store = createStore();
    store.dispatch(drinkLoaded({ ...DEFAULT_DRINK, layers: [] }));

    store.dispatch(toppingAdded('grass'));
    store.dispatch(toppingAdded('foam'));
    expect(layersOf(store)).toEqual(['grass', 'foam']);

    for (let i = 0; i < MAX_LAYERS; i += 1) store.dispatch(toppingAdded('tapioca'));
    expect(layersOf(store)).toHaveLength(MAX_LAYERS);
    expect(selectCanAddTopping(store.getState())).toBe(false);
  });

  it('removes a single layer by position, leaving duplicates alone', () => {
    const store = storeWithLayers(['tapioca', 'grass', 'tapioca']);
    store.dispatch(toppingRemoved(2));
    expect(layersOf(store)).toEqual(['tapioca', 'grass']);

    store.dispatch(toppingRemoved(9));
    expect(layersOf(store)).toEqual(['tapioca', 'grass']);
  });

  it('moves a layer to a new position', () => {
    const store = storeWithLayers(['tapioca', 'grass', 'pudding', 'foam']);

    store.dispatch(layerMoved({ from: 0, to: 2 }));
    expect(layersOf(store)).toEqual(['grass', 'pudding', 'tapioca', 'foam']);

    store.dispatch(layerMoved({ from: 3, to: 0 }));
    expect(layersOf(store)).toEqual(['foam', 'grass', 'pudding', 'tapioca']);
  });

  it('ignores out-of-range moves without spending an undo step', () => {
    const store = storeWithLayers(['tapioca', 'grass']);
    const before = store.getState().drink;

    store.dispatch(layerMoved({ from: 0, to: 2 }));
    store.dispatch(layerMoved({ from: -1, to: 0 }));
    store.dispatch(layerMoved({ from: 1, to: 1 }));

    expect(store.getState().drink).toBe(before);
  });

  it('undoes and redoes edits, including a reorder', () => {
    const store = storeWithLayers(['tapioca', 'grass']);

    store.dispatch(teaChosen('matcha'));
    store.dispatch(layerMoved({ from: 1, to: 0 }));

    store.dispatch(drinkUndone());
    expect(layersOf(store)).toEqual(['tapioca', 'grass']);
    expect(selectDrink(store.getState()).tea).toBe('matcha');

    store.dispatch(drinkUndone());
    expect(selectDrink(store.getState()).tea).toBe('black');

    store.dispatch(drinkRedone());
    store.dispatch(drinkRedone());
    expect(selectDrink(store.getState()).tea).toBe('matcha');
    expect(layersOf(store)).toEqual(['grass', 'tapioca']);
  });

  it('undoes a whole sweetness drag in one step', () => {
    const store = createStore();
    store.dispatch(milkChosen('oat'));
    store.dispatch(sweetnessSet(25));
    store.dispatch(sweetnessSet(75));
    store.dispatch(sweetnessSet(100));

    store.dispatch(drinkUndone());
    expect(selectDrink(store.getState())).toEqual({ ...DEFAULT_DRINK, milk: 'oat' });
  });

  it('can undo a reset', () => {
    const store = storeWithLayers(['foam', 'foam']);
    store.dispatch(drinkReset());
    expect(selectDrink(store.getState())).toEqual(DEFAULT_DRINK);

    store.dispatch(drinkUndone());
    expect(layersOf(store)).toEqual(['foam', 'foam']);
  });

  it('derives price from the present drink', () => {
    const store = storeWithLayers(['foam']);
    expect(selectDrinkPrice(store.getState())).toBe(priceOf(selectDrink(store.getState())));

    store.dispatch(drinkUndone());
    expect(selectDrinkPrice(store.getState())).toBe(priceOf(DEFAULT_DRINK));
  });

  it('reports which active filters the drink breaks', () => {
    const store = createStore();
    expect(selectDrinkConflicts(store.getState())).toEqual([]);

    store.dispatch(filterToggled('dairy-free'));
    store.dispatch(filterToggled('vegan'));
    expect(selectDrinkConflicts(store.getState())).toEqual(['vegan', 'dairy-free']);

    store.dispatch(milkChosen('oat'));
    expect(selectDrinkConflicts(store.getState())).toEqual([]);

    store.dispatch(filterToggled('vegan'));
    store.dispatch(toppingAdded('pudding'));
    expect(selectDrinkConflicts(store.getState())).toEqual(['dairy-free']);
  });
});
