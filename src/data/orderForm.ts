import type { ValidationRules } from '../lib/validation';
import type { OrderFormValues } from '../types/order';

export interface FieldConfig {
  name: keyof OrderFormValues;
  label: string;
  elementType?: 'input' | 'select';
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  options?: { value: string; label: string }[];
  rules: ValidationRules;
  errorMessage?: string;
}

export const ORDER_FORM_FIELDS: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full name',
    placeholder: 'Ada Lovelace',
    autoComplete: 'name',
    rules: { required: true },
  },
  {
    name: 'street',
    label: 'Street',
    placeholder: '12 Analytical Way',
    autoComplete: 'street-address',
    rules: { required: true },
  },
  {
    name: 'zipcode',
    label: 'Postcode',
    placeholder: 'SW1A1',
    autoComplete: 'postal-code',
    rules: { required: true, minLength: 5, maxLength: 5 },
    errorMessage: 'Postcode must be exactly 5 characters.',
  },
  {
    name: 'country',
    label: 'Country',
    placeholder: 'United Kingdom',
    autoComplete: 'country-name',
    rules: { required: true },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ada@example.com',
    autoComplete: 'email',
    rules: { required: true, isEmail: true },
    errorMessage: 'Enter a valid email address.',
  },
  {
    name: 'deliveryMethod',
    label: 'Delivery method',
    elementType: 'select',
    options: [
      { value: 'fastest', label: 'Fastest' },
      { value: 'cheapest', label: 'Cheapest' },
    ],
    rules: {},
  },
];

export const EMPTY_ORDER_FORM: OrderFormValues = {
  name: '',
  street: '',
  zipcode: '',
  country: '',
  email: '',
  deliveryMethod: 'fastest',
};
