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
    expect(checkValidity('abc', { minLength: 6 })).toBe(false);
    expect(checkValidity('abcdef', { minLength: 6, maxLength: 60 })).toBe(true);
    expect(checkValidity('a'.repeat(61), { maxLength: 60 })).toBe(false);
  });

  describe('pattern', () => {
    it('applies to non-blank values only, leaving blanks to the required rule', () => {
      expect(checkValidity('call me', { pattern: /^\d+$/ })).toBe(false);
      expect(checkValidity('0123', { pattern: /^\d+$/ })).toBe(true);
      expect(checkValidity('', { pattern: /^\d+$/ })).toBe(true);
    });
  });

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
