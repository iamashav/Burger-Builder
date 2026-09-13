import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { DietaryFilters } from '../components/DietaryFilters/DietaryFilters';
import { DrinkCup } from '../components/DrinkCup/DrinkCup';
import { LayerStack } from '../components/LayerStack/LayerStack';
import { NutritionPanel } from '../components/NutritionPanel/NutritionPanel';
import { OptionPanel } from '../components/OptionPanel/OptionPanel';
import { ShareButton } from '../components/ShareButton/ShareButton';
import { cn } from '../lib/cn';
import { describeDrink } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { SHARE_PARAM, decodeDrink, shareUrl } from '../lib/shareCode';
import { useUndoShortcuts } from '../lib/useUndoShortcuts';
import { drinkAddedToCart } from '../store/cartSlice';
import {
  drinkLoaded,
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

  const drink = useAppSelector(selectDrink);
  const price = useAppSelector(selectDrinkPrice);
  const nutrition = useAppSelector(selectNutrition);
  const filters = useAppSelector(selectActiveFilters);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  const undo = useCallback(() => dispatch(drinkUndone()), [dispatch]);
  const redo = useCallback(() => dispatch(drinkRedone()), [dispatch]);
  useUndoShortcuts(undo, redo);

  const [searchParams, setSearchParams] = useSearchParams();
  const sharedCode = searchParams.get(SHARE_PARAM);
  const [shareNotice, setShareNotice] = useState<'loaded' | 'invalid' | null>(null);
  // StrictMode runs this effect twice before the param is gone from the URL; without the
  // guard a shared drink would be loaded twice and cost an extra undo step.
  const handledCode = useRef<string | null>(null);

  useEffect(() => {
    if (sharedCode === null || handledCode.current === sharedCode) return;
    handledCode.current = sharedCode;

    const shared = decodeDrink(sharedCode);
    if (shared) dispatch(drinkLoaded(shared));
    setShareNotice(shared ? 'loaded' : 'invalid');

    // Dropped from the URL so a reload does not overwrite edits made since.
    setSearchParams(
      (params) => {
        params.delete(SHARE_PARAM);
        return params;
      },
      { replace: true },
    );
  }, [sharedCode, dispatch, setSearchParams]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start">
      <div className="flex flex-col items-center gap-5 lg:sticky lg:top-20">
        <h1 className="sr-only">Build your drink</h1>

        {shareNotice && (
          <p
            role="status"
            className={cn(
              'w-full max-w-md border px-3 py-2 text-center text-sm',
              shareNotice === 'loaded' ? 'border-flood/40 text-flood' : 'border-danger/40 text-danger',
            )}
          >
            {shareNotice === 'loaded'
              ? 'Loaded a shared drink. Undo takes you back to what you had.'
              : 'That share link does not match anything on the menu, so nothing changed.'}
          </p>
        )}

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

        <ShareButton url={shareUrl(drink)} label="Share this drink" />
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
          <Button className="py-3.5" onClick={() => dispatch(drinkAddedToCart(drink))}>
            Add to order
          </Button>
        </div>
      </div>
    </div>
  );
}
