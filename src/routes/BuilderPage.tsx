import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { DietaryFilters } from '../components/DietaryFilters/DietaryFilters';
import { DrinkCup } from '../components/DrinkCup/DrinkCup';
import { LayerStack } from '../components/LayerStack/LayerStack';
import { NutritionPanel } from '../components/NutritionPanel/NutritionPanel';
import { OptionPanel } from '../components/OptionPanel/OptionPanel';
import { describeDrink } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { useUndoShortcuts } from '../lib/useUndoShortcuts';
import { redirectPathSet, selectIsAuthenticated } from '../store/authSlice';
import {
  drinkRedone,
  drinkReset,
  drinkUndone,
  iceSet,
  layerMoved,
  milkChosen,
  selectCanRedo,
  selectCanUndo,
  selectDrink,
  selectDrinkPrice,
  selectNutrition,
  sizeChosen,
  sweetnessSet,
  teaChosen,
  toppingAdded,
  toppingRemoved,
} from '../store/drinkSlice';
import { filterToggled, selectActiveFilters } from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function BuilderPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const drink = useAppSelector(selectDrink);
  const price = useAppSelector(selectDrinkPrice);
  const nutrition = useAppSelector(selectNutrition);
  const filters = useAppSelector(selectActiveFilters);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const undo = useCallback(() => dispatch(drinkUndone()), [dispatch]);
  const redo = useCallback(() => dispatch(drinkRedone()), [dispatch]);
  useUndoShortcuts(undo, redo);

  const handleOrder = () => {
    if (isAuthenticated) {
      navigate('/checkout');
      return;
    }
    dispatch(redirectPathSet('/checkout'));
    navigate('/auth');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start">
      <div className="flex flex-col items-center gap-5 lg:sticky lg:top-20">
        <h1 className="sr-only">Build your drink</h1>
        <DrinkCup drink={drink} className="h-[300px] w-auto sm:h-[380px] lg:h-[440px]" />

        <p className="text-center font-mono text-xs text-smoke">{describeDrink(drink).join(' · ')}</p>

        <div className="flex gap-2">
          <Button variant="ghost" disabled={!canUndo} onClick={undo} aria-keyshortcuts="Control+Z">
            Undo
          </Button>
          <Button
            variant="ghost"
            disabled={!canRedo}
            onClick={redo}
            aria-keyshortcuts="Control+Shift+Z"
          >
            Redo
          </Button>
          <Button variant="danger" onClick={() => dispatch(drinkReset())}>
            Start over
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <DietaryFilters
          drink={drink}
          active={filters}
          onToggle={(filter) => dispatch(filterToggled(filter))}
        />

        <OptionPanel
          drink={drink}
          filters={filters}
          onSize={(size) => dispatch(sizeChosen(size))}
          onTea={(tea) => dispatch(teaChosen(tea))}
          onMilk={(milk) => dispatch(milkChosen(milk))}
          onSweetness={(sweetness) => dispatch(sweetnessSet(sweetness))}
          onIce={(ice) => dispatch(iceSet(ice))}
          onAddTopping={(topping) => dispatch(toppingAdded(topping))}
        />

        <LayerStack
          layers={drink.layers}
          onMove={(from, to) => dispatch(layerMoved({ from, to }))}
          onRemove={(index) => dispatch(toppingRemoved(index))}
        />

        <NutritionPanel nutrition={nutrition} />

        <div className="flex items-center justify-between gap-4 bg-ash p-5 ring-1 ring-flood/30">
          <p className="m-0">
            <span className="section-label block">Price</span>
            <span className="font-display text-3xl text-flood tabular-nums">
              {formatPrice(price)}
            </span>
          </p>
          <Button className="py-3.5" onClick={handleOrder}>
            {isAuthenticated ? 'Order this drink' : 'Sign in to order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
