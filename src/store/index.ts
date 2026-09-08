import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { authReducer, readStoredSession } from './authSlice';
import { burgerReducer } from './burgerSlice';
import { dbApi } from './dbApi';
import { listenerMiddleware } from './listeners';

export function createStore(preloadedAuth = readStoredSession()) {
  return configureStore({
    reducer: {
      auth: authReducer,
      burger: burgerReducer,
      [dbApi.reducerPath]: dbApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    preloadedState: { auth: preloadedAuth },
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
