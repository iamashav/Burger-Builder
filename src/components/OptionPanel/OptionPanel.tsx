import { useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  FILTER_LABELS,
  ICE_LABELS,
  MAX_LAYERS,
  MILK_OPTIONS,
  SIZE_OPTIONS,
  TEA_OPTIONS,
  TOPPING_OPTIONS,
} from '../../data/menu';
import { cn } from '../../lib/cn';
import { itemConflicts } from '../../lib/drink';
import { formatPrice, formatSurcharge } from '../../lib/format';
import {
  ICE_LEVELS,
  MILKS,
  SIZES,
  SWEETNESS_LEVELS,
  TEAS,
  TOPPINGS,
  type DietaryFilter,
  type Drink,
  type Ice,
  type MenuItem,
  type Milk,
  type Size,
  type Sweetness,
  type Tea,
  type Topping,
} from '../../types/drink';
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup';

export interface OptionPanelProps {
  drink: Drink;
  filters: DietaryFilter[];
  onSize: (size: Size) => void;
  onTea: (tea: Tea) => void;
  onMilk: (milk: Milk) => void;
  onSweetness: (sweetness: Sweetness) => void;
  onIce: (ice: Ice) => void;
  onAddTopping: (topping: Topping) => void;
}

const TABS = [
  { id: 'base', label: 'Tea' },
  { id: 'milk', label: 'Milk' },
  { id: 'sweet', label: 'Sugar & ice' },
  { id: 'toppings', label: 'Toppings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function blockedBy(item: MenuItem, filters: DietaryFilter[]) {
  const conflicts = itemConflicts(item, filters);
  if (conflicts.length === 0) return undefined;
  return `Not ${conflicts.map((filter) => FILTER_LABELS[filter].toLowerCase()).join(' or ')}`;
}

export function OptionPanel({
  drink,
  filters,
  onSize,
  onTea,
  onMilk,
  onSweetness,
  onIce,
  onAddTopping,
}: OptionPanelProps) {
  const baseId = useId();
  const [active, setActive] = useState<TabId>('base');
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const handleTabKey = (event: KeyboardEvent) => {
    const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const index = TABS.findIndex((tab) => tab.id === active);
    const next = TABS[(index + offset + TABS.length) % TABS.length].id;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const cupFull = drink.layers.length >= MAX_LAYERS;
  const sweetnessIndex = SWEETNESS_LEVELS.indexOf(drink.sweetness);

  return (
    <section className="bg-ash ring-1 ring-smoke/15" aria-label="Drink options">
      <div role="tablist" aria-label="Option groups" className="flex border-b border-smoke/15">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}-tab`}
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-${tab.id}-panel`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={handleTabKey}
            className={cn(
              'flex-1 cursor-pointer border-b-2 px-2 py-3 font-mono text-[0.6875rem] tracking-[0.12em] uppercase transition-colors',
              active === tab.id
                ? 'border-flood text-flood'
                : 'border-transparent text-smoke hover:text-bone',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-${active}-panel`}
        aria-labelledby={`${baseId}-${active}-tab`}
        className="p-5"
      >
        {active === 'base' && (
          <>
            <ChoiceGroup
              legend="Cup size"
              value={drink.size}
              onChange={onSize}
              choices={SIZES.map((size) => ({
                value: size,
                label: SIZE_OPTIONS[size].label,
                detail: `${SIZE_OPTIONS[size].ml} ml · ${formatPrice(SIZE_OPTIONS[size].price)}`,
              }))}
            />
            <ChoiceGroup
              legend="Tea base"
              value={drink.tea}
              onChange={onTea}
              columns={3}
              choices={TEAS.map((tea) => ({
                value: tea,
                label: TEA_OPTIONS[tea].label,
                detail: formatSurcharge(TEA_OPTIONS[tea].price),
                swatch: TEA_OPTIONS[tea].colour,
                blockedBy: blockedBy(TEA_OPTIONS[tea], filters),
              }))}
            />
          </>
        )}

        {active === 'milk' && (
          <ChoiceGroup
            legend="Milk"
            value={drink.milk}
            onChange={onMilk}
            choices={MILKS.map((milk) => ({
              value: milk,
              label: MILK_OPTIONS[milk].label,
              detail: formatSurcharge(MILK_OPTIONS[milk].price),
              swatch: milk === 'none' ? undefined : MILK_OPTIONS[milk].colour,
              blockedBy: blockedBy(MILK_OPTIONS[milk], filters),
            }))}
          />
        )}

        {active === 'sweet' && (
          <>
            <div className="mb-5">
              <label htmlFor={`${baseId}-sweetness`} className="section-label mb-2 flex justify-between">
                <span>Sweetness</span>
                <span className="text-bone">{drink.sweetness}%</span>
              </label>
              <input
                id={`${baseId}-sweetness`}
                type="range"
                min={0}
                max={SWEETNESS_LEVELS.length - 1}
                step={1}
                value={sweetnessIndex}
                aria-valuetext={`${drink.sweetness}% sugar`}
                onChange={(event) => onSweetness(SWEETNESS_LEVELS[Number(event.target.value)])}
                className="w-full accent-flood"
              />
              <div aria-hidden="true" className="mt-1 flex justify-between font-mono text-[0.625rem] text-smoke">
                {SWEETNESS_LEVELS.map((level) => (
                  <span key={level}>{level}</span>
                ))}
              </div>
            </div>
            <ChoiceGroup
              legend="Ice"
              value={drink.ice}
              onChange={onIce}
              columns={3}
              choices={ICE_LEVELS.map((ice) => ({ value: ice, label: ICE_LABELS[ice] }))}
            />
          </>
        )}

        {active === 'toppings' && (
          <div>
            <p className="section-label mb-2 flex justify-between">
              <span>Add a scoop</span>
              <span className={cn(cupFull ? 'text-danger' : 'text-bone')}>
                {drink.layers.length} / {MAX_LAYERS}
              </span>
            </p>
            <ul className="grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
              {TOPPINGS.map((topping) => {
                const item = TOPPING_OPTIONS[topping];
                const reason = blockedBy(item, filters);
                return (
                  <li key={topping}>
                    <button
                      type="button"
                      disabled={cupFull || reason !== undefined}
                      onClick={() => onAddTopping(topping)}
                      aria-label={`Add ${item.label}`}
                      className="flex w-full cursor-pointer items-center gap-3 bg-ink/40 p-3 text-left ring-1 ring-smoke/20 transition-colors hover:ring-flood disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:ring-smoke/20"
                    >
                      <span
                        aria-hidden="true"
                        className="size-4 shrink-0 rounded-full ring-1 ring-bone/30"
                        style={{ background: item.colour }}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-display text-base tracking-wide">{item.label}</span>
                        <span className="font-mono text-[0.6875rem] text-smoke">
                          {formatSurcharge(item.price)} · {item.kcal} kcal
                        </span>
                        {reason && (
                          <span className="font-mono text-[0.6875rem] text-danger">{reason}</span>
                        )}
                      </span>
                      <span aria-hidden="true" className="font-mono text-lg text-flood">
                        +
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {cupFull && (
              <p className="mt-3 font-mono text-[0.6875rem] text-smoke">
                The cup is full. Remove a layer to add another.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
