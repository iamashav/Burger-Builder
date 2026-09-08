import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BuildControls } from '../components/BuildControls/BuildControls';
import { EMPTY_INGREDIENTS } from '../data/ingredients';

function renderControls(overrides: Partial<Parameters<typeof BuildControls>[0]> = {}) {
  const props = {
    ingredients: EMPTY_INGREDIENTS,
    price: 4,
    purchasable: false,
    isAuthenticated: false,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onOrder: vi.fn(),
    ...overrides,
  };
  render(<BuildControls {...props} />);
  return props;
}

describe('<BuildControls />', () => {
  it('disables the remove button for an ingredient at zero', () => {
    renderControls({ ingredients: { ...EMPTY_INGREDIENTS, meat: 1 } });

    expect(screen.getByRole('button', { name: 'Remove one salad' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove one meat' })).toBeEnabled();
  });

  it('blocks ordering until the burger has something on it', () => {
    renderControls({ purchasable: false });
    expect(screen.getByRole('button', { name: /sign in to order/i })).toBeDisabled();
  });

  it('labels the order button by auth state', () => {
    const { unmount } = render(
      <BuildControls
        ingredients={EMPTY_INGREDIENTS}
        price={4}
        purchasable
        isAuthenticated={false}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onOrder={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /sign in to order/i })).toBeEnabled();
    unmount();

    renderControls({ purchasable: true, isAuthenticated: true });
    expect(screen.getByRole('button', { name: /order now/i })).toBeEnabled();
  });

  it('reports the ingredient the user acted on', async () => {
    const user = userEvent.setup();
    const props = renderControls({ ingredients: { ...EMPTY_INGREDIENTS, bacon: 1 } });

    await user.click(screen.getByRole('button', { name: 'Add one cheese' }));
    await user.click(screen.getByRole('button', { name: 'Remove one bacon' }));

    expect(props.onAdd).toHaveBeenCalledWith('cheese');
    expect(props.onRemove).toHaveBeenCalledWith('bacon');
  });
});
