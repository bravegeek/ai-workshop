/**
 * Display System (Phase 2 - User Story 2)
 * Manages visual updates including Status LEDs and throttled counters
 */

import { gameState } from './state.js';

console.log('🖥️ Display module loaded');

export class DisplayUpdateManager {
  constructor() {
    this.isRunning = false;
    this.lastFrame = 0;
    this.rafId = null;

    // Configurable update rates (Hz) - Phase 7 will make this more dynamic
    this.updateRates = {
      primary: 2,     // 2Hz (every 500ms) - High priority
      secondary: 1,   // 1Hz (every 1000ms) - Medium priority
      tertiary: 0.5   // 0.5Hz (every 2000ms) - Low priority
    };

    // Track last update time for each card
    this.cardLastUpdates = {};

    // Bind methods
    this.tick = this.tick.bind(this);
    this.handleEfficiencyChange = this.handleEfficiencyChange.bind(this);
  }

  /**
   * Start the display update loop
   */
  startUpdateLoop() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrame = performance.now();
    this.tick();
    
    // Subscribe to events
    gameState.on('card:efficiency:changed', this.handleEfficiencyChange);
    
    console.log('✓ Display loop started');
  }

  /**
   * Stop the display update loop
   */
  stopUpdateLoop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Unsubscribe events
    gameState.off('card:efficiency:changed', this.handleEfficiencyChange);
    
    console.log('✓ Display loop stopped');
  }

  /**
   * Check if a card should update based on its priority/tier
   * @param {string} cardId
   * @param {number} timestamp
   * @returns {boolean}
   */
  shouldUpdate(cardId, timestamp) {
    const lastUpdate = this.cardLastUpdates[cardId] || 0;
    const card = gameState.getCard(cardId);
    
    if (!card) return false;

    // Determine rate based on importance (currently just simplified)
    // Future: Use tier or specific config
    const rateHz = this.updateRates.primary; 
    const intervalMs = 1000 / rateHz;

    if (timestamp - lastUpdate >= intervalMs) {
      this.cardLastUpdates[cardId] = timestamp;
      return true;
    }
    
    return false;
  }

  /**
   * Main render loop
   * @param {number} timestamp 
   */
  tick(timestamp = performance.now()) {
    if (!this.isRunning) return;

    // In this phase, we rely mostly on events for LEDs, 
    // but the loop is prepared for counters (US1) and other frequent updates.
    // For now, the loop ensures we have a heartbeat for animations if needed.

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
  }

  /**
   * Update a specific card's display (LEDs, Counters)
   * @param {string} cardId 
   */
  updateCardDisplay(cardId) {
    const cardElement = document.querySelector(`.card[data-card-id="${cardId}"]`);
    if (!cardElement) return;

    // Update Status LED
    this.updateStatusLED(cardElement, cardId);
  }

  /**
   * Update Status LED color
   * @param {HTMLElement} cardElement 
   * @param {string} cardId 
   */
  updateStatusLED(cardElement, cardId) {
    const led = cardElement.querySelector('.status-led');
    if (!led) return;

    const status = gameState.getCardStatusLED(cardId);
    
    // Reset classes
    led.classList.remove('green', 'yellow', 'red');
    
    // Add new status class
    led.classList.add(status);
  }

  /**
   * Event Handler: Efficiency Changed
   * @param {Object} data { cardId, efficiency }
   */
  handleEfficiencyChange(data) {
    this.updateCardDisplay(data.cardId);
  }
}

// Singleton instance
export const displayManager = new DisplayUpdateManager();

// Export for testing/window
if (typeof window !== 'undefined') {
  window.displayManager = displayManager;
}
