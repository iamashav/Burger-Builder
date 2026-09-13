import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { authReducer, readStoredSession } from './authSlice';
import { cartReducer, readStoredCart } from './cartSlice';
import { dbApi } from './dbApi';
import { drinkReducer } from './drinkSlice';
import { filtersReducer } from './filtersSlice';
import { listenerMiddleware } from './listeners';

export function createStore(preloadedAuth = readStoredSession(), preloadedCart = readStoredCart()) {
  return configureStore({
    reducer: {
      auth: authReducer,
      drink: drinkReducer,
      filters: filtersReducer,
      cart: cartReducer,
      [dbApi.reducerPath]: dbApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    preloadedState: { auth: preloadedAuth, cart: preloadedCart },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(dbApi.middleware, authApi.middleware),
  });
}

export const store = createStore();

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
