import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DRINK } from '../data/menu';
import { OrdersPage } from '../routes/OrdersPage';
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
      legacy: { ingredients: { salad: 1 }, price: 4.5, userId: SIGNED_IN.userId },
      newer: order(2_000, { method: 'delivery', street: '1 High St', city: 'Leeds', postcode: 'LS1' }),
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
