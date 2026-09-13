import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DEFAULT_DRINK, MAX_LAYERS } from '../data/menu';
import { priceOf } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { decodeDrink } from '../lib/shareCode';
import { createStore } from '../store';
import { drinkLoaded, selectCanUndo, selectDrink } from '../store/drinkSlice';
import { BuilderPage } from '../routes/BuilderPage';
import type { Drink } from '../types/drink';
import { renderWithProviders } from './renderWithProviders';

function renderBuilder(drink: Drink = DEFAULT_DRINK) {
  const store = createStore();
  store.dispatch(drinkLoaded(drink));
  return renderWithProviders(<BuilderPage />, { store });
}

const layerNames = () =>
  within(screen.getByRole('region', { name: 'Layers, top to bottom' }))
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('aria-label'));

describe('<BuilderPage />', () => {
  it('adds a topping, reorders it, and undoes both steps', async () => {
    const user = userEvent.setup();
    const { store } = renderBuilder({ ...DEFAULT_DRINK, layers: ['tapioca'] });

    await user.click(screen.getByRole('tab', { name: 'Toppings' }));
    await user.click(screen.getByRole('button', { name: 'Add Cheese foam' }));
    expect(selectDrink(store.getState()).layers).toEqual(['tapioca', 'foam']);

    await user.click(screen.getByRole('button', { name: 'Move Cheese foam (layer 2) down' }));
    expect(selectDrink(store.getState()).layers).toEqual(['foam', 'tapioca']);

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(selectDrink(store.getState()).layers).toEqual(['tapioca', 'foam']);

    await user.keyboard('{Control>}z{/Control}');
    expect(selectDrink(store.getState()).layers).toEqual(['tapioca']);

    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(selectDrink(store.getState()).layers).toEqual(['tapioca', 'foam']);
  });

  it('lists layers top-first and reorders them from the keyboard', async () => {
    const user = userEvent.setup();
    const { store } = renderBuilder({ ...DEFAULT_DRINK, layers: ['tapioca', 'grass', 'foam'] });

    expect(layerNames()).toEqual([
      'Cheese foam, layer 3 of 3',
      'Grass jelly, layer 2 of 3',
      'Tapioca pearls, layer 1 of 3',
    ]);

    const pearls = screen.getByRole('listitem', { name: 'Tapioca pearls, layer 1 of 3' });
    pearls.focus();
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');

    expect(selectDrink(store.getState()).layers).toEqual(['grass', 'tapioca', 'foam']);
    expect(document.activeElement).toHaveAccessibleName('Tapioca pearls, layer 2 of 3');
  });

  it('stops adding toppings once the cup is full', async () => {
    const user = userEvent.setup();
    renderBuilder({ ...DEFAULT_DRINK, layers: Array(MAX_LAYERS).fill('tapioca') });

    await user.click(screen.getByRole('tab', { name: 'Toppings' }));

    expect(screen.getByRole('button', { name: 'Add Red bean' })).toBeDisabled();
    expect(screen.getByText(/The cup is full/)).toBeInTheDocument();
  });

  it('blocks options that break an active dietary filter', async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole('button', { name: 'Vegan' }));
    expect(screen.getByRole('status')).toHaveTextContent('Swap out: Whole milk');

    await user.click(screen.getByRole('tab', { name: 'Milk' }));
    await user.click(screen.getByRole('radio', { name: /Oat milk/ }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Whole milk/ })).toBeDisabled();
  });

  it('prices the drink as it changes', async () => {
    const user = userEvent.setup();
    renderBuilder({ ...DEFAULT_DRINK, layers: [] });

    expect(screen.getByText(formatPrice(priceOf({ ...DEFAULT_DRINK, layers: [] })))).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Large/ }));

    expect(
      screen.getByText(formatPrice(priceOf({ ...DEFAULT_DRINK, size: 'large', layers: [] }))),
    ).toBeInTheDocument();
  });
});

describe('<BuilderPage /> share links', () => {
  it('loads a drink from the link as an undoable step', async () => {
    const user = userEvent.setup();
    const store = createStore();
    renderWithProviders(<BuilderPage />, { store, route: '/?d=L.mat.oat.25.no.pop-fom' });

    expect(selectDrink(store.getState())).toEqual({
      size: 'large',
      tea: 'matcha',
      milk: 'oat',
      sweetness: 25,
      ice: 'none',
      layers: ['popping', 'foam'],
    });
    expect(screen.getByRole('status')).toHaveTextContent('Loaded a shared drink');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(selectDrink(store.getState())).toEqual(DEFAULT_DRINK);
    expect(selectCanUndo(store.getState())).toBe(false);
  });

  it('leaves the drink alone when the link is not a real drink', () => {
    const store = createStore();
    renderWithProviders(<BuilderPage />, { store, route: '/?d=R.blk.whl.50.reg.cheese' });

    expect(selectDrink(store.getState())).toEqual(DEFAULT_DRINK);
    expect(screen.getByRole('status')).toHaveTextContent('does not match anything on the menu');
  });

  it('copies a link that rebuilds the current drink', async () => {
    const user = userEvent.setup();
    const drink: Drink = { ...DEFAULT_DRINK, tea: 'taro', layers: ['redbean'] };
    renderBuilder(drink);

    await user.click(screen.getByRole('button', { name: 'Share this drink' }));

    const copied = await navigator.clipboard.readText();
    expect(decodeDrink(new URL(copied).searchParams.get('d') ?? '')).toEqual(drink);
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument();
  });
});
