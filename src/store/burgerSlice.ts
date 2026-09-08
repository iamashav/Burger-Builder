import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { BASE_PRICE, EMPTY_INGREDIENTS, INGREDIENT_PRICES } from '../data/ingredients';
import type { Ingredient, IngredientCounts } from '../types/burger';
import { dbApi } from './dbApi';

export interface BurgerState {
  ingredients: IngredientCounts;
  building: boolean;
}

const initialState: BurgerState = {
  ingredients: EMPTY_INGREDIENTS,
  building: false,
};

const burgerSlice = createSlice({
  name: 'burger',
  initialState,
  reducers: {
    ingredientAdded(state, action: PayloadAction<Ingredient>) {
      state.ingredients[action.payload] += 1;
      state.building = true;
    },
    ingredientRemoved(state, action: PayloadAction<Ingredient>) {
      if (state.ingredients[action.payload] <= 0) return;
      state.ingredients[action.payload] -= 1;
      state.building = true;
    },
    burgerReset() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(dbApi.endpoints.getIngredients.matchFulfilled, (state, action) => {
      // Only seed from the server before the user starts building, so a background
      // refetch can never wipe a burger in progress.
      if (state.building) return;
      state.ingredients = action.payload;
    });
  },
  selectors: {
    selectIngredients: (state) => state.ingredients,
    selectIsBuilding: (state) => state.building,
  },
});

export const { ingredientAdded, ingredientRemoved, burgerReset } = burgerSlice.actions;
export const { selectIngredients, selectIsBuilding } = burgerSlice.selectors;
export const burgerReducer = burgerSlice.reducer;

/**
 * Price is derived rather than accumulated: adding and subtracting floats on every click
 * drifts, and a derived total can never disagree with the ingredients on screen.
 */
export const selectTotalPrice = createSelector([selectIngredients], (ingredients) =>
  Object.entries(ingredients).reduce(
    (total, [name, count]) => total + INGREDIENT_PRICES[name as Ingredient] * count,
    BASE_PRICE,
  ),
);

export const selectIngredientCount = createSelector([selectIngredients], (ingredients) =>
  Object.values(ingredients).reduce((total, count) => total + count, 0),
);

export const selectIsPurchasable = createSelector(
  [selectIngredientCount],
  (count) => count > 0,
);
