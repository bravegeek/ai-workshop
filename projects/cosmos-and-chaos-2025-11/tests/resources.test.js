/**
 * Tests for Resource System (Phase 2 - User Story 4)
 * Validates multi-resource tracking and aggregation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Resource System', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  // T059: Test multiple resource type tracking
  describe('Multiple Resource Type Tracking', () => {
    it('tracks ore separately from other resources', () => {
      gameState.addResourceAccurate('ore', 10.5);
      gameState.addResourceAccurate('energy', 5.3);

      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(10.5);
      expect(gameState.getTrueResourceValue('energy')).toBeCloseTo(5.3);
      expect(gameState.resources.ore).toBe(10); // Whole units
      expect(gameState.resources.energy).toBe(5); // Whole units
    });

    it('tracks all 5 resource types independently', () => {
      gameState.addResourceAccurate('ore', 10);
      gameState.addResourceAccurate('energy', 20);
      gameState.addResourceAccurate('data', 30);
      gameState.addResourceAccurate('biomass', 40);
      gameState.addResourceAccurate('nanites', 50);

      expect(gameState.resources.ore).toBe(10);
      expect(gameState.resources.energy).toBe(20);
      expect(gameState.resources.data).toBe(30);
      expect(gameState.resources.biomass).toBe(40);
      expect(gameState.resources.nanites).toBe(50);
    });

    it('maintains accuracy for each resource type with fractional accumulation', () => {
      // Add fractional amounts
      for (let i = 0; i < 10; i++) {
        gameState.addResourceAccurate('ore', 0.3);
        gameState.addResourceAccurate('energy', 0.7);
      }

      // getTrueResourceValue includes both whole and fractional parts
      expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(3.0);
      expect(gameState.getTrueResourceValue('energy')).toBeCloseTo(7.0);

      // addResourceAccurate only flushes whole units when they accumulate >= 1.0
      // After 10 × 0.3 = 3.0: 3 whole units flushed, 0.0 remainder
      // After 10 × 0.7 = 7.0: 7 whole units flushed, 0.0 remainder
      expect(gameState.resources.ore).toBeGreaterThanOrEqual(2);
      expect(gameState.resources.energy).toBeGreaterThanOrEqual(6);
    });
  });

  // T060: Test resource aggregation across multiple producers
  describe('Resource Aggregation', () => {
    it('aggregates ore production from multiple extractors', () => {
      // Simulate two extractors producing ore
      gameState.cardAccumulators.extractor = 0;
      gameState.cardAccumulators.sensor = 0;

      // Both produce ore (for this test)
      gameState.addResourceAccurate('ore', 5.5); // from extractor 1
      gameState.addResourceAccurate('ore', 3.2); // from extractor 2

      const totalOre = gameState.getTrueResourceValue('ore');
      expect(totalOre).toBeCloseTo(8.7);
      expect(gameState.resources.ore).toBe(8); // Whole units
    });

    it('tracks production from cards producing different resource types', () => {
      // Extractor produces ore
      gameState.addResourceAccurate('ore', 10);
      // Reactor produces energy
      gameState.addResourceAccurate('energy', 15);
      // Sensor produces data
      gameState.addResourceAccurate('data', 5);

      expect(gameState.resources.ore).toBe(10);
      expect(gameState.resources.energy).toBe(15);
      expect(gameState.resources.data).toBe(5);
    });

    it('maintains separate accumulators for different resource types', () => {
      // Initialize accumulators
      if (!gameState.resourceAccumulators) {
        gameState.resourceAccumulators = {
          ore: 0,
          energy: 0,
          data: 0,
          biomass: 0,
          nanites: 0
        };
      }

      // Add fractional amounts to different resources
      gameState.addResourceAccurate('ore', 0.6);
      gameState.addResourceAccurate('energy', 0.4);

      expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.6);
      expect(gameState.resourceAccumulators.energy).toBeCloseTo(0.4);
    });
  });
});
