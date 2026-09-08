import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore, type AppStore } from '../store';
import type { AuthState } from '../store/authSlice';

const SIGNED_OUT: AuthState = {
  token: null,
  userId: null,
  expiresAt: null,
  redirectPath: '/',
};

export const SIGNED_IN: AuthState = {
  token: 'test-token',
  userId: 'test-user',
  expiresAt: Date.now() + 60_000,
  redirectPath: '/',
};

export interface RenderOptions {
  auth?: AuthState;
  route?: string;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { auth = SIGNED_OUT, route = '/', store = createStore(auth) }: RenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}
