/**
 * Centralized Game State Management
 * Single source of truth for all game data with event-driven architecture
 */

console.log('🎮 State module loaded');

/**
 * GameState - Centralized store for all game data
 * - Provides single source of truth for save/load
 * - Event bus for decoupled UI updates
 * - Validation for all state mutations
 * - Serialization support
 */
class GameState {
  constructor() {
    // Schema version for save compatibility
    this.version = 1;

    // Resources
    this.resources = {
      ore: 0,
      metal: 0,
      energy: 0,
      science: 0,
      data: 0,        // Phase 2: New resource type
      biomass: 0,     // Phase 2: New resource type
      nanites: 0      // Phase 2: New resource type
    };

    // Card state - Each card tracks its full state
    this.cards = {
      extractor: {
        id: 'extractor',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      sensor: {
        id: 'sensor',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      storage: {
        id: 'storage',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      processor: {
        id: 'processor',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 1
      },
      reactor: {
        id: 'reactor',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      engine: {
        id: 'engine',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      habitat: {
        id: 'habitat',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      },
      lab: {
        id: 'lab',
        placed: false,
        row: null,
        col: null,
        production: 0,
        automated: false,
        rate: 0,
        tier: 0
      }
    };

    // Grid configuration
    this.grid = {
      rows: 4,
      cols: 5
    };

    // === PHASE 2 ADDITIONS ===

    // Resource accumulators for fractional tracking
    this.resourceAccumulators = {
      ore: 0,
      metal: 0,
      energy: 0,
      science: 0,
      data: 0,
      biomass: 0,
      nanites: 0
    };

    // Card production accumulators
    this.cardAccumulators = {
      extractor: 0,
      sensor: 0,
      storage: 0,
      processor: 0,
      reactor: 0,
      engine: 0,
      habitat: 0,
      lab: 0
    };

    // Production rates for each card
    this.productionRates = {};

    // Efficiency tracking for each card
    this.efficiencies = {};

    // Game metadata
    this.meta = {
      phase: 'MVP Phase 1',
      playtime: 0,
      lastSave: null,
      initialized: false
    };

    // Event bus for pub/sub
    this.listeners = new Map();

    console.log('✓ GameState initialized');
  }

  // ===== RESOURCE MUTATIONS =====

  /**
   * Add resource with fractional support (Phase 2)
   * Automatically flushes whole units and emits events
   * @param {string} type - Resource type
   * @param {number} amount - Amount to add (fractional supported)
   * @returns {boolean} Success status
   */
  addResourceAccurate(type, amount) {
    // Validation
    if (!this.resources.hasOwnProperty(type)) {
      console.warn(`Invalid resource type: ${type}`);
      return false;
    }
    if (typeof amount !== 'number' || !isFinite(amount)) {
      console.warn(`Invalid amount: ${amount}`);
      return false;
    }

    // Add to accumulator
    this.resourceAccumulators[type] += amount;

    // Flush whole units
    if (Math.abs(this.resourceAccumulators[type]) >= 1) {
      const whole = Math.floor(this.resourceAccumulators[type]);
      this.resources[type] += whole;
      this.resourceAccumulators[type] -= whole;

      // Emit event for display updates
      this.emit('resource:changed', {
        type,
        total: this.resources[type],
        accumulated: this.resourceAccumulators[type]
      });
    }

    return true;
  }

  /**
   * Get true resource value (whole + fractional)
   * @param {string} type - Resource type
   * @returns {number} Precise value
   */
  getTrueResourceValue(type) {
    if (!this.resources.hasOwnProperty(type)) {
      return 0;
    }
    return this.resources[type] + this.resourceAccumulators[type];
  }

  /**
   * Add resource with validation (legacy method for Phase 1 compatibility)
   * @param {string} type - Resource type (ore, metal, energy, science)
   * @param {number} amount - Amount to add
   * @returns {boolean} Success status
   */
  addResource(type, amount) {
    // Validation
    if (!this.resources.hasOwnProperty(type)) {
      console.warn(`Invalid resource type: ${type}`);
      return false;
    }
    if (typeof amount !== 'number' || !isFinite(amount)) {
      console.warn(`Invalid amount: ${amount}`);
      return false;
    }

    // Mutation
    this.resources[type] += amount;

    // Emit event
    this.emit('resource:changed', {
      type,
      amount,
      total: this.resources[type]
    });

    console.log(`+${amount} ${type} (Total: ${this.resources[type]})`);
    return true;
  }

  /**
   * Subtract resource with validation (prevents negative)
   * @param {string} type - Resource type
   * @param {number} amount - Amount to subtract
   * @returns {boolean} Success status
   */
  subtractResource(type, amount) {
    // Validation
    if (!this.resources.hasOwnProperty(type)) {
      console.warn(`Invalid resource type: ${type}`);
      return false;
    }
    if (typeof amount !== 'number' || !isFinite(amount)) {
      console.warn(`Invalid amount: ${amount}`);
      return false;
    }

    // Check if we have enough
    if (this.resources[type] < amount) {
      console.warn(`Insufficient ${type}: have ${this.resources[type]}, need ${amount}`);
      return false;
    }

    // Mutation
    this.resources[type] = Math.max(0, this.resources[type] - amount);

    // Emit event
    this.emit('resource:changed', {
      type,
      amount: -amount,
      total: this.resources[type]
    });

    console.log(`-${amount} ${type} (Total: ${this.resources[type]})`);
    return true;
  }

  /**
   * Get resource amount
   * @param {string} type - Resource type
   * @returns {number} Current amount
   */
  getResource(type) {
    return this.resources.hasOwnProperty(type) ? this.resources[type] : 0;
  }

  /**
   * Check if player has enough resources
   * @param {Object} costs - { ore: 10, metal: 5, ... }
   * @returns {boolean} Has enough resources
   */
  hasResources(costs) {
    for (const [type, amount] of Object.entries(costs)) {
      if (this.getResource(type) < amount) {
        return false;
      }
    }
    return true;
  }

  // ===== PHASE 2: EFFICIENCY & PRODUCTION =====

  /**
   * Calculate card efficiency based on input availability
   * @param {string} cardId - Card identifier
   * @returns {number} Efficiency from 0.0 to 1.0
   */
  calculateCardEfficiency(cardId) {
    const card = this.cards[cardId];
    if (!card) {
      console.warn(`Invalid card ID: ${cardId}`);
      return 0;
    }

    // Base producer check (no inputs required)
    if (!card.inputRequirements || Object.keys(card.inputRequirements).length === 0) {
      this.efficiencies[cardId] = {
        value: 1.0,
        bottleneck: null,
        isBaseProducer: true,
        lastCalculated: performance.now()
      };
      return 1.0;
    }

    // Calculate ratio for each input
    const ratios = Object.entries(card.inputRequirements).map(([type, required]) => {
      const available = this.getTrueResourceValue(type);
      return Math.min(available / required, 1.0);
    });

    // Efficiency = minimum ratio (bottleneck determines overall efficiency)
    const efficiency = Math.min(...ratios);
    const bottleneckIndex = ratios.indexOf(efficiency);
    const bottleneck = Object.keys(card.inputRequirements)[bottleneckIndex];

    // Store efficiency
    this.efficiencies[cardId] = {
      value: efficiency,
      bottleneck,
      isBaseProducer: false,
      lastCalculated: performance.now()
    };

    // Update production rate if it exists
    if (this.productionRates[cardId]) {
      this.productionRates[cardId].efficiency = efficiency;
      this.productionRates[cardId].actualRate =
        this.productionRates[cardId].baseRate * efficiency;
    }

    // Emit event
    this.emit('card:efficiency:changed', {
      cardId,
      efficiency: this.efficiencies[cardId]
    });

    return efficiency;
  }

  /**
   * Get status LED color based on efficiency
   * @param {string} cardId - Card identifier
   * @returns {string} 'green' | 'yellow' | 'red'
   */
  getCardStatusLED(cardId) {
    const efficiency = this.efficiencies[cardId];

    if (!efficiency || efficiency.isBaseProducer) {
      return 'green';
    }

    if (efficiency.value >= 0.80) return 'green';
    if (efficiency.value >= 0.40) return 'yellow';
    return 'red';
  }

  // ===== CARD MUTATIONS =====

  /**
   * Increment card production count
   * @param {string} cardId - Card identifier
   * @returns {boolean} Success status
   */
  incrementProduction(cardId) {
    if (!this.cards.hasOwnProperty(cardId)) {
      console.warn(`Invalid card ID: ${cardId}`);
      return false;
    }

    this.cards[cardId].production++;

    this.emit('card:production', {
      cardId,
      production: this.cards[cardId].production
    });

    return true;
  }

  /**
   * Update card position on grid
   * @param {string} cardId - Card identifier
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} Success status
   */
  placeCard(cardId, row, col) {
    if (!this.cards.hasOwnProperty(cardId)) {
      console.warn(`Invalid card ID: ${cardId}`);
      return false;
    }

    // Validation
    if (row < 0 || row >= this.grid.rows || col < 0 || col >= this.grid.cols) {
      console.warn(`Invalid position: [${row}, ${col}]`);
      return false;
    }

    // Mutation
    this.cards[cardId].placed = true;
    this.cards[cardId].row = row;
    this.cards[cardId].col = col;

    // Emit event
    this.emit('card:placed', {
      cardId,
      row,
      col
    });

    console.log(`Card ${cardId} placed at [${row}, ${col}]`);
    return true;
  }

  /**
   * Remove card from grid
   * @param {string} cardId - Card identifier
   * @returns {boolean} Success status
   */
  removeCard(cardId) {
    if (!this.cards.hasOwnProperty(cardId)) {
      console.warn(`Invalid card ID: ${cardId}`);
      return false;
    }

    // Mutation
    this.cards[cardId].placed = false;
    this.cards[cardId].row = null;
    this.cards[cardId].col = null;

    // Emit event
    this.emit('card:removed', { cardId });

    console.log(`Card ${cardId} removed from grid`);
    return true;
  }

  /**
   * Get card state
   * @param {string} cardId - Card identifier
   * @returns {Object|null} Card state
   */
  getCard(cardId) {
    return this.cards.hasOwnProperty(cardId) ? this.cards[cardId] : null;
  }

  // ===== EVENT BUS =====

  /**
   * Subscribe to events
   * @param {string} event - Event name (e.g., 'resource:changed')
   * @param {Function} callback - Handler function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from events
   * @param {string} event - Event name
   * @param {Function} callback - Handler function to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Event handler error for ${event}:`, err);
        }
      });
    }
  }

  // ===== SERIALIZATION =====

  /**
   * Serialize to JSON for saving (Phase 2 updated)
   * @returns {Object} Serialized state
   */
  toJSON() {
    return {
      version: this.version,
      resources: { ...this.resources },
      resourceAccumulators: { ...this.resourceAccumulators },  // Phase 2
      cardAccumulators: { ...this.cardAccumulators },          // Phase 2
      productionRates: JSON.parse(JSON.stringify(this.productionRates)), // Phase 2
      cards: JSON.parse(JSON.stringify(this.cards)), // Deep copy
      grid: { ...this.grid },
      meta: { ...this.meta }
    };
  }

  /**
   * Deserialize from JSON (for loading)
   * @param {Object} data - Saved state data
   * @returns {boolean} Success status
   */
  fromJSON(data) {
    try {
      // Version check
      if (data.version !== this.version) {
        console.warn(`Save version mismatch: ${data.version} vs ${this.version}`);
        data = this.migrate(data);
      }

      // Validation
      if (!this.validate(data)) {
        console.error('Invalid save data');
        return false;
      }

      // Restore state
      this.resources = { ...data.resources };

      // Phase 2: Restore accumulators (backwards compatible)
      this.resourceAccumulators = data.resourceAccumulators || {
        ore: 0, metal: 0, energy: 0, science: 0, data: 0, biomass: 0, nanites: 0
      };
      this.cardAccumulators = data.cardAccumulators || {
        extractor: 0, sensor: 0, storage: 0, processor: 0, reactor: 0, engine: 0, habitat: 0, lab: 0
      };
      this.productionRates = data.productionRates || {};

      this.cards = JSON.parse(JSON.stringify(data.cards));
      this.grid = { ...data.grid };
      this.meta = { ...data.meta };

      // Phase 2: Recalculate efficiencies after load
      Object.keys(this.cards).forEach(cardId => {
        if (this.cards[cardId].placed && this.cards[cardId].automated) {
          this.calculateCardEfficiency(cardId);
        }
      });

      // Emit restore event
      this.emit('state:restored', { data });

      console.log('✓ State restored from save');
      return true;
    } catch (err) {
      console.error('Failed to restore state:', err);
      return false;
    }
  }

  /**
   * Validate save data
   * @param {Object} data - Data to validate
   * @returns {boolean} Is valid
   */
  validate(data) {
    // Check required fields
    if (!data.version || !data.resources || !data.cards) {
      return false;
    }

    // Validate resources
    for (const value of Object.values(data.resources)) {
      if (typeof value !== 'number' || !isFinite(value) || value < 0) {
        return false;
      }
    }

    // Validate cards
    for (const card of Object.values(data.cards)) {
      if (typeof card.production !== 'number' || card.production < 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Migrate old save to new version
   * @param {Object} data - Old save data
   * @returns {Object} Migrated data
   */
  migrate(data) {
    console.log(`Migrating save from v${data.version} to v${this.version}`);
    // Future: Add migration logic for breaking changes
    return data;
  }

  // ===== DEBUG UTILITIES =====

  /**
   * Get full state snapshot (for debugging)
   * @returns {Object} Full state
   */
  inspect() {
    return this.toJSON();
  }

  /**
   * Reset to initial state
   */
  reset() {
    const fresh = new GameState();
    this.resources = fresh.resources;
    this.cards = fresh.cards;
    this.grid = fresh.grid;
    this.meta = fresh.meta;

    this.emit('state:reset', {});
    console.log('✓ State reset to initial values');
  }
}

// Create singleton instance
const gameState = new GameState();

// Export
export { gameState, GameState };
