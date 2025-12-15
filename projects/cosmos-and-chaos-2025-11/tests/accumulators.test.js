/**
 * Tests for Resource Accumulator Logic (Phase 2)
 * Validates fractional resource tracking and flushing behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Resource Accumulators', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('addResourceAccurate', () => {
    it('tracks fractional amounts without loss', () => {
      gameState.addResourceAccurate('ore', 0.3);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.3);
      expect(gameState.resources.ore).toBe(0);

      gameState.addResourceAccurate('ore', 0.3);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.6);
      expect(gameState.resources.ore).toBe(0);

      gameState.addResourceAccurate('ore', 0.5);
      // 0.3 + 0.3 + 0.5 = 1.1, should flush 1, leaving 0.1
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.1, 1);
      expect(gameState.resources.ore).toBe(1); // Flushed 1 whole unit
    });

    it('flushes whole units correctly', () => {
      gameState.addResourceAccurate('ore', 2.7);
      expect(gameState.resources.ore).toBe(2);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.7);
    });

    it('handles multiple sequential additions', () => {
      for (let i = 0; i < 10; i++) {
        gameState.addResourceAccurate('ore', 0.15);
      }
      // 10 * 0.15 = 1.5 total
      expect(gameState.resources.ore).toBe(1);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.5);
    });

    it('maintains accuracy across different resource types', () => {
      gameState.addResourceAccurate('ore', 1.2);
      gameState.addResourceAccurate('energy', 0.8);
      gameState.addResourceAccurate('data', 3.5);

      expect(gameState.resources.ore).toBe(1);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.2);

      expect(gameState.resources.energy).toBe(0);
      expect(gameState.resourceAccumulators.energy).toBeCloseTo(0.8);

      expect(gameState.resources.data).toBe(3);
      expect(gameState.resourceAccumulators.data).toBeCloseTo(0.5);
    });

    it('emits resource:changed event when flushing', () => {
      let eventData = null;
      gameState.on('resource:changed', (data) => {
        eventData = data;
      });

      gameState.addResourceAccurate('ore', 1.5);

      expect(eventData).not.toBeNull();
      expect(eventData.type).toBe('ore');
      expect(eventData.total).toBe(1);
      expect(eventData.accumulated).toBeCloseTo(0.5);
    });

    it('does not emit event if no whole units flushed', () => {
      let eventCalled = false;
      gameState.on('resource:changed', () => {
        eventCalled = true;
      });

      gameState.addResourceAccurate('ore', 0.3);
      expect(eventCalled).toBe(false);
    });

    it('rejects invalid resource types', () => {
      const result = gameState.addResourceAccurate('invalid', 1.0);
      expect(result).toBe(false);
    });

    it('rejects invalid amounts', () => {
      expect(gameState.addResourceAccurate('ore', NaN)).toBe(false);
      expect(gameState.addResourceAccurate('ore', Infinity)).toBe(false);
      expect(gameState.addResourceAccurate('ore', 'not a number')).toBe(false);
    });
  });

  describe('getTrueResourceValue', () => {
    it('returns precise value (whole + fractional)', () => {
      gameState.resources.ore = 42;
      gameState.resourceAccumulators.ore = 0.7;

      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(42.7);
    });

    it('returns 0 for invalid resource type', () => {
      expect(gameState.getTrueResourceValue('invalid')).toBe(0);
    });

    it('reflects changes from addResourceAccurate', () => {
      gameState.addResourceAccurate('ore', 5.3);
      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(5.3);

      gameState.addResourceAccurate('ore', 2.9);
      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(8.2);
    });

    it('accounts for existing whole resources', () => {
      gameState.resources.energy = 100;
      expect(gameState.getTrueResourceValue('energy')).toBe(100);

      gameState.addResourceAccurate('energy', 0.5);
      expect(gameState.getTrueResourceValue('energy')).toBeCloseTo(100.5);
    });
  });

  describe('Accumulator persistence', () => {
    it('maintains fractional parts across multiple operations', () => {
      // Simulate production ticks
      for (let i = 0; i < 20; i++) {
        gameState.addResourceAccurate('ore', 0.11); // Slightly more than 1/10
      }

      // 20 * 0.11 = 2.2
      expect(gameState.resources.ore).toBe(2);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.2);
      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(2.2);
    });

    it('never allows accumulator to exceed 1.0', () => {
      gameState.addResourceAccurate('ore', 3.9);
      expect(gameState.resourceAccumulators.ore).toBeLessThan(1.0);
      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.9);
    });
  });
});
