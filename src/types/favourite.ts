import type { Drink } from './drink';
import type { SERVER_TIMESTAMP } from './order';

export const MAX_FAVOURITE_NAME = 60;

export interface Favourite {
  id: string;
  name: string;
  drink: Drink;
  createdAt: number;
}

export interface FavouritePayload {
  name: string;
  drink: Drink;
  createdAt: typeof SERVER_TIMESTAMP;
}
