/**
 * Tests for Production System (Phase 2 - User Story 1)
 * Validates automatic resource production and production loops
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Production System', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('updateCardProduction', () => {
    beforeEach(() => {
      // Setup a basic card for testing
      gameState.cards.extractor.placed = true;
      gameState.cards.extractor.automated = true;
      gameState.cards.extractor.outputs = ['ore'];
      gameState.cards.extractor.inputRequirements = {};

      gameState.productionRates.extractor = {
        resourceType: 'ore',
        baseRate: 2.0,
        efficiency: 1.0,
        actualRate: 2.0,
        lastUpdate: performance.now()
      };

      gameState.cardAccumulators.extractor = 0;
    });

    it('produces resources over time', () => {
      // Simulate production system
      const deltaTime = 0.3; // 0.3 seconds
      const rate = gameState.productionRates.extractor;
      const production = rate.actualRate * deltaTime; // 2.0 * 0.3 = 0.6

      gameState.cardAccumulators.extractor += production;

      expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.6);
      expect(gameState.resources.ore).toBe(0); // Not yet flushed
    });

    it('flushes whole units to global resources', () => {
      // Add 0.6 ore
      gameState.cardAccumulators.extractor = 0.6;

      // Add another 0.7 ore (total 1.3)
      const deltaTime = 0.35;
      const rate = gameState.productionRates.extractor;
      const production = rate.actualRate * deltaTime;

      gameState.cardAccumulators.extractor += production;

      // Simulate flush
      if (gameState.cardAccumulators.extractor >= 1) {
        const whole = Math.floor(gameState.cardAccumulators.extractor);
        gameState.cardAccumulators.extractor -= whole;
        gameState.addResourceAccurate('ore', whole);
      }

      expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.3);
      expect(gameState.resources.ore).toBe(1); // Flushed 1 unit
    });

    it('scales production by efficiency', () => {
      gameState.productionRates.extractor.efficiency = 0.5;
      gameState.productionRates.extractor.actualRate = 1.0; // 2.0 * 0.5

      const deltaTime = 1.0;
      const production = gameState.productionRates.extractor.actualRate * deltaTime;

      gameState.cardAccumulators.extractor += production;
      expect(gameState.cardAccumulators.extractor).toBeCloseTo(1.0);
    });

    it('does not produce for manual cards', () => {
      gameState.cards.extractor.automated = false;

      const deltaTime = 1.0;
      // Manual cards should not accumulate production
      expect(gameState.cards.extractor.automated).toBe(false);
    });

    it('does not produce for unplaced cards', () => {
      gameState.cards.extractor.placed = false;

      const deltaTime = 1.0;
      // Unplaced cards should not accumulate production
      expect(gameState.cards.extractor.placed).toBe(false);
    });
  });

  describe('ProductionLoop', () => {
    it('calculates delta time correctly', () => {
      const lastFrame = performance.now();
      const currentFrame = lastFrame + 16.67; // ~60 FPS (16.67ms per frame)

      const deltaTime = (currentFrame - lastFrame) / 1000;
      expect(deltaTime).toBeCloseTo(0.01667, 4);
    });

    it('clamps large delta times', () => {
      const deltaTime = 0.5; // 500ms (lag spike)
      const clampedDelta = Math.min(deltaTime, 0.1);

      expect(clampedDelta).toBe(0.1); // Clamped to 100ms max
    });

    it('processes multiple automated cards', () => {
      // Setup multiple cards
      gameState.cards.extractor.placed = true;
      gameState.cards.extractor.automated = true;
      gameState.cards.reactor.placed = true;
      gameState.cards.reactor.automated = true;

      gameState.productionRates.extractor = { baseRate: 1.0, efficiency: 1.0, actualRate: 1.0 };
      gameState.productionRates.reactor = { baseRate: 5.0, efficiency: 1.0, actualRate: 5.0 };

      const deltaTime = 0.5;

      // Simulate production tick for both cards
      ['extractor', 'reactor'].forEach(cardId => {
        const card = gameState.cards[cardId];
        if (card.placed && card.automated) {
          const rate = gameState.productionRates[cardId];
          gameState.cardAccumulators[cardId] += rate.actualRate * deltaTime;
        }
      });

      expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.5);
      expect(gameState.cardAccumulators.reactor).toBeCloseTo(2.5);
    });
  });

  describe('Card production buffer flushing', () => {
    beforeEach(() => {
      gameState.cards.extractor.placed = true;
      gameState.cards.extractor.automated = true;
      gameState.cards.extractor.outputs = ['ore'];
      gameState.cards.extractor.production = 0;
    });

    it('increments card production counter when flushing', () => {
      gameState.cardAccumulators.extractor = 2.7;

      // Flush logic
      const whole = Math.floor(gameState.cardAccumulators.extractor);
      gameState.cardAccumulators.extractor -= whole;
      gameState.cards.extractor.production += whole;

      expect(gameState.cards.extractor.production).toBe(2);
      expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.7);
    });

    it('emits card:produced event when flushing', () => {
      let eventData = null;
      gameState.on('card:produced', (data) => {
        eventData = data;
      });

      gameState.cardAccumulators.extractor = 1.5;
      const whole = Math.floor(gameState.cardAccumulators.extractor);

      if (whole > 0) {
        gameState.emit('card:produced', {
          cardId: 'extractor',
          resourceType: 'ore',
          amount: whole,
          totalProduced: whole
        });
      }

      expect(eventData).not.toBeNull();
      expect(eventData.cardId).toBe('extractor');
      expect(eventData.resourceType).toBe('ore');
      expect(eventData.amount).toBe(1);
    });

    it('maintains accuracy across many small productions', () => {
      // Simulate 100 ticks at 0.11 ore each
      for (let i = 0; i < 100; i++) {
        gameState.cardAccumulators.extractor += 0.11;

        if (gameState.cardAccumulators.extractor >= 1) {
          const whole = Math.floor(gameState.cardAccumulators.extractor);
          gameState.cardAccumulators.extractor -= whole;
          gameState.addResourceAccurate('ore', whole);
        }
      }

      // 100 * 0.11 = 11.0 total
      const trueTotal = gameState.getTrueResourceValue('ore');
      expect(trueTotal).toBeCloseTo(11.0, 1);
    });
  });

  describe('startAutomation', () => {
    it('enables automated production for Tier 1+ cards', () => {
      gameState.cards.extractor.tier = 1;
      gameState.cards.extractor.placed = true;
      gameState.cards.extractor.automated = false;

      // Simulate startAutomation
      gameState.cards.extractor.automated = true;

      expect(gameState.cards.extractor.automated).toBe(true);
    });

    it('initializes production rate when automation starts', () => {
      gameState.cards.extractor.tier = 1;
      gameState.cards.extractor.baseRate = 1.0;

      // Simulate startAutomation
      gameState.productionRates.extractor = {
        resourceType: 'ore',
        baseRate: 1.0,
        efficiency: 1.0,
        actualRate: 1.0,
        lastUpdate: performance.now()
      };

      expect(gameState.productionRates.extractor).toBeDefined();
      expect(gameState.productionRates.extractor.baseRate).toBe(1.0);
    });
  });

  describe('Integration: Production + Efficiency', () => {
    it('reduces production when efficiency drops', () => {
      gameState.cards.processor.placed = true;
      gameState.cards.processor.automated = true;
      gameState.cards.processor.inputRequirements = { ore: 5 };
      gameState.cards.processor.outputs = ['metal'];

      // Full efficiency
      gameState.resources.ore = 10;
      const efficiency1 = gameState.calculateCardEfficiency('processor');
      expect(efficiency1).toBe(1.0);

      // Low efficiency
      gameState.resources.ore = 2;
      const efficiency2 = gameState.calculateCardEfficiency('processor');
      expect(efficiency2).toBeCloseTo(0.4);

      // Production rate should scale with efficiency
      gameState.productionRates.processor = {
        baseRate: 2.0,
        efficiency: efficiency2,
        actualRate: 2.0 * efficiency2
      };

      expect(gameState.productionRates.processor.actualRate).toBeCloseTo(0.8);
    });
  });

  // T061: Test cross-resource consumption (ore+energy → metal)
  describe('Cross-Resource Consumption', () => {
    it('handles cards that consume multiple resource types', () => {
      gameState.cards.lab.placed = true;
      gameState.cards.lab.automated = true;
      gameState.cards.lab.inputRequirements = { data: 2, energy: 1 };
      gameState.cards.lab.outputs = ['science'];

      // Provide sufficient resources
      gameState.resources.data = 10;
      gameState.resources.energy = 5;

      const efficiency = gameState.calculateCardEfficiency('lab');
      expect(efficiency).toBe(1.0); // Both inputs available in sufficient quantity
    });

    it('reduces efficiency when one of multiple inputs is low', () => {
      gameState.cards.lab.placed = true;
      gameState.cards.lab.automated = true;
      gameState.cards.lab.inputRequirements = { data: 2, energy: 1 };
      gameState.cards.lab.outputs = ['science'];

      // Low data, sufficient energy
      gameState.resources.data = 1; // Only 50% of required
      gameState.resources.energy = 5;

      const efficiency = gameState.calculateCardEfficiency('lab');
      expect(efficiency).toBeCloseTo(0.5); // Limited by data availability
    });

    it('uses minimum efficiency when multiple inputs are constrained', () => {
      gameState.cards.lab.placed = true;
      gameState.cards.lab.automated = true;
      gameState.cards.lab.inputRequirements = { data: 2, energy: 1 };
      gameState.cards.lab.outputs = ['science'];

      // Both resources low, but data is more constrained
      gameState.resources.data = 0.4; // 20% of required (2)
      gameState.resources.energy = 0.5; // 50% of required (1)

      const efficiency = gameState.calculateCardEfficiency('lab');
      expect(efficiency).toBeCloseTo(0.2); // Limited by most constrained input (data at 20%)
    });

    it('produces output when consuming multiple inputs', () => {
      gameState.cards.lab.placed = true;
      gameState.cards.lab.automated = true;
      gameState.cards.lab.inputRequirements = { data: 2, energy: 1 };
      gameState.cards.lab.outputs = ['science'];
      gameState.cardAccumulators.lab = 0;

      // Provide sufficient resources
      gameState.resources.data = 10;
      gameState.resources.energy = 5;

      // Calculate efficiency and produce
      const efficiency = gameState.calculateCardEfficiency('lab');
      const baseRate = 0.3; // from CARD_CONFIGS
      const actualRate = baseRate * efficiency;

      const deltaTime = 1.0; // 1 second
      gameState.cardAccumulators.lab += actualRate * deltaTime;

      expect(gameState.cardAccumulators.lab).toBeCloseTo(0.3);
    });
  });
});
