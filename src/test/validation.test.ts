import { describe, expect, it } from 'vitest';
import { checkValidity } from '../lib/validation';

describe('checkValidity', () => {
  it('passes anything when there are no rules', () => {
    expect(checkValidity('', undefined)).toBe(true);
    expect(checkValidity('anything', {})).toBe(true);
  });

  it('rejects blank and whitespace-only values when required', () => {
    expect(checkValidity('', { required: true })).toBe(false);
    expect(checkValidity('   ', { required: true })).toBe(false);
    expect(checkValidity('a', { required: true })).toBe(true);
  });

  it('enforces length bounds', () => {
    expect(checkValidity('1234', { minLength: 5 })).toBe(false);
    expect(checkValidity('12345', { minLength: 5, maxLength: 5 })).toBe(true);
    expect(checkValidity('123456', { maxLength: 5 })).toBe(false);
  });

  // The pre-rewrite form declared isEmail but never implemented it, so every one of
  // these strings was accepted as a valid address.
  describe('isEmail', () => {
    it.each(['notanemail', 'missing@tld', '@example.com', 'spaces in@example.com', 'a@b.c'])(
      'rejects %j',
      (value) => {
        expect(checkValidity(value, { isEmail: true })).toBe(false);
      },
    );

    it.each(['ada@example.com', 'ada.lovelace+tag@sub.example.co.uk'])(
      'accepts %j',
      (value) => {
        expect(checkValidity(value, { isEmail: true })).toBe(true);
      },
    );
  });
});
