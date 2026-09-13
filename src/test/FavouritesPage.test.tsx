import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { DEFAULT_DRINK } from '../data/menu';
import { createStore } from '../store';
import { selectCartItems } from '../store/cartSlice';
import { drinkLoaded, selectDrink } from '../store/drinkSlice';
import type { Drink } from '../types/drink';
import { renderWithProviders, SIGNED_IN } from './renderWithProviders';

afterEach(() => vi.unstubAllGlobals());

const TARO: Drink = { ...DEFAULT_DRINK, tea: 'taro', milk: 'oat', layers: ['pudding'] };

const STORED = {
  older: { name: 'Plain black', drink: { ...DEFAULT_DRINK, layers: undefined }, createdAt: 1 },
  newer: { name: 'Taro treat', drink: TARO, createdAt: 2 },
  broken: { name: 'Mystery', drink: { tea: 'coffee' }, createdAt: 3 },
};

function stubDatabase(favourites: unknown = STORED) {
  const fetchSpy = vi.fn(async (request: Request) => {
    const bodies: Record<string, unknown> = { GET: favourites, POST: { name: '-fav' } };
    return new Response(JSON.stringify(bodies[request.method] ?? null), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

const requests = (fetchSpy: ReturnType<typeof stubDatabase>, method: string) =>
  fetchSpy.mock.calls.map(([request]) => request).filter((request) => request.method === method);

describe('<FavouritesPage />', () => {
  it('lists readable favourites newest first', async () => {
    stubDatabase();
    renderWithProviders(<App />, { auth: SIGNED_IN, route: '/favourites' });

    const items = await screen.findAllByRole('listitem', { name: /Plain black|Taro treat/ });
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual(['Taro treat', 'Plain black']);
    expect(screen.queryByText('Mystery')).not.toBeInTheDocument();
  });

  it('adds a favourite to the order or loads it for editing', async () => {
    stubDatabase();
    const user = userEvent.setup();
    const store = createStore(SIGNED_IN);
    renderWithProviders(<App />, { store, route: '/favourites' });

    const taro = await screen.findByRole('listitem', { name: 'Taro treat' });
    await user.click(within(taro).getByRole('button', { name: 'Add to order' }));
    expect(selectCartItems(store.getState())).toMatchObject([{ drink: TARO, quantity: 1 }]);

    await user.click(within(taro).getByRole('button', { name: 'Edit' }));
    expect(await screen.findByRole('heading', { name: 'Build your drink' })).toBeInTheDocument();
    expect(selectDrink(store.getState())).toEqual(TARO);
  });

  it('deletes only the chosen favourite, under the signed-in user', async () => {
    const fetchSpy = stubDatabase();
    const user = userEvent.setup();
    renderWithProviders(<App />, { auth: SIGNED_IN, route: '/favourites' });

    await user.click(await screen.findByRole('button', { name: 'Delete Taro treat' }));

    await waitFor(() => expect(requests(fetchSpy, 'DELETE')).toHaveLength(1));
    const url = new URL(requests(fetchSpy, 'DELETE')[0].url);
    expect(url.pathname).toMatch(new RegExp(`/favourites/${SIGNED_IN.userId}/newer\\.json$`));
    expect(url.searchParams.get('auth')).toBe(SIGNED_IN.token);
  });

  it('keeps signed-out visitors out', async () => {
    renderWithProviders(<App />, { route: '/favourites' });
    expect(await screen.findByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
  });
});

describe('saving a favourite from the builder', () => {
  it('saves the current drink under a chosen name', async () => {
    const fetchSpy = stubDatabase({});
    const user = userEvent.setup();
    const store = createStore(SIGNED_IN);
    store.dispatch(drinkLoaded(TARO));
    renderWithProviders(<App />, { store });

    await user.click(screen.getByRole('button', { name: 'Save to favourites' }));
    const name = screen.getByLabelText('Name');
    expect(name).toHaveValue('Taro with oat milk');

    await user.clear(name);
    await user.type(name, 'Friday taro');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Saved “Friday taro” to your favourites.')).toBeInTheDocument();

    const [post] = requests(fetchSpy, 'POST');
    expect(new URL(post.url).pathname).toMatch(new RegExp(`/favourites/${SIGNED_IN.userId}\\.json$`));
    expect(await post.clone().json()).toEqual({
      name: 'Friday taro',
      drink: TARO,
      createdAt: { '.sv': 'timestamp' },
    });
  });

  it('refuses a blank name', async () => {
    const fetchSpy = stubDatabase({});
    const user = userEvent.setup();
    renderWithProviders(<App />, { auth: SIGNED_IN });

    await user.click(screen.getByRole('button', { name: 'Save to favourites' }));
    await user.clear(screen.getByLabelText('Name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(requests(fetchSpy, 'POST')).toHaveLength(0);
    expect(screen.getByText(/Give it a name/)).toBeInTheDocument();
  });

  it('asks visitors to sign in first', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('button', { name: 'Sign in to save' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save to favourites' })).not.toBeInTheDocument();
  });
});
