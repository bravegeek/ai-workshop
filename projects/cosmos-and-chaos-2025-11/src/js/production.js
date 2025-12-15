/**
 * Production System (Phase 2 - User Story 1)
 * Handles automatic resource production for placed, automated cards
 */

import { gameState } from './state.js';

console.log('🏭 Production module loaded');

/**
 * Update card production based on time delta
 * @param {string} cardId - Card identifier
 * @param {number} deltaTime - Time elapsed in seconds
 * @returns {number} Amount produced (fractional)
 */
export function updateCardProduction(cardId, deltaTime) {
  const card = gameState.cards[cardId];

  // Skip if not automated or not placed
  if (!card || !card.automated || !card.placed) {
    return 0;
  }

  // Get production rate
  const rate = gameState.productionRates[cardId];
  if (!rate) {
    console.warn(`No production rate configured for ${cardId}`);
    return 0;
  }

  // Calculate production for this tick
  const production = rate.actualRate * deltaTime;

  // Add to card's production buffer
  gameState.cardAccumulators[cardId] += production;

  // Flush whole units to global resources
  if (Math.abs(gameState.cardAccumulators[cardId]) >= 1) {
    const whole = Math.floor(gameState.cardAccumulators[cardId]);
    gameState.cardAccumulators[cardId] -= whole;

    // Get output type (first output for now)
    const outputType = card.outputs && card.outputs[0];
    if (outputType) {
      // Add to global resources using accurate accumulator
      gameState.addResourceAccurate(outputType, whole);

      // Update card's production counter
      card.production += whole;

      // Emit production event
      gameState.emit('card:produced', {
        cardId,
        resourceType: outputType,
        amount: whole,
        totalProduced: card.production
      });
    }
  }

  return production;
}

/**
 * ProductionLoop - Main game loop for automatic production
 * Runs at 60 FPS, updating all automated cards
 */
export class ProductionLoop {
  constructor() {
    this.isRunning = false;
    this.lastFrame = performance.now();
    this.rafId = null;
  }

  /**
   * Start the production loop
   */
  start() {
    if (this.isRunning) {
      console.warn('Production loop already running');
      return;
    }

    this.isRunning = true;
    this.lastFrame = performance.now();
    this.tick();
    console.log('✓ Production loop started');
  }

  /**
   * Stop the production loop
   */
  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    console.log('✓ Production loop stopped');
  }

  /**
   * Main game tick - updates all automated cards
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  tick = (timestamp = performance.now()) => {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastFrame) / 1000;
    this.lastFrame = timestamp;

    // Cap delta to prevent huge jumps on lag/unfocus
    const clampedDelta = Math.min(deltaTime, 0.1); // Max 100ms

    // Update all automated cards
    Object.keys(gameState.cards).forEach(cardId => {
      const card = gameState.cards[cardId];

      if (card.placed && card.automated) {
        // Recalculate efficiency (resource availability may have changed)
        gameState.calculateCardEfficiency(cardId);

        // Update production
        updateCardProduction(cardId, clampedDelta);
      }
    });

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
  }
}

// Create singleton instance
export const productionLoop = new ProductionLoop();

// Export for testing
if (typeof window !== 'undefined') {
  window.productionLoop = productionLoop;
}
