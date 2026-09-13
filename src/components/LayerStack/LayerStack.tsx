import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { TOPPING_OPTIONS } from '../../data/menu';
import { cn } from '../../lib/cn';
import type { Topping } from '../../types/drink';
import { Button } from '../Button/Button';

export interface LayerStackProps {
  /** Bottom of the cup first, as stored. */
  layers: Topping[];
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}

export function LayerStack({ layers, onMove, onRemove }: LayerStackProps) {
  const id = useId();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Rows are keyed by position (layers can repeat), so after a move the DOM node under
  // focus shows a different topping. Focus is re-pointed at the moved layer once it renders.
  const pendingFocus = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    itemRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [layers]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= layers.length || from === to) return;
    onMove(from, to);
    pendingFocus.current = to;
    setAnnouncement(
      `${TOPPING_OPTIONS[layers[from]].label} is now layer ${to + 1} of ${layers.length}, counting from the bottom.`,
    );
  };

  const remove = (index: number) => {
    onRemove(index);
    pendingFocus.current = Math.min(index, layers.length - 2);
    setAnnouncement(`${TOPPING_OPTIONS[layers[index]].label} removed.`);
  };

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.target !== event.currentTarget) return;
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, index + 1);
    } else if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, index - 1);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      remove(index);
    }
  };

  const handleDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    setDragOver(null);
    const from = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(from)) move(from, index);
  };

  // Listed top-first so the list reads in the same direction as the cup beside it.
  const rows = layers.map((topping, index) => ({ topping, index })).reverse();

  return (
    <section className="bg-ash p-5 ring-1 ring-smoke/15" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="section-label mb-1">
        Layers, top to bottom
      </h2>
      <p id={`${id}-hint`} className="mb-3 font-mono text-[0.6875rem] text-smoke/80">
        {/* Native drag and drop never fires for touch input, so touch users are pointed at the buttons. */}
        <span className="pointer-coarse:hidden">
          Drag to reorder, or focus a layer and press Alt + ↑ / ↓.
        </span>
        <span className="hidden pointer-coarse:inline">Use the ↑ and ↓ buttons to reorder.</span>
      </p>

      {layers.length === 0 ? (
        <p className="py-4 text-center text-smoke">No toppings. Plain tea is a fine choice too.</p>
      ) : (
        <ol className="list-none space-y-2 p-0">
          {rows.map(({ topping, index }) => {
            const item = TOPPING_OPTIONS[topping];
            const name = `${item.label} (layer ${index + 1})`;
            return (
              <li
                key={index}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                tabIndex={0}
                draggable
                aria-label={`${item.label}, layer ${index + 1} of ${layers.length}`}
                aria-describedby={`${id}-hint`}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(index));
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(index);
                }}
                onDragLeave={() => setDragOver((current) => (current === index ? null : current))}
                onDrop={(event) => handleDrop(event, index)}
                onDragEnd={() => setDragOver(null)}
                className={cn(
                  'flex cursor-grab items-center gap-2 bg-ink/40 py-2 pr-2 pl-3 ring-1 ring-smoke/20 active:cursor-grabbing sm:gap-3',
                  dragOver === index && 'ring-2 ring-flood',
                )}
              >
                <span aria-hidden="true" className="font-mono text-smoke pointer-coarse:hidden">
                  ⋮⋮
                </span>
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-full ring-1 ring-bone/30"
                  style={{ background: item.colour }}
                />
                <span className="min-w-0 flex-1 truncate font-display tracking-wide">
                  {item.label}
                </span>
                <Button
                  variant="ghost"
                  className="size-8 px-0"
                  disabled={index === layers.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move ${name} up`}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  className="size-8 px-0"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move ${name} down`}
                >
                  ↓
                </Button>
                <Button
                  variant="danger"
                  className="size-8 px-0"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${name}`}
                >
                  &times;
                </Button>
              </li>
            );
          })}
        </ol>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
