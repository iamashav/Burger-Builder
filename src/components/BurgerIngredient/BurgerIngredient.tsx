import type { Ingredient } from '../../types/burger';

export type BurgerLayer = Ingredient | 'bread-top' | 'bread-bottom';

const LAYER_CLASS: Record<Exclude<BurgerLayer, 'bread-top'>, string> = {
  'bread-bottom': 'burger-bread-bottom',
  meat: 'burger-meat',
  cheese: 'burger-cheese',
  salad: 'burger-salad',
  bacon: 'burger-bacon',
};

export function BurgerIngredient({ type }: { type: BurgerLayer }) {
  if (type === 'bread-top') {
    return (
      <div className="burger-bread-top">
        <div className="burger-seed burger-seed-a" />
        <div className="burger-seed burger-seed-b" />
      </div>
    );
  }

  return <div className={LAYER_CLASS[type]} />;
}
