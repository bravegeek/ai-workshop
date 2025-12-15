/**
 * Tests for Efficiency Calculation (Phase 2)
 * Validates card efficiency based on input availability
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Efficiency Calculation', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('calculateCardEfficiency', () => {
    it('returns 100% for base producers (no inputs)', () => {
      gameState.cards.extractor = {
        id: 'extractor',
        inputRequirements: {},
        placed: true
      };

      const efficiency = gameState.calculateCardEfficiency('extractor');
      expect(efficiency).toBe(1.0);
      expect(gameState.efficiencies.extractor.isBaseProducer).toBe(true);
      expect(gameState.efficiencies.extractor.bottleneck).toBeNull();
    });

    it('calculates efficiency from input ratios (single input)', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.resources.ore = 10;
      const efficiency = gameState.calculateCardEfficiency('processor');
      expect(efficiency).toBe(1.0); // 10/5 = 2.0, clamped to 1.0
    });

    it('calculates efficiency from input ratios (multiple inputs)', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5, energy: 1 },
        placed: true
      };

      gameState.resources.ore = 10;
      gameState.resources.energy = 1;

      const efficiency = gameState.calculateCardEfficiency('processor');
      expect(efficiency).toBe(1.0); // min(10/5, 1/1) = min(2.0, 1.0) = 1.0
    });

    it('identifies bottleneck resource', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5, energy: 1 },
        placed: true
      };

      gameState.resources.ore = 4; // Only 80%
      gameState.resources.energy = 10; // Abundant

      gameState.calculateCardEfficiency('processor');
      expect(gameState.efficiencies.processor.bottleneck).toBe('ore');
      expect(gameState.efficiencies.processor.value).toBeCloseTo(0.8);
    });

    it('handles zero availability (0% efficiency)', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.resources.ore = 0;
      const efficiency = gameState.calculateCardEfficiency('processor');
      expect(efficiency).toBe(0);
    });

    it('uses getTrueResourceValue for fractional resources', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.resources.ore = 4;
      gameState.resourceAccumulators.ore = 0.5;
      // True value: 4.5, efficiency: 4.5/5 = 0.9

      const efficiency = gameState.calculateCardEfficiency('processor');
      expect(efficiency).toBeCloseTo(0.9);
    });

    it('emits card:efficiency:changed event', () => {
      let eventData = null;
      gameState.on('card:efficiency:changed', (data) => {
        eventData = data;
      });

      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.resources.ore = 3;
      gameState.calculateCardEfficiency('processor');

      expect(eventData).not.toBeNull();
      expect(eventData.cardId).toBe('processor');
      expect(eventData.efficiency.value).toBeCloseTo(0.6);
    });

    it('updates productionRates when they exist', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.productionRates.processor = {
        baseRate: 2.0,
        efficiency: 1.0,
        actualRate: 2.0
      };

      gameState.resources.ore = 2.5; // 50% efficiency
      gameState.calculateCardEfficiency('processor');

      expect(gameState.productionRates.processor.efficiency).toBeCloseTo(0.5);
      expect(gameState.productionRates.processor.actualRate).toBeCloseTo(1.0); // 2.0 * 0.5
    });

    it('handles invalid card ID gracefully', () => {
      const efficiency = gameState.calculateCardEfficiency('nonexistent');
      expect(efficiency).toBe(0);
    });
  });

  describe('getCardStatusLED', () => {
    beforeEach(() => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };
    });

    it('returns green for base producers', () => {
      gameState.cards.extractor = {
        id: 'extractor',
        inputRequirements: {},
        placed: true
      };

      gameState.calculateCardEfficiency('extractor');
      expect(gameState.getCardStatusLED('extractor')).toBe('green');
    });

    it('returns green for efficiency >= 80%', () => {
      gameState.resources.ore = 4; // 80% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('green');

      gameState.resources.ore = 5; // 100% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('green');
    });

    it('returns yellow for efficiency 40-79%', () => {
      gameState.resources.ore = 2.5; // 50% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('yellow');

      gameState.resources.ore = 2; // 40% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('yellow');
    });

    it('returns red for efficiency < 40%', () => {
      gameState.resources.ore = 1; // 20% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('red');

      gameState.resources.ore = 0; // 0% efficiency
      gameState.calculateCardEfficiency('processor');
      expect(gameState.getCardStatusLED('processor')).toBe('red');
    });

    it('handles cards without efficiency data', () => {
      // Before calculateCardEfficiency called
      expect(gameState.getCardStatusLED('processor')).toBe('green');
    });
  });

  describe('Efficiency edge cases', () => {
    it('handles cards with undefined inputRequirements', () => {
      gameState.cards.test = {
        id: 'test',
        placed: true
        // inputRequirements not defined
      };

      const efficiency = gameState.calculateCardEfficiency('test');
      expect(efficiency).toBe(1.0);
    });

    it('handles very small fractional requirements', () => {
      gameState.cards.test = {
        id: 'test',
        inputRequirements: { ore: 0.1 },
        placed: true
      };

      gameState.resources.ore = 0.05;
      const efficiency = gameState.calculateCardEfficiency('test');
      expect(efficiency).toBeCloseTo(0.5);
    });

    it('clamps over-abundance to 100%', () => {
      gameState.cards.processor = {
        id: 'processor',
        inputRequirements: { ore: 5 },
        placed: true
      };

      gameState.resources.ore = 500; // 100x requirement
      const efficiency = gameState.calculateCardEfficiency('processor');
      expect(efficiency).toBe(1.0); // Clamped to 100%
    });
  });
});
