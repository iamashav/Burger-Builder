import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('adds the current drink to the order and sends a visitor to sign in at checkout', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(screen.getByRole('button', { name: 'Add to order' }));
    await user.click(screen.getByRole('button', { name: 'Add to order' }));

    const cart = screen.getByRole('dialog', { name: 'Your order' });
    expect(within(cart).getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open order, 2 drinks' })).toBeInTheDocument();

    await user.click(within(cart).getByRole('button', { name: 'Sign in to check out' }));
    expect(await screen.findByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
  });

  it('keeps a signed-out visitor away from the orders route', async () => {
    renderWithProviders(<App />, { route: '/orders' });

    // RequireAuth redirects to /auth, which renders the sign-up form.
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument(),
    );
  });
});
