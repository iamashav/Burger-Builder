import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { DEFAULT_DRINK } from '../data/menu';
import { priceOf } from '../lib/drink';
import { createStore } from '../store';
import { cartClosed, drinkAddedToCart, selectCartItems } from '../store/cartSlice';
import type { Drink } from '../types/drink';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

afterEach(() => vi.unstubAllGlobals());

const MATCHA: Drink = { ...DEFAULT_DRINK, tea: 'matcha', milk: 'oat', layers: ['grass', 'foam'] };

// fetchBaseQuery calls fetch with a single Request object, so the method, url and body
// all have to be read off that rather than from an init argument.
function stubOrderEndpoints() {
  const fetchSpy = vi.fn(async (request: Request) => {
    const body = request.method === 'POST' ? { name: '-order-id' } : {};
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

function findPostRequest(fetchSpy: ReturnType<typeof stubOrderEndpoints>) {
  const request = fetchSpy.mock.calls.map(([call]) => call).find((call) => call.method === 'POST');
  if (!request) throw new Error('No POST request was made');
  return request;
}

function renderCheckout() {
  const store = createStore(SIGNED_IN);
  store.dispatch(drinkAddedToCart(DEFAULT_DRINK));
  store.dispatch(drinkAddedToCart(MATCHA));
  store.dispatch(drinkAddedToCart(MATCHA));
  store.dispatch(cartClosed());
  return renderWithProviders(<App />, { store, route: '/checkout' });
}

// The route is lazily loaded, so the Suspense fallback renders first.
async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: 'Checkout' });
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Phone'), '+44 7700 900123');
}

describe('<CheckoutPage />', () => {
  it('places a pickup order for every line and lands on the orders page', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    const { store } = renderCheckout();

    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /Place order/ }));

    expect(await screen.findByRole('heading', { name: 'Your orders' })).toBeInTheDocument();

    const sent = await findPostRequest(fetchSpy).clone().json();
    expect(sent.lines).toEqual([
      { drink: DEFAULT_DRINK, quantity: 1, unitPrice: priceOf(DEFAULT_DRINK) },
      { drink: MATCHA, quantity: 2, unitPrice: priceOf(MATCHA) },
    ]);
    expect(sent.total).toBeCloseTo(priceOf(DEFAULT_DRINK) + priceOf(MATCHA) * 2, 10);
    expect(sent.fulfilment).toEqual({ method: 'pickup', time: 'asap' });
    expect(sent.contact).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+44 7700 900123',
    });
    expect(sent.userId).toBe(SIGNED_IN.userId);
    expect(sent.createdAt).toEqual({ '.sv': 'timestamp' });
    expect(selectCartItems(store.getState())).toEqual([]);
  });

  it('asks for an address only for delivery, and requires it', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderCheckout();

    await fillContact(user);
    expect(screen.queryByLabelText('Street address')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Delivery/ }));
    expect(screen.queryByLabelText('Pickup time')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Place order/ }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid postcode.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Street address'), '12 Analytical Way');
    await user.type(screen.getByLabelText('City'), 'London');
    await user.type(screen.getByLabelText('Postcode'), 'SW1A 1AA');
    await user.click(screen.getByRole('button', { name: /Place order/ }));

    await screen.findByRole('heading', { name: 'Your orders' });
    const sent = await findPostRequest(fetchSpy).clone().json();
    expect(sent.fulfilment).toEqual({
      method: 'delivery',
      street: '12 Analytical Way',
      city: 'London',
      postcode: 'SW1A 1AA',
    });
  });

  it('does not send an order with an invalid phone number', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderCheckout();

    await screen.findByRole('heading', { name: 'Checkout' });
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Phone'), 'call me');
    await user.click(screen.getByRole('button', { name: /Place order/ }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/Enter a phone number/)).toBeInTheDocument();
  });

  it('sends the auth token as the RTDB auth query parameter', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderCheckout();

    await fillContact(user);
    await user.click(screen.getByRole('button', { name: /Place order/ }));
    await screen.findByRole('heading', { name: 'Your orders' });

    expect(findPostRequest(fetchSpy).url).toContain(`auth=${SIGNED_IN.token}`);
  });

  it('sends an empty cart back to the builder', async () => {
    renderWithProviders(<App />, { auth: SIGNED_IN, route: '/checkout' });
    expect(await screen.findByRole('heading', { name: 'Build your drink' })).toBeInTheDocument();
  });
});
