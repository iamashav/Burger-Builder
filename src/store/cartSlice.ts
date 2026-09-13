import { createSelector, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { parseDrink, priceOf, sameDrink } from '../lib/drink';
import type { Drink } from '../types/drink';

export interface CartItem {
  id: string;
  drink: Drink;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
}

export const CART_STORAGE_KEY = 'drink-builder.cart';
export const MAX_QUANTITY = 20;

export function readStoredCart(): CartState {
  const empty: CartState = { items: [], drawerOpen: false };
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return empty;

    const stored: unknown = JSON.parse(raw);
    if (!Array.isArray(stored)) return empty;

    // A menu change can make an old stored drink unmakeable; drop that line, keep the rest.
    const items = stored.flatMap((entry): CartItem[] => {
      const drink = parseDrink(entry?.drink);
      const quantity = Number(entry?.quantity);
      if (!drink || !Number.isInteger(quantity) || quantity < 1) return [];
      return [{ id: String(entry.id ?? nanoid()), drink, quantity: Math.min(quantity, MAX_QUANTITY) }];
    });

    return { ...empty, items };
  } catch {
    return empty;
  }
}

const initialState: CartState = { items: [], drawerOpen: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    drinkAddedToCart(state, action: PayloadAction<Drink>) {
      state.drawerOpen = true;
      const existing = state.items.find((item) => sameDrink(item.drink, action.payload));
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, MAX_QUANTITY);
        return;
      }
      state.items.push({ id: nanoid(), drink: action.payload, quantity: 1 });
    },
    quantityChanged(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      if (quantity < 1) {
        state.items = state.items.filter((item) => item.id !== id);
        return;
      }
      const item = state.items.find((candidate) => candidate.id === id);
      if (item) item.quantity = Math.min(quantity, MAX_QUANTITY);
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    cartCleared(state) {
      state.items = [];
    },
    cartOpened(state) {
      state.drawerOpen = true;
    },
    cartClosed(state) {
      state.drawerOpen = false;
    },
  },
  selectors: {
    selectCartItems: (state) => state.items,
    selectCartOpen: (state) => state.drawerOpen,
  },
});

export const { drinkAddedToCart, quantityChanged, itemRemoved, cartCleared, cartOpened, cartClosed } =
  cartSlice.actions;
export const { selectCartItems, selectCartOpen } = cartSlice.selectors;
export const cartReducer = cartSlice.reducer;

export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

export const selectCartTotal = createSelector([selectCartItems], (items) =>
  Math.round(items.reduce((total, item) => total + priceOf(item.drink) * item.quantity, 0) * 100) /
  100,
);
