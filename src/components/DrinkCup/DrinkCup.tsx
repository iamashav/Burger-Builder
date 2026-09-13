import { useId } from 'react';
import { MILK_OPTIONS, TEA_OPTIONS, TOPPING_OPTIONS } from '../../data/menu';
import { mix } from '../../lib/colour';
import { describeDrink } from '../../lib/drink';
import type { Drink, Ice, Topping } from '../../types/drink';

const BOTTOM = 320;
const LAYER_HEIGHT = 36;
const RIM_Y = { regular: 96, large: 52 } as const;
const ICE_CUBES: Record<Ice, number> = { none: 0, less: 2, regular: 4 };
const ICE_SPOTS = [
  { x: 78, dy: 20, angle: 12 },
  { x: 136, dy: 34, angle: -8 },
  { x: 158, dy: 10, angle: 20 },
  { x: 98, dy: 50, angle: -15 },
];

type LayerShape = 'pearls' | 'small-pearls' | 'cubes' | 'custard' | 'foam';

const SHAPE: Record<Topping, LayerShape> = {
  tapioca: 'pearls',
  popping: 'pearls',
  redbean: 'small-pearls',
  grass: 'cubes',
  coconut: 'cubes',
  pudding: 'custard',
  foam: 'foam',
};

function cupPath(rimY: number) {
  return `M40 ${rimY} L200 ${rimY} L178 ${BOTTOM} Q176 ${BOTTOM + 8} 168 ${BOTTOM + 8} L72 ${BOTTOM + 8} Q64 ${BOTTOM + 8} 62 ${BOTTOM} Z`;
}

function Layer({ topping, top }: { topping: Topping; top: number }) {
  const { colour } = TOPPING_OPTIONS[topping];
  const shape = SHAPE[topping];

  if (shape === 'custard' || shape === 'foam') {
    return (
      <g>
        <path
          d={`M0 ${top + 8} Q30 ${top - 2} 60 ${top + 8} T120 ${top + 8} T180 ${top + 8} T240 ${top + 8} V${top + LAYER_HEIGHT} H0 Z`}
          fill={colour}
          opacity={shape === 'foam' ? 0.95 : 0.9}
        />
        {shape === 'foam' &&
          [70, 104, 146, 172].map((x, index) => (
            <circle key={x} cx={x} cy={top + 18 + (index % 2) * 8} r={3} fill="#fff" opacity={0.7} />
          ))}
      </g>
    );
  }

  const size = shape === 'small-pearls' ? 5 : 7;
  const step = shape === 'cubes' ? 20 : size * 2 + 4;
  const rows = [top + LAYER_HEIGHT * 0.3, top + LAYER_HEIGHT * 0.72];

  return (
    <g>
      {rows.flatMap((y, row) =>
        Array.from({ length: Math.ceil(160 / step) }, (_, column) => {
          const x = 44 + column * step + (row % 2) * (step / 2);
          return shape === 'cubes' ? (
            <rect
              key={`${row}-${column}`}
              x={x - 7}
              y={y - 7}
              width={14}
              height={14}
              rx={3}
              fill={colour}
              opacity={0.92}
              transform={`rotate(${(column * 23) % 30 - 15} ${x} ${y})`}
            />
          ) : (
            <g key={`${row}-${column}`}>
              <circle cx={x} cy={y} r={size} fill={colour} />
              <circle cx={x - size / 3} cy={y - size / 3} r={size / 3} fill="#fff" opacity={0.25} />
            </g>
          );
        }),
      )}
    </g>
  );
}

export function DrinkCup({ drink, className }: { drink: Drink; className?: string }) {
  const clipId = `cup-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const rimY = RIM_Y[drink.size];
  const liquidTop = rimY + 16;

  const tea = TEA_OPTIONS[drink.tea];
  const milk = MILK_OPTIONS[drink.milk];
  const liquid = drink.milk === 'none' ? tea.colour : mix(tea.colour, milk.colour, 0.55);

  const toppingLabels = drink.layers.map((topping) => TOPPING_OPTIONS[topping].label);
  const label = `${describeDrink(drink).join(', ')}. ${
    toppingLabels.length > 0
      ? `Toppings from the bottom: ${toppingLabels.join(', ')}.`
      : 'No toppings.'
  }`;

  return (
    <svg
      viewBox="0 0 240 340"
      role="img"
      aria-label={label}
      data-testid="drink-cup"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={cupPath(rimY)} />
        </clipPath>
      </defs>

      <path d={cupPath(rimY)} className="fill-bone/5" />

      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={liquidTop} width={240} height={BOTTOM + 8 - liquidTop} fill={liquid} />
        {drink.layers.map((topping, index) => (
          <g key={`${topping}-${index}`} data-layer={topping} className="animate-[fade-in_220ms_ease-out]">
            <Layer topping={topping} top={BOTTOM - 4 - (index + 1) * LAYER_HEIGHT} />
          </g>
        ))}
        {ICE_SPOTS.slice(0, ICE_CUBES[drink.ice]).map(({ x, dy, angle }) => (
          <rect
            key={x}
            data-ice
            x={x - 12}
            y={liquidTop + dy - 12}
            width={24}
            height={24}
            rx={4}
            fill="#fff"
            fillOpacity={0.28}
            stroke="#fff"
            strokeOpacity={0.5}
            transform={`rotate(${angle} ${x} ${liquidTop + dy})`}
          />
        ))}
      </g>

      <path
        d={`M150 ${rimY - 44} L164 ${rimY - 44} L136 ${BOTTOM - 8} L122 ${BOTTOM - 8} Z`}
        className="fill-flood"
        opacity={0.9}
      />

      <path d={cupPath(rimY)} fill="none" className="stroke-bone/40" strokeWidth={2} />
      <rect x={34} y={rimY - 6} width={172} height={8} rx={4} className="fill-bone/70" />
    </svg>
  );
}
