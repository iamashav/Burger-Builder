import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { drinkConflicts } from '../lib/drink';
import { DIETARY_FILTERS, type DietaryFilter } from '../types/drink';
import { selectDrink } from './drinkSlice';

export interface FiltersState {
  active: DietaryFilter[];
}

const initialState: FiltersState = { active: [] };

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    filterToggled(state, action: PayloadAction<DietaryFilter>) {
      const next = new Set(state.active);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      // Kept in catalogue order so the list is stable whatever order chips were tapped in.
      state.active = DIETARY_FILTERS.filter((filter) => next.has(filter));
    },
    filtersCleared(state) {
      state.active = [];
    },
  },
  selectors: {
    selectActiveFilters: (state) => state.active,
  },
});

export const { filterToggled, filtersCleared } = filtersSlice.actions;
export const { selectActiveFilters } = filtersSlice.selectors;
export const filtersReducer = filtersSlice.reducer;

export const selectDrinkConflicts = createSelector(
  [selectDrink, selectActiveFilters],
  drinkConflicts,
);
