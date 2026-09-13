import type { Drink, Ice, Milk, Size, Tea, Topping } from '../types/drink';
import { parseDrink } from './drink';

const SIZE_CODES: Record<Size, string> = { regular: 'R', large: 'L' };
const TEA_CODES: Record<Tea, string> = {
  black: 'blk',
  jasmine: 'jas',
  oolong: 'ool',
  matcha: 'mat',
  taro: 'tar',
};
const MILK_CODES: Record<Milk, string> = { none: 'no', whole: 'whl', oat: 'oat', almond: 'alm' };
const ICE_CODES: Record<Ice, string> = { none: 'no', less: 'les', regular: 'reg' };
const TOPPING_CODES: Record<Topping, string> = {
  tapioca: 'tap',
  popping: 'pop',
  grass: 'grs',
  coconut: 'coc',
  pudding: 'pud',
  redbean: 'bea',
  foam: 'fom',
};

/** Longest code the menu can produce, with slack. Anything longer is not worth parsing. */
const MAX_CODE_LENGTH = 48;

function reverse<T extends string>(codes: Record<T, string>): Map<string, T> {
  return new Map(Object.entries<string>(codes).map(([value, code]) => [code, value as T]));
}

const SIZES_BY_CODE = reverse(SIZE_CODES);
const TEAS_BY_CODE = reverse(TEA_CODES);
const MILKS_BY_CODE = reverse(MILK_CODES);
const ICE_BY_CODE = reverse(ICE_CODES);
const TOPPINGS_BY_CODE = reverse(TOPPING_CODES);

/**
 * A short, readable code rather than base64 JSON: `R.blk.whl.50.reg.tap-fom` survives
 * being pasted into chats, and a person can see roughly what drink a link holds.
 */
export function encodeDrink(drink: Drink): string {
  return [
    SIZE_CODES[drink.size],
    TEA_CODES[drink.tea],
    MILK_CODES[drink.milk],
    drink.sweetness,
    ICE_CODES[drink.ice],
    drink.layers.map((topping) => TOPPING_CODES[topping]).join('-'),
  ].join('.');
}

/** Share codes arrive from URLs anyone can edit, so every part is checked against the menu. */
export function decodeDrink(code: string): Drink | null {
  if (code.length > MAX_CODE_LENGTH) return null;

  const parts = code.split('.');
  if (parts.length !== 6) return null;
  const [size, tea, milk, sweetness, ice, toppings] = parts;

  const layers = toppings === '' ? [] : toppings.split('-').map((part) => TOPPINGS_BY_CODE.get(part));
  if (layers.some((layer) => layer === undefined)) return null;

  return parseDrink({
    size: SIZES_BY_CODE.get(size),
    tea: TEAS_BY_CODE.get(tea),
    milk: MILKS_BY_CODE.get(milk),
    sweetness: /^\d{1,3}$/.test(sweetness) ? Number(sweetness) : undefined,
    ice: ICE_BY_CODE.get(ice),
    layers,
  });
}

export const SHARE_PARAM = 'd';

export function shareUrl(drink: Drink, origin = window.location.origin): string {
  return `${origin}/?${SHARE_PARAM}=${encodeDrink(drink)}`;
}
