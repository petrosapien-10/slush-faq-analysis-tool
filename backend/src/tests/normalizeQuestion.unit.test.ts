import { describe, it, expect } from 'vitest';
import { normalizeQuestion } from '../utils/normalizeQuestion.js';

describe('normalizeQuestion - Unit Tests', () => {
  it('should convert to lowercase', () => {
    const result = normalizeQuestion('What Is The Price?');
    expect(result).toBe('what is the price');
  });

  it('should remove special characters', () => {
    const result = normalizeQuestion('whats the ticket pric??');
    expect(result).toBe('whats the ticket pric');
  });

  it('should collapse multiple spaces', () => {
    const result = normalizeQuestion('what    is     the  price');
    expect(result).toBe('what is the price');
  });

  it('should trim leading and trailing whitespace', () => {
    const result = normalizeQuestion('  what is the price  ');
    expect(result).toBe('what is the price');
  });

  it('should handle empty string', () => {
    const result = normalizeQuestion('');
    expect(result).toBe('');
  });

  it('should handle only special characters', () => {
    const result = normalizeQuestion('???!!!');
    expect(result).toBe('');
  });

  it('should handle mixed case with punctuation and spaces', () => {
    const result = normalizeQuestion('How Much Does  Entry  Cost?!?');
    expect(result).toBe('how much does entry cost');
  });

  it('should preserve only letters and spaces', () => {
    const result = normalizeQuestion('price123 for $20 tickets');
    expect(result).toBe('price for tickets');
  });
});
