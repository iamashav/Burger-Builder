import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { DEFAULT_DRINK } from '../data/menu';
import { priceOf } from '../lib/drink';
import { createStore } from '../store';
import { drinkLoaded, selectCanUndo, selectDrink } from '../store/drinkSlice';
import type { Drink } from '../types/drink';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

afterEach(() => vi.unstubAllGlobals());

const ORDERED: Drink = { ...DEFAULT_DRINK, tea: 'matcha', milk: 'oat', layers: ['grass', 'foam'] };

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

// The route is lazily loaded, so the Suspense fallback renders first.
async function awaitForm() {
  await screen.findByRole('heading', { name: 'Where is it going?' });
}

async function fillOrderForm(user: ReturnType<typeof userEvent.setup>) {
  await awaitForm();
  await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Street'), '12 Analytical Way');
  await user.type(screen.getByLabelText('Postcode'), '12345');
  await user.type(screen.getByLabelText('Country'), 'United Kingdom');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
}

describe('<ContactDataPage />', () => {
  function renderWithDrink() {
    const store = createStore(SIGNED_IN);
    store.dispatch(drinkLoaded(ORDERED));
    return renderWithProviders(<App />, { store, route: '/checkout/contact-data' });
  }

  it('lands on the orders page after a successful order', async () => {
    stubOrderEndpoints();
    const user = userEvent.setup();
    renderWithDrink();

    await fillOrderForm(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByRole('heading', { name: 'Your orders' })).toBeInTheDocument();
  });

  it('does not send an order while a required field is empty', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderWithDrink();
    await awaitForm();

    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Where is it going?' })).toBeInTheDocument();
  });

  it('sends the drink, the derived price and the user id', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderWithDrink();

    await fillOrderForm(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    await screen.findByRole('heading', { name: 'Your orders' });

    const sent = await findPostRequest(fetchSpy).clone().json();
    expect(sent.drink).toEqual(ORDERED);
    expect(sent.price).toBe(priceOf(ORDERED));
    expect(sent.userId).toBe(SIGNED_IN.userId);
    expect(sent.orderData.email).toBe('ada@example.com');
  });

  it('starts a fresh drink with no undo history after ordering', async () => {
    stubOrderEndpoints();
    const user = userEvent.setup();
    const { store } = renderWithDrink();

    await fillOrderForm(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));
    await screen.findByRole('heading', { name: 'Your orders' });

    expect(selectDrink(store.getState())).toEqual(DEFAULT_DRINK);
    expect(selectCanUndo(store.getState())).toBe(false);
  });

  it('sends the auth token as the RTDB auth query parameter', async () => {
    const fetchSpy = stubOrderEndpoints();
    const user = userEvent.setup();
    renderWithDrink();

    await fillOrderForm(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    await screen.findByRole('heading', { name: 'Your orders' });

    expect(findPostRequest(fetchSpy).url).toContain(`auth=${SIGNED_IN.token}`);
  });
});
