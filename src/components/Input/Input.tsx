import { useId, type ChangeEvent } from 'react';
import { cn } from '../../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputProps {
  elementType?: 'input' | 'textarea' | 'select';
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  options?: SelectOption[];
  invalid?: boolean;
  touched?: boolean;
  errorMessage?: string;
  autoComplete?: string;
}

export function Input({
  elementType = 'input',
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  options,
  invalid = false,
  touched = false,
  errorMessage,
  autoComplete,
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const showError = invalid && touched;

  const fieldClass = cn(
    'w-full border bg-ash px-3 py-2 font-body text-bone placeholder:text-smoke/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-flood',
    showError ? 'border-danger' : 'border-smoke/30',
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => onChange(event.target.value);

  return (
    <div className="mb-4 text-left">
      <label htmlFor={id} className="section-label mb-1.5 block">
        {label}
      </label>

      {elementType === 'select' ? (
        <select
          id={id}
          className={fieldClass}
          value={value}
          onChange={handleChange}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : elementType === 'textarea' ? (
        <textarea
          id={id}
          className={fieldClass}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          className={fieldClass}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={handleChange}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
      )}

      {showError && (
        <p id={errorId} className="mt-1.5 font-mono text-[0.6875rem] text-danger">
          {errorMessage ?? `Please enter a valid ${label.toLowerCase()}.`}
        </p>
      )}
    </div>
  );
}
