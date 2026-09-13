import type { Drink } from './drink';

export interface OrderFormValues {
  name: string;
  street: string;
  zipcode: string;
  country: string;
  email: string;
  deliveryMethod: 'fastest' | 'cheapest';
}

export interface OrderPayload {
  drink: Drink;
  price: number;
  orderData: OrderFormValues;
  userId: string;
}

export interface Order extends OrderPayload {
  id: string;
}
