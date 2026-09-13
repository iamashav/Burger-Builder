import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_DRINK, MAX_LAYERS } from '../data/menu';
import { nutritionOf, priceOf } from '../lib/drink';
import type { Drink, Ice, Milk, Size, Sweetness, Tea, Topping } from '../types/drink';
import { undoable, type History } from './history';

const drinkSlice = createSlice({
  name: 'drink',
  initialState: DEFAULT_DRINK,
  reducers: {
    sizeChosen(state, action: PayloadAction<Size>) {
      state.size = action.payload;
    },
    teaChosen(state, action: PayloadAction<Tea>) {
      state.tea = action.payload;
    },
    milkChosen(state, action: PayloadAction<Milk>) {
      state.milk = action.payload;
    },
    sweetnessSet(state, action: PayloadAction<Sweetness>) {
      state.sweetness = action.payload;
    },
    iceSet(state, action: PayloadAction<Ice>) {
      state.ice = action.payload;
    },
    toppingAdded(state, action: PayloadAction<Topping>) {
      if (state.layers.length >= MAX_LAYERS) return;
      state.layers.push(action.payload);
    },
    toppingRemoved(state, action: PayloadAction<number>) {
      if (action.payload < 0 || action.payload >= state.layers.length) return;
      state.layers.splice(action.payload, 1);
    },
    layerMoved(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const last = state.layers.length - 1;
      if (from === to || from < 0 || to < 0 || from > last || to > last) return;
      const [moved] = state.layers.splice(from, 1);
      state.layers.splice(to, 0, moved);
    },
    drinkLoaded(_state, action: PayloadAction<Drink>) {
      return action.payload;
    },
    drinkReset() {
      return DEFAULT_DRINK;
    },
  },
});

export const {
  sizeChosen,
  teaChosen,
  milkChosen,
  sweetnessSet,
  iceSet,
  toppingAdded,
  toppingRemoved,
  layerMoved,
  drinkLoaded,
  drinkReset,
} = drinkSlice.actions;

const drinkHistory = undoable('drink', drinkSlice.reducer, {
  groupBy: (action) => (sweetnessSet.match(action) ? 'sweetness' : null),
});

export const {
  undo: drinkUndone,
  redo: drinkRedone,
  historyCleared: drinkHistoryCleared,
} = drinkHistory;
export const drinkReducer = drinkHistory.reducer;

interface WithDrink {
  drink: History<Drink>;
}

export const selectDrink = (state: WithDrink) => state.drink.present;
export const selectCanUndo = (state: WithDrink) => state.drink.past.length > 0;
export const selectCanRedo = (state: WithDrink) => state.drink.future.length > 0;
export const selectCanAddTopping = (state: WithDrink) =>
  state.drink.present.layers.length < MAX_LAYERS;

export const selectDrinkPrice = createSelector([selectDrink], priceOf);
export const selectNutrition = createSelector([selectDrink], nutritionOf);
