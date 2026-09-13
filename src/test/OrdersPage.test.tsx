import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DRINK } from '../data/menu';
import App from '../App';
import { OrdersPage } from '../routes/OrdersPage';
import { createStore } from '../store';
import { selectDrink } from '../store/drinkSlice';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

afterEach(() => vi.unstubAllGlobals());

function stubOrders(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  );
}

const order = (createdAt: number, fulfilment: object) => ({
  lines: [{ drink: { ...DEFAULT_DRINK, layers: undefined }, quantity: 2, unitPrice: 6.2 }],
  total: 12.4,
  fulfilment,
  contact: { name: 'Ada', email: 'ada@example.com', phone: '0123456789' },
  userId: SIGNED_IN.userId,
  createdAt,
});

describe('<OrdersPage />', () => {
  it('lists valid orders newest first and skips records it cannot read', async () => {
    stubOrders({
      older: order(1_000, { method: 'pickup', time: 'asap' }),
      malformed: { total: 4.5, userId: SIGNED_IN.userId },
      offMenu: {
        ...order(1_500, { method: 'pickup', time: 'asap' }),
        lines: [{ drink: { ...DEFAULT_DRINK, tea: 'coffee' }, quantity: 1, unitPrice: 5 }],
      },
      newer: order(2_000, {
        method: 'delivery',
        street: '1 High St',
        city: 'Leeds',
        postcode: 'LS1',
      }),
    });

    renderWithProviders(<OrdersPage />, { auth: SIGNED_IN, route: '/orders' });

    const fulfilments = await screen.findAllByText(/^(Pickup|Delivery)/);
    expect(fulfilments.map((node) => node.textContent)).toEqual([
      'Delivery to 1 High St, Leeds',
      'Pickup, as soon as possible',
    ]);
    // The database drops empty arrays; a drink without toppings must still render.
    expect(screen.getAllByText(/2 × Regular Assam black/)).toHaveLength(2);
  });

  it('says so when there are no orders', async () => {
    stubOrders(null);
    renderWithProviders(<OrdersPage />, { auth: SIGNED_IN, route: '/orders' });
    expect(await screen.findByText(/No orders yet/)).toBeInTheDocument();
  });
});

describe('<OrdersPage /> make again', () => {
  it('loads an ordered drink back into the builder', async () => {
    const shared = { ...DEFAULT_DRINK, tea: 'oolong', layers: ['grass'] };
    stubOrders({
      only: {
        ...order(1_000, { method: 'pickup', time: 'asap' }),
        lines: [{ drink: shared, quantity: 1, unitPrice: 6 }],
      },
    });
    const user = userEvent.setup();
    const store = createStore(SIGNED_IN);
    renderWithProviders(<App />, { store, route: '/orders' });

    await user.click(await screen.findByRole('button', { name: /Make this again/ }));

    expect(await screen.findByRole('heading', { name: 'Build your drink' })).toBeInTheDocument();
    expect(selectDrink(store.getState())).toEqual(shared);
  });
});
