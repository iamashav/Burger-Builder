import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  userId: string | null;
  expiresAt: number | null;
  redirectPath: string;
}

export interface Credentials {
  token: string;
  userId: string;
  expiresAt: number;
}

export const SESSION_STORAGE_KEY = 'burger-builder.session';

const emptyState: AuthState = {
  token: null,
  userId: null,
  expiresAt: null,
  redirectPath: '/',
};

export function readStoredSession(): AuthState {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return emptyState;

    const stored = JSON.parse(raw) as Partial<Credentials>;
    if (!stored.token || !stored.userId || !stored.expiresAt) return emptyState;
    if (stored.expiresAt <= Date.now()) return emptyState;

    return { ...emptyState, token: stored.token, userId: stored.userId, expiresAt: stored.expiresAt };
  } catch {
    // A blocked or corrupt localStorage must not stop the app booting signed out.
    return emptyState;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: emptyState,
  reducers: {
    credentialsReceived(state, action: PayloadAction<Credentials>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.expiresAt = action.payload.expiresAt;
    },
    loggedOut(state) {
      state.token = null;
      state.userId = null;
      state.expiresAt = null;
    },
    redirectPathSet(state, action: PayloadAction<string>) {
      state.redirectPath = action.payload;
    },
  },
  selectors: {
    selectToken: (state) => state.token,
    selectUserId: (state) => state.userId,
    selectIsAuthenticated: (state) => state.token !== null,
    selectRedirectPath: (state) => state.redirectPath,
  },
});

export const { credentialsReceived, loggedOut, redirectPathSet } = authSlice.actions;
export const { selectToken, selectUserId, selectIsAuthenticated, selectRedirectPath } =
  authSlice.selectors;
export const authReducer = authSlice.reducer;
