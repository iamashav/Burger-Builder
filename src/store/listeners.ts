import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  SESSION_STORAGE_KEY,
  credentialsReceived,
  loggedOut,
  type Credentials,
} from './authSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: credentialsReceived,
  effect: async (action, listenerApi) => {
    // Supersede any timer from a previous session so only one auto-logout is ever pending.
    listenerApi.cancelActiveListeners();

    const credentials: Credentials = action.payload;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(credentials));
    } catch {
      // Private-mode storage failures degrade to a session that ends on reload.
    }

    const msUntilExpiry = credentials.expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      listenerApi.dispatch(loggedOut());
      return;
    }

    await listenerApi.delay(msUntilExpiry);
    listenerApi.dispatch(loggedOut());
  },
});

listenerMiddleware.startListening({
  actionCreator: loggedOut,
  effect: (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  },
});
