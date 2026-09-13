import { describe, expect, it } from 'vitest';
import { DEFAULT_DRINK, MAX_LAYERS } from '../data/menu';
import { decodeDrink, encodeDrink, shareUrl } from '../lib/shareCode';
import {
  ICE_LEVELS,
  MILKS,
  SIZES,
  SWEETNESS_LEVELS,
  TEAS,
  TOPPINGS,
  type Drink,
} from '../types/drink';

describe('share codes', () => {
  it('encodes a drink as a short readable code', () => {
    const drink: Drink = { ...DEFAULT_DRINK, size: 'large', milk: 'oat', layers: ['tapioca', 'foam'] };
    expect(encodeDrink(drink)).toBe('L.blk.oat.50.reg.tap-fom');
  });

  it('round-trips every option on the menu', () => {
    const drinks: Drink[] = [
      ...SIZES.map((size) => ({ ...DEFAULT_DRINK, size })),
      ...TEAS.map((tea) => ({ ...DEFAULT_DRINK, tea })),
      ...MILKS.map((milk) => ({ ...DEFAULT_DRINK, milk })),
      ...SWEETNESS_LEVELS.map((sweetness) => ({ ...DEFAULT_DRINK, sweetness })),
      ...ICE_LEVELS.map((ice) => ({ ...DEFAULT_DRINK, ice })),
      { ...DEFAULT_DRINK, layers: [] },
      { ...DEFAULT_DRINK, layers: [...TOPPINGS].slice(0, MAX_LAYERS) },
      { ...DEFAULT_DRINK, layers: [...TOPPINGS].slice(-MAX_LAYERS).reverse() },
    ];

    for (const drink of drinks) expect(decodeDrink(encodeDrink(drink))).toEqual(drink);
  });

  it('keeps layer order and duplicates', () => {
    const drink: Drink = { ...DEFAULT_DRINK, layers: ['foam', 'tapioca', 'tapioca'] };
    expect(decodeDrink(encodeDrink(drink))?.layers).toEqual(['foam', 'tapioca', 'tapioca']);
  });

  it.each([
    ['empty', ''],
    ['too few parts', 'R.blk.whl.50.reg'],
    ['too many parts', 'R.blk.whl.50.reg.tap.x'],
    ['unknown size', 'XL.blk.whl.50.reg.tap'],
    ['unknown tea', 'R.cof.whl.50.reg.tap'],
    ['unknown milk', 'R.blk.soy.50.reg.tap'],
    ['off-menu sweetness', 'R.blk.whl.60.reg.tap'],
    ['non-numeric sweetness', 'R.blk.whl.1e2.reg.tap'],
    ['unknown ice', 'R.blk.whl.50.lots.tap'],
    ['unknown topping', 'R.blk.whl.50.reg.tap-cheese'],
    ['empty topping slot', 'R.blk.whl.50.reg.tap--fom'],
    ['over capacity', 'R.blk.whl.50.reg.tap-tap-tap-tap-tap'],
    ['prototype key', 'R.blk.whl.50.reg.__proto__'],
    ['very long', `R.blk.whl.50.reg.${'tap-'.repeat(40)}tap`],
  ])('rejects %s', (_name, code) => {
    expect(decodeDrink(code)).toBeNull();
  });

  it('builds a link back to the builder', () => {
    expect(shareUrl(DEFAULT_DRINK, 'https://example.com')).toBe(
      'https://example.com/?d=R.blk.whl.50.reg.tap',
    );
  });
});
