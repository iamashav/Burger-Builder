import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

function stubIngredientsFetch() {
  const fetchSpy = vi.fn(async () =>
    new Response(JSON.stringify({ salad: 0, bacon: 0, cheese: 0, meat: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('<App />', () => {
  beforeEach(stubIngredientsFetch);
  afterEach(() => vi.unstubAllGlobals());

  it('renders the builder on the index route', async () => {
    renderWithProviders(<App />);

    expect(await screen.findByRole('heading', { name: 'Build your burger' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Add one meat' })).toBeInTheDocument();
  });

  it('shows signed-out navigation to visitors', async () => {
    renderWithProviders(<App />);

    await screen.findByRole('heading', { name: 'Build your burger' });
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];

    expect(nav).toHaveTextContent('Sign in');
    expect(nav).not.toHaveTextContent('Orders');
  });

  it('shows orders and logout once signed in', async () => {
    renderWithProviders(<App />, { auth: SIGNED_IN });

    await screen.findByRole('heading', { name: 'Build your burger' });
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];

    expect(nav).toHaveTextContent('Orders');
    expect(nav).toHaveTextContent('Log out');
    expect(nav).not.toHaveTextContent('Sign in');
  });

  it('keeps a signed-out visitor away from the orders route', async () => {
    renderWithProviders(<App />, { route: '/orders' });

    // RequireAuth redirects to /auth, which renders the sign-up form.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument(),
    );
  });
});
