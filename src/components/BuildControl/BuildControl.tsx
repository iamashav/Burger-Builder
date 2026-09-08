import { Button } from '../Button/Button';

export interface BuildControlProps {
  label: string;
  count: number;
  price: number;
  disabled: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export function BuildControl({
  label,
  count,
  price,
  disabled,
  onAdd,
  onRemove,
}: BuildControlProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-smoke/15 py-2.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="font-display text-base tracking-wide">{label}</span>
        <span className="font-mono text-[0.6875rem] text-smoke">
          +${price.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="size-9 px-0"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove one ${label.toLowerCase()}`}
        >
          &minus;
        </Button>

        <span
          className="w-6 text-center font-mono text-sm tabular-nums"
          aria-label={`${count} ${label.toLowerCase()}`}
        >
          {count}
        </span>

        <Button
          variant="ghost"
          className="size-9 px-0"
          onClick={onAdd}
          aria-label={`Add one ${label.toLowerCase()}`}
        >
          +
        </Button>
      </div>
    </div>
  );
}
