import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthPage } from '../routes/AuthPage';
import { renderWithProviders } from './renderWithProviders';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<AuthPage />', () => {
  // Regression guard: the previous form declared an isEmail rule that was never
  // implemented, so a malformed address went straight to Firebase.
  it('does not submit a malformed email address', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const user = userEvent.setup();

    renderWithProviders(<AuthPage />, { route: '/auth' });

    await user.type(screen.getByLabelText('Email'), 'notanemail');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('does not submit a password shorter than six characters', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const user = userEvent.setup();

    renderWithProviders(<AuthPage />, { route: '/auth' });

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText('Passwords must be at least 6 characters.'),
    ).toBeInTheDocument();
  });

  it('ties every field to a real label', () => {
    renderWithProviders(<AuthPage />, { route: '/auth' });

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('switches between sign up and sign in', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />, { route: '/auth' });

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'I already have an account' }));

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });
});
