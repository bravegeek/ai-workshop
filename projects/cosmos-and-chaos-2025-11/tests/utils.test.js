/**
 * Tests for Utility Functions (Phase 2)
 * Validates number formatting with K/M/B notation
 */

import { describe, it, expect } from 'vitest';
import { formatNumber } from '../src/js/utils.js';

describe('formatNumber', () => {
  describe('Small numbers (< 1000)', () => {
    it('formats whole numbers as strings', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats decimal numbers as strings', () => {
      expect(formatNumber(0.5)).toBe('0.5');
      expect(formatNumber(123.45)).toBe('123.45');
    });
  });

  describe('Thousands (1K - 999K)', () => {
    it('formats thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(42000)).toBe('42.0K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('rounds to 1 decimal place', () => {
      expect(formatNumber(1234)).toBe('1.2K');
      expect(formatNumber(1567)).toBe('1.6K'); // Rounds up
      expect(formatNumber(12345)).toBe('12.3K');
    });
  });

  describe('Millions (1M - 999M)', () => {
    it('formats millions with M suffix', () => {
      expect(formatNumber(1_000_000)).toBe('1.0M');
      expect(formatNumber(2_500_000)).toBe('2.5M');
      expect(formatNumber(42_000_000)).toBe('42.0M');
      expect(formatNumber(999_999_999)).toBe('1000.0M');
    });

    it('rounds to 1 decimal place', () => {
      expect(formatNumber(1_234_567)).toBe('1.2M');
      expect(formatNumber(9_876_543)).toBe('9.9M');
    });
  });

  describe('Billions (1B+)', () => {
    it('formats billions with B suffix', () => {
      expect(formatNumber(1_000_000_000)).toBe('1.0B');
      expect(formatNumber(2_500_000_000)).toBe('2.5B');
      expect(formatNumber(42_000_000_000)).toBe('42.0B');
    });

    it('rounds to 1 decimal place', () => {
      expect(formatNumber(1_234_567_890)).toBe('1.2B');
      expect(formatNumber(9_876_543_210)).toBe('9.9B');
    });

    it('handles very large numbers', () => {
      expect(formatNumber(999_999_999_999)).toBe('1000.0B');
      expect(formatNumber(1_000_000_000_000)).toBe('1000.0B');
    });
  });

  describe('Boundary conditions', () => {
    it('handles exactly 1000', () => {
      expect(formatNumber(1000)).toBe('1.0K');
    });

    it('handles exactly 1 million', () => {
      expect(formatNumber(1_000_000)).toBe('1.0M');
    });

    it('handles exactly 1 billion', () => {
      expect(formatNumber(1_000_000_000)).toBe('1.0B');
    });

    it('handles 999 (just below 1K)', () => {
      expect(formatNumber(999)).toBe('999');
    });

    it('handles 999,999 (just below 1M)', () => {
      expect(formatNumber(999_999)).toBe('1000.0K');
    });

    it('handles 999,999,999 (just below 1B)', () => {
      expect(formatNumber(999_999_999)).toBe('1000.0M');
    });
  });

  describe('Fractional inputs', () => {
    it('formats fractional thousands', () => {
      expect(formatNumber(1500.7)).toBe('1.5K');
      expect(formatNumber(2499.9)).toBe('2.5K');
    });

    it('formats fractional millions', () => {
      expect(formatNumber(1_500_000.5)).toBe('1.5M');
    });

    it('formats fractional billions', () => {
      expect(formatNumber(1_500_000_000.9)).toBe('1.5B');
    });
  });

  describe('Special cases', () => {
    it('handles negative numbers correctly', () => {
      expect(formatNumber(-500)).toBe('-500');
      expect(formatNumber(-1500)).toBe('-1.5K');
      expect(formatNumber(-1_500_000)).toBe('-1.5M');
      expect(formatNumber(-1_500_000_000)).toBe('-1.5B');
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('Production accuracy scenarios', () => {
    it('formats typical idle game progression', () => {
      // Early game
      expect(formatNumber(157)).toBe('157');

      // Mid game
      expect(formatNumber(45_678)).toBe('45.7K');

      // Late game
      expect(formatNumber(3_456_789)).toBe('3.5M');

      // End game
      expect(formatNumber(987_654_321)).toBe('987.7M');
    });

    it('handles production counter updates', () => {
      // Simulating production counter values over time
      const values = [
        0,
        127,
        1_034,
        15_678,
        234_567,
        8_901_234,
        456_789_012
      ];

      const formatted = values.map(formatNumber);
      expect(formatted).toEqual([
        '0',
        '127',
        '1.0K',
        '15.7K',
        '234.6K',
        '8.9M',
        '456.8M'
      ]);
    });
  });
});
