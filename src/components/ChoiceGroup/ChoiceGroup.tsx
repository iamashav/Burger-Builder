import { useId } from 'react';
import { cn } from '../../lib/cn';

export interface Choice<T extends string> {
  value: T;
  label: string;
  detail?: string;
  swatch?: string;
  /** Present when the choice is blocked, and shown to say why. */
  blockedBy?: string;
}

export interface ChoiceGroupProps<T extends string> {
  legend: string;
  value: T;
  choices: Choice<T>[];
  onChange: (value: T) => void;
  columns?: 2 | 3;
}

export function ChoiceGroup<T extends string>({
  legend,
  value,
  choices,
  onChange,
  columns = 2,
}: ChoiceGroupProps<T>) {
  const name = useId();

  return (
    <fieldset className="mb-5 last:mb-0">
      <legend className="section-label mb-2">{legend}</legend>
      <div className={cn('grid gap-2', columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2')}>
        {choices.map((choice) => {
          const blocked = choice.blockedBy !== undefined && choice.value !== value;
          return (
            <label
              key={choice.value}
              className={cn(
                'relative flex cursor-pointer flex-col gap-1 bg-ink/40 p-3 ring-1 ring-smoke/20 transition-colors',
                'has-checked:bg-flood/10 has-checked:ring-flood has-focus-visible:ring-2 has-focus-visible:ring-flood',
                blocked ? 'cursor-not-allowed opacity-50' : 'hover:ring-smoke/50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={choice.value}
                checked={choice.value === value}
                disabled={blocked}
                onChange={() => onChange(choice.value)}
                className="sr-only"
              />
              <span className="flex items-center gap-2 font-display text-base tracking-wide">
                {choice.swatch && (
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full ring-1 ring-bone/30"
                    style={{ background: choice.swatch }}
                  />
                )}
                {choice.label}
              </span>
              {choice.detail && (
                <span className="font-mono text-[0.6875rem] text-smoke">{choice.detail}</span>
              )}
              {choice.blockedBy && (
                <span className="font-mono text-[0.6875rem] text-danger">{choice.blockedBy}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
