import type { Drink } from './drink';

export interface OrderLine {
  drink: Drink;
  quantity: number;
  unitPrice: number;
}

export type Fulfilment =
  | { method: 'pickup'; time: string }
  | { method: 'delivery'; street: string; city: string; postcode: string };

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

/** Realtime Database placeholder that the server swaps for its own clock on write. */
export const SERVER_TIMESTAMP = { '.sv': 'timestamp' } as const;

export interface OrderPayload {
  lines: OrderLine[];
  total: number;
  fulfilment: Fulfilment;
  contact: Contact;
  userId: string;
  createdAt: typeof SERVER_TIMESTAMP;
}

export interface Order extends Omit<OrderPayload, 'createdAt'> {
  id: string;
  createdAt: number;
}
