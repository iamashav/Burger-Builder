import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

describe('<App />', () => {
  it('renders the builder on the index route', () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('heading', { name: 'Build your drink' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Assam black/ })).toBeInTheDocument();
  });

  it('shows signed-out navigation to visitors', () => {
    renderWithProviders(<App />);

    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];

    expect(nav).toHaveTextContent('Sign in');
    expect(nav).not.toHaveTextContent('Orders');
  });

  it('shows orders and logout once signed in', () => {
    renderWithProviders(<App />, { auth: SIGNED_IN });

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
