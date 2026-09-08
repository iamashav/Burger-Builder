export const INGREDIENTS = ['salad', 'bacon', 'cheese', 'meat'] as const;

export type Ingredient = (typeof INGREDIENTS)[number];

export type IngredientCounts = Record<Ingredient, number>;

export interface OrderFormValues {
  name: string;
  street: string;
  zipcode: string;
  country: string;
  email: string;
  deliveryMethod: 'fastest' | 'cheapest';
}

export interface OrderPayload {
  ingredients: IngredientCounts;
  price: number;
  orderData: OrderFormValues;
  userId: string;
}

export interface Order extends OrderPayload {
  id: string;
}
