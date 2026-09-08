import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Burger } from '../components/Burger/Burger';
import { EMPTY_INGREDIENTS } from '../data/ingredients';

describe('<Burger />', () => {
  it('prompts the user when there is nothing on the bun', () => {
    render(<Burger ingredients={EMPTY_INGREDIENTS} />);
    expect(screen.getByText('Start adding ingredients')).toBeInTheDocument();
  });

  it('renders one layer element per ingredient, plus both bun halves', () => {
    render(<Burger ingredients={{ ...EMPTY_INGREDIENTS, meat: 2, cheese: 1 }} />);

    const burger = screen.getByTestId('burger');
    expect(burger.querySelectorAll('.burger-meat')).toHaveLength(2);
    expect(burger.querySelectorAll('.burger-cheese')).toHaveLength(1);
    expect(burger.querySelectorAll('.burger-salad')).toHaveLength(0);
    expect(burger.querySelectorAll('.burger-bread-top')).toHaveLength(1);
    expect(burger.querySelectorAll('.burger-bread-bottom')).toHaveLength(1);
    expect(screen.queryByText('Start adding ingredients')).not.toBeInTheDocument();
  });
});
