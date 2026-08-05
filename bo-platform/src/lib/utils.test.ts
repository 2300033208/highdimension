import { describe, it, expect } from 'vitest';
import { cn, formatNumber, formatMs } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
  });

  it('should deduplicate conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatNumber', () => {
  it('should format numbers with default decimals', () => {
    expect(formatNumber(3.14159)).toBe('3.14');
  });

  it('should respect custom decimal places', () => {
    expect(formatNumber(3.14159, 4)).toBe('3.1416');
  });

  it('should format integers with two decimals', () => {
    expect(formatNumber(100)).toBe('100.00');
  });
});

describe('formatMs', () => {
  it('should format milliseconds under 1000', () => {
    expect(formatMs(450)).toBe('450ms');
  });

  it('should format milliseconds over 1000 as seconds', () => {
    expect(formatMs(1500)).toBe('1.5s');
  });
});
