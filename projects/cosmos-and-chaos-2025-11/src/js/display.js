/**
 * Display System (Phase 2 - User Story 2)
 * Manages visual updates including Status LEDs and throttled counters
 */

import { gameState } from './state.js';
import { formatNumber } from './utils.js';

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

    // Track card priorities/tiers for update rate assignment
    this.cardPriorities = {};

    // Bind methods
    this.tick = this.tick.bind(this);
    this.handleEfficiencyChange = this.handleEfficiencyChange.bind(this);
    this.handleResourceChange = this.handleResourceChange.bind(this);
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
    gameState.on('resource:changed', this.handleResourceChange);

    // Initial resource display update
    this.updateResourceDisplay();

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
    gameState.off('resource:changed', this.handleResourceChange);

    console.log('✓ Display loop stopped');
  }

  /**
   * Register a card with its tier/priority for update rate assignment (T073)
   * @param {string} cardId - Card identifier
   * @param {number} tier - Card tier (0, 1, 2, etc.)
   */
  registerCard(cardId, tier) {
    // Map tier to update priority
    // Tier 0 = primary (2Hz), Tier 1 = secondary (1Hz), Tier 2+ = tertiary (0.5Hz)
    let priority;
    if (tier === 0) {
      priority = 'primary';
    } else if (tier === 1) {
      priority = 'secondary';
    } else {
      priority = 'tertiary';
    }

    this.cardPriorities[cardId] = priority;
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

    // Determine rate based on registered priority
    const priority = this.cardPriorities[cardId] || 'primary';
    const rateHz = this.updateRates[priority];
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

  /**
   * Update global resource display panel (T064)
   * Updates all resource values in the UI with formatted numbers
   */
  updateResourceDisplay() {
    const resourceElements = document.querySelectorAll('.resource-value[data-resource]');

    resourceElements.forEach(element => {
      const resourceType = element.dataset.resource;
      const value = gameState.getTrueResourceValue(resourceType);

      // Apply formatNumber for large values (T069)
      element.textContent = formatNumber(Math.floor(value));
    });
  }

  /**
   * Event Handler: Resource Changed (T070)
   * @param {Object} data { resourceType, amount, total }
   */
  handleResourceChange(data) {
    // Update the specific resource display
    const element = document.querySelector(`.resource-value[data-resource="${data.resourceType}"]`);
    if (element) {
      const value = gameState.getTrueResourceValue(data.resourceType);
      element.textContent = formatNumber(Math.floor(value));
    }
  }
}

// Singleton instance
export const displayManager = new DisplayUpdateManager();

// Export for testing/window
if (typeof window !== 'undefined') {
  window.displayManager = displayManager;
}
