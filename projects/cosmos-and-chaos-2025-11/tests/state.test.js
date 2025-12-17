/**
 * Unit tests for GameState (state.js)
 * Tests centralized state management, event bus, and serialization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameState } from '../src/js/state.js'

describe('GameState - Resource Management', () => {
  let state

  beforeEach(() => {
    state = new GameState()
  })

  it('should initialize with zero resources', () => {
    expect(state.resources.ore).toBe(0)
    expect(state.resources.metal).toBe(0)
    expect(state.resources.energy).toBe(0)
    expect(state.resources.science).toBe(0)
  })

  it('should add resources correctly', () => {
    const success = state.addResource('ore', 10)
    expect(success).toBe(true)
    expect(state.getResource('ore')).toBe(10)
  })

  it('should accumulate multiple additions', () => {
    state.addResource('ore', 5)
    state.addResource('ore', 3)
    state.addResource('ore', 2)
    expect(state.getResource('ore')).toBe(10)
  })

  it('should reject invalid resource types', () => {
    const success = state.addResource('invalid', 10)
    expect(success).toBe(false)
    expect(state.resources.invalid).toBeUndefined()
  })

  it('should reject invalid amounts (non-number)', () => {
    const success = state.addResource('ore', 'ten')
    expect(success).toBe(false)
    expect(state.getResource('ore')).toBe(0)
  })

  it('should reject invalid amounts (NaN)', () => {
    const success = state.addResource('ore', NaN)
    expect(success).toBe(false)
    expect(state.getResource('ore')).toBe(0)
  })

  it('should reject invalid amounts (Infinity)', () => {
    const success = state.addResource('ore', Infinity)
    expect(success).toBe(false)
    expect(state.getResource('ore')).toBe(0)
  })

  it('should subtract resources correctly', () => {
    state.addResource('ore', 100)
    const success = state.subtractResource('ore', 30)
    expect(success).toBe(true)
    expect(state.getResource('ore')).toBe(70)
  })

  it('should prevent negative resources', () => {
    state.addResource('ore', 10)
    const success = state.subtractResource('ore', 20)
    expect(success).toBe(false)
    expect(state.getResource('ore')).toBe(10) // Should remain unchanged
  })

  it('should check if player has resources', () => {
    state.addResource('ore', 50)
    state.addResource('metal', 10)

    expect(state.hasResources({ ore: 30, metal: 5 })).toBe(true)
    expect(state.hasResources({ ore: 60 })).toBe(false)
    expect(state.hasResources({ metal: 20 })).toBe(false)
  })

  it('should return 0 for non-existent resources', () => {
    expect(state.getResource('nonexistent')).toBe(0)
  })
})

describe('GameState - Card Management', () => {
  let state

  beforeEach(() => {
    state = new GameState()
  })

  it('should initialize with all cards unplaced', () => {
    expect(state.cards.extractor.placed).toBe(false)
    expect(state.cards.sensor.placed).toBe(false)
    expect(state.cards.storage.placed).toBe(false)
  })

  it('should initialize cards with zero production', () => {
    expect(state.cards.extractor.production).toBe(0)
    expect(state.cards.reactor.production).toBe(0)
  })

  it('should increment production count', () => {
    const success = state.incrementProduction('extractor')
    expect(success).toBe(true)
    expect(state.cards.extractor.production).toBe(1)
  })

  it('should accumulate production increments', () => {
    state.incrementProduction('extractor')
    state.incrementProduction('extractor')
    state.incrementProduction('extractor')
    expect(state.cards.extractor.production).toBe(3)
  })

  it('should reject invalid card IDs for production', () => {
    const success = state.incrementProduction('invalid')
    expect(success).toBe(false)
  })

  it('should place cards on grid', () => {
    const success = state.placeCard('extractor', 0, 0)
    expect(success).toBe(true)
    expect(state.cards.extractor.placed).toBe(true)
    expect(state.cards.extractor.row).toBe(0)
    expect(state.cards.extractor.col).toBe(0)
  })

  it('should reject out-of-bounds row placement', () => {
    const success = state.placeCard('extractor', -1, 0)
    expect(success).toBe(false)
    expect(state.cards.extractor.placed).toBe(false)
  })

  it('should reject out-of-bounds col placement', () => {
    const success = state.placeCard('extractor', 0, 10)
    expect(success).toBe(false)
    expect(state.cards.extractor.placed).toBe(false)
  })

  it('should remove cards from grid', () => {
    state.placeCard('extractor', 1, 2)
    const success = state.removeCard('extractor')
    expect(success).toBe(true)
    expect(state.cards.extractor.placed).toBe(false)
    expect(state.cards.extractor.row).toBe(null)
    expect(state.cards.extractor.col).toBe(null)
  })

  it('should get card state', () => {
    state.placeCard('extractor', 1, 1)
    state.incrementProduction('extractor')

    const card = state.getCard('extractor')
    expect(card.placed).toBe(true)
    expect(card.row).toBe(1)
    expect(card.col).toBe(1)
    expect(card.production).toBe(1)
  })

  it('should return null for invalid card IDs', () => {
    const card = state.getCard('invalid')
    expect(card).toBe(null)
  })
})

describe('GameState - Event Bus', () => {
  let state

  beforeEach(() => {
    state = new GameState()
  })

  it('should emit events to subscribers', () => {
    const listener = vi.fn()
    state.on('resource:changed', listener)

    state.addResource('ore', 10)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      type: 'ore',
      amount: 10,
      total: 10
    })
  })

  it('should support multiple listeners for same event', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    state.on('resource:changed', listener1)
    state.on('resource:changed', listener2)

    state.addResource('metal', 5)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it('should emit card production events', () => {
    const listener = vi.fn()
    state.on('card:production', listener)

    state.incrementProduction('sensor')

    expect(listener).toHaveBeenCalledWith({
      cardId: 'sensor',
      production: 1
    })
  })

  it('should emit card placement events', () => {
    const listener = vi.fn()
    state.on('card:placed', listener)

    state.placeCard('reactor', 2, 3)

    expect(listener).toHaveBeenCalledWith({
      cardId: 'reactor',
      row: 2,
      col: 3
    })
  })

  it('should unsubscribe listeners', () => {
    const listener = vi.fn()
    state.on('resource:changed', listener)
    state.off('resource:changed', listener)

    state.addResource('ore', 10)

    expect(listener).not.toHaveBeenCalled()
  })

  it('should handle errors in event listeners gracefully', () => {
    const errorListener = vi.fn(() => { throw new Error('Test error') })
    const goodListener = vi.fn()

    state.on('resource:changed', errorListener)
    state.on('resource:changed', goodListener)

    // Should not throw
    expect(() => state.addResource('ore', 10)).not.toThrow()

    // Good listener should still be called
    expect(goodListener).toHaveBeenCalled()
  })
})

describe('GameState - Serialization', () => {
  let state

  beforeEach(() => {
    state = new GameState()
  })

  it('should serialize to JSON', () => {
    state.addResource('ore', 50)
    state.addResource('metal', 10)
    state.placeCard('extractor', 0, 0)
    state.incrementProduction('extractor')

    const json = state.toJSON()

    expect(json.version).toBe(1)
    expect(json.resources.ore).toBe(50)
    expect(json.resources.metal).toBe(10)
    expect(json.cards.extractor.placed).toBe(true)
    expect(json.cards.extractor.production).toBe(1)
  })

  it('should deserialize from JSON', () => {
    const saveData = {
      version: 1,
      resources: { ore: 100, metal: 20, energy: 50, science: 5 },
      cards: {
        extractor: { id: 'extractor', placed: true, row: 1, col: 1, production: 10, automated: false, rate: 0, tier: 0 },
        sensor: { id: 'sensor', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 },
        storage: { id: 'storage', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 },
        processor: { id: 'processor', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 1 },
        reactor: { id: 'reactor', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 },
        engine: { id: 'engine', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 },
        habitat: { id: 'habitat', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 },
        lab: { id: 'lab', placed: false, row: null, col: null, production: 0, automated: false, rate: 0, tier: 0 }
      },
      grid: { rows: 4, cols: 5 },
      meta: { phase: 'MVP Phase 1', playtime: 0, lastSave: null, initialized: false }
    }

    const success = state.fromJSON(saveData)

    expect(success).toBe(true)
    expect(state.getResource('ore')).toBe(100)
    expect(state.cards.extractor.production).toBe(10)
    expect(state.cards.extractor.placed).toBe(true)
  })

  it('should validate save data structure', () => {
    const validData = {
      version: 1,
      resources: { ore: 10, metal: 5, energy: 20, science: 2 },
      cards: {
        extractor: { production: 0 },
        sensor: { production: 0 },
        storage: { production: 0 },
        processor: { production: 0 },
        reactor: { production: 0 },
        engine: { production: 0 },
        habitat: { production: 0 },
        lab: { production: 0 }
      }
    }

    expect(state.validate(validData)).toBe(true)
  })

  it('should reject invalid save data (missing version)', () => {
    const invalidData = {
      resources: { ore: 10 }
    }

    expect(state.validate(invalidData)).toBe(false)
  })

  it('should reject invalid save data (negative resources)', () => {
    const invalidData = {
      version: 1,
      resources: { ore: -10, metal: 5, energy: 20, science: 2 },
      cards: {}
    }

    expect(state.validate(invalidData)).toBe(false)
  })

  it('should reject invalid save data (NaN resources)', () => {
    const invalidData = {
      version: 1,
      resources: { ore: NaN, metal: 5, energy: 20, science: 2 },
      cards: {}
    }

    expect(state.validate(invalidData)).toBe(false)
  })

  it('should reset to initial state', () => {
    state.addResource('ore', 100)
    state.placeCard('extractor', 1, 1)
    state.incrementProduction('extractor')

    state.reset()

    expect(state.getResource('ore')).toBe(0)
    expect(state.cards.extractor.placed).toBe(false)
    expect(state.cards.extractor.production).toBe(0)
  })

  it('should emit reset event', () => {
    const listener = vi.fn()
    state.on('state:reset', listener)

    state.reset()

    expect(listener).toHaveBeenCalledWith({})
  })
})

describe('GameState - Integration Scenarios', () => {
  let state

  beforeEach(() => {
    state = new GameState()
  })

  it('should handle complete gameplay flow', () => {
    // Place extractor
    state.placeCard('extractor', 0, 0)

    // Click to produce ore 10 times
    for (let i = 0; i < 10; i++) {
      state.addResource('ore', 1)
      state.incrementProduction('extractor')
    }

    expect(state.getResource('ore')).toBe(10)
    expect(state.cards.extractor.production).toBe(10)

    // Place processor and convert ore to metal
    state.placeCard('processor', 0, 1)
    state.subtractResource('ore', 10)
    state.addResource('metal', 1)
    state.incrementProduction('processor')

    expect(state.getResource('ore')).toBe(0)
    expect(state.getResource('metal')).toBe(1)
  })

  it('should maintain state consistency across save/load', () => {
    // Build up state
    state.addResource('ore', 247)
    state.addResource('metal', 12)
    state.addResource('energy', 156)
    state.placeCard('extractor', 0, 0)
    state.placeCard('reactor', 1, 0)
    state.incrementProduction('extractor')
    state.incrementProduction('extractor')
    state.incrementProduction('reactor')

    // Save
    const saveData = state.toJSON()

    // Create new state and restore
    const newState = new GameState()
    newState.fromJSON(saveData)

    // Verify everything matches
    expect(newState.getResource('ore')).toBe(247)
    expect(newState.getResource('metal')).toBe(12)
    expect(newState.cards.extractor.production).toBe(2)
    expect(newState.cards.reactor.production).toBe(1)
    expect(newState.cards.extractor.placed).toBe(true)
  })
})

describe('GameState - Tier Upgrades (Phase 3)', () => {
  let state

  // Mock CARD_CONFIGS for upgrade tests
  const mockCardConfigs = {
    extractor: {
      id: 'extractor',
      name: 'PROTON CUTTER',
      upgradeCosts: {
        1: { ore: 50 }
      },
      tierBenefits: {
        1: {
          automation: true,
          rateMultiplier: 1.0,
          description: 'Unlocks automated production'
        }
      }
    },
    sensor: {
      id: 'sensor',
      name: 'ORE SCANNER',
      upgradeCosts: {
        1: { ore: 40, data: 10 }
      },
      tierBenefits: {
        1: {
          automation: true,
          rateMultiplier: 1.0,
          description: 'Unlocks automated scanning'
        }
      }
    },
    storage: {
      id: 'storage',
      name: 'CARGO BAY',
      upgradeCosts: {
        1: { ore: 30, metal: 10 }
      },
      tierBenefits: {
        1: {
          automation: false,
          capacityBonus: 1000,
          description: 'Increases storage capacity'
        }
      }
    },
    maxed: {
      id: 'maxed',
      name: 'MAXED CARD',
      upgradeCosts: {},
      tierBenefits: {}
    }
  }

  beforeEach(() => {
    state = new GameState()
    // Mock window.CARD_CONFIGS
    global.window = { CARD_CONFIGS: mockCardConfigs }
  })

  describe('canUpgrade()', () => {
    it('should return false when card ID is invalid', () => {
      const result = state.canUpgrade('invalid_card')
      expect(result).toBe(false)
    })

    it('should return false when no upgrade configuration exists', () => {
      const result = state.canUpgrade('maxed')
      expect(result).toBe(false)
    })

    it('should return false when insufficient resources (single resource)', () => {
      state.addResource('ore', 30) // Need 50
      const result = state.canUpgrade('extractor')
      expect(result).toBe(false)
    })

    it('should return true when sufficient resources (single resource)', () => {
      state.addResource('ore', 50)
      const result = state.canUpgrade('extractor')
      expect(result).toBe(true)
    })

    it('should return true when more than sufficient resources', () => {
      state.addResource('ore', 100)
      const result = state.canUpgrade('extractor')
      expect(result).toBe(true)
    })

    it('should return false when insufficient resources (multi-resource)', () => {
      state.addResource('ore', 40)
      state.addResource('data', 5) // Need ore:40, data:10
      const result = state.canUpgrade('sensor')
      expect(result).toBe(false)
    })

    it('should return false when one resource missing (multi-resource)', () => {
      state.addResource('ore', 40)
      // data is 0, need 10
      const result = state.canUpgrade('sensor')
      expect(result).toBe(false)
    })

    it('should return true when all resources sufficient (multi-resource)', () => {
      state.addResource('ore', 40)
      state.addResource('data', 10)
      const result = state.canUpgrade('sensor')
      expect(result).toBe(true)
    })

    it('should handle exact resource amounts correctly', () => {
      state.addResource('ore', 50) // Exactly 50
      const result = state.canUpgrade('extractor')
      expect(result).toBe(true)
    })

    it('should return false when card is already at max tier', () => {
      state.cards.extractor.tier = 1
      state.addResource('ore', 1000)
      const result = state.canUpgrade('extractor')
      expect(result).toBe(false) // No tier 2 upgrade defined
    })
  })

  describe('upgradeCard()', () => {
    beforeEach(() => {
      // Place cards so automation can be enabled
      state.placeCard('extractor', 0, 0)
      state.placeCard('sensor', 0, 1)
      state.placeCard('storage', 0, 2)
    })

    it('should fail when card ID is invalid', () => {
      state.addResource('ore', 100)
      const result = state.upgradeCard('invalid_card')
      expect(result).toBe(false)
    })

    it('should fail when insufficient resources', () => {
      state.addResource('ore', 30) // Need 50
      const result = state.upgradeCard('extractor')
      expect(result).toBe(false)
      expect(state.cards.extractor.tier).toBe(0) // Unchanged
      expect(state.getResource('ore')).toBe(30) // Not deducted
    })

    it('should successfully upgrade with single resource cost', () => {
      state.addResource('ore', 50)
      const result = state.upgradeCard('extractor')

      expect(result).toBe(true)
      expect(state.cards.extractor.tier).toBe(1)
      expect(state.getResource('ore')).toBe(0) // Resources deducted
    })

    it('should successfully upgrade with multi-resource cost', () => {
      state.addResource('ore', 40)
      state.addResource('data', 10)

      const result = state.upgradeCard('sensor')

      expect(result).toBe(true)
      expect(state.cards.sensor.tier).toBe(1)
      expect(state.getResource('ore')).toBe(0)
      expect(state.getResource('data')).toBe(0)
    })

    it('should enable automation when tierBenefit specifies it', () => {
      state.addResource('ore', 50)
      state.upgradeCard('extractor')

      expect(state.cards.extractor.automated).toBe(true)
    })

    it('should not enable automation when tierBenefit does not specify it', () => {
      state.addResource('ore', 30)
      state.addResource('metal', 10)
      state.upgradeCard('storage')

      expect(state.cards.storage.automated).toBe(false)
    })

    it('should emit card:upgraded event', () => {
      const listener = vi.fn()
      state.on('card:upgraded', listener)

      state.addResource('ore', 50)
      state.upgradeCard('extractor')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        cardId: 'extractor',
        newTier: 1,
        automated: true,
        benefits: mockCardConfigs.extractor.tierBenefits[1]
      })
    })

    it('should only deduct resources once (atomic operation)', () => {
      state.addResource('ore', 50)

      // Call upgrade
      state.upgradeCard('extractor')

      // Resources should be deducted exactly once
      expect(state.getResource('ore')).toBe(0)

      // Try to upgrade again (should fail - no tier 2 defined)
      const secondAttempt = state.upgradeCard('extractor')
      expect(secondAttempt).toBe(false)
      expect(state.getResource('ore')).toBe(0) // Still 0, not negative
    })

    it('should leave extra resources untouched', () => {
      state.addResource('ore', 100) // 50 more than needed
      state.addResource('metal', 20) // Extra resource

      state.upgradeCard('extractor')

      expect(state.getResource('ore')).toBe(50) // 100 - 50 cost
      expect(state.getResource('metal')).toBe(20) // Unchanged
    })

    it('should handle tier progression correctly', () => {
      // Add tier 2 upgrade for testing
      mockCardConfigs.extractor.upgradeCosts[2] = { ore: 200, metal: 50 }
      mockCardConfigs.extractor.tierBenefits[2] = {
        automation: true,
        rateMultiplier: 1.5,
        description: 'Faster production'
      }

      // First upgrade: Tier 0 -> 1
      state.addResource('ore', 300)
      state.addResource('metal', 100)
      state.upgradeCard('extractor')

      expect(state.cards.extractor.tier).toBe(1)

      // Second upgrade: Tier 1 -> 2
      const secondUpgrade = state.upgradeCard('extractor')

      expect(secondUpgrade).toBe(true)
      expect(state.cards.extractor.tier).toBe(2)
      expect(state.getResource('ore')).toBe(50) // 300 - 50 - 200
      expect(state.getResource('metal')).toBe(50) // 100 - 50
    })

    it('should fail when no upgrade available (max tier)', () => {
      state.addResource('ore', 1000)

      // Upgrade to tier 1
      state.upgradeCard('extractor')
      expect(state.cards.extractor.tier).toBe(1)

      // Try to upgrade again (no tier 2 in base config)
      const result = state.upgradeCard('extractor')

      expect(result).toBe(false)
      expect(state.cards.extractor.tier).toBe(1) // Still tier 1
    })

    it('should handle race condition check (insufficient after check)', () => {
      state.addResource('ore', 50)

      // Simulate canUpgrade passing, then resources being spent elsewhere
      const canUpgrade = state.canUpgrade('extractor')
      expect(canUpgrade).toBe(true)

      // Someone else spends the resources
      state.subtractResource('ore', 10)

      // Now upgrade should fail
      const result = state.upgradeCard('extractor')
      expect(result).toBe(false)
      expect(state.cards.extractor.tier).toBe(0) // Not upgraded
    })
  })

  describe('Upgrade Integration Scenarios', () => {
    beforeEach(() => {
      state.placeCard('extractor', 0, 0)
      state.placeCard('sensor', 0, 1)
    })

    it('should handle complete upgrade flow', () => {
      const listener = vi.fn()
      state.on('card:upgraded', listener)

      // Start with no resources
      expect(state.canUpgrade('extractor')).toBe(false)

      // Gather resources
      state.addResource('ore', 50)

      // Check if can upgrade
      expect(state.canUpgrade('extractor')).toBe(true)

      // Perform upgrade
      const success = state.upgradeCard('extractor')

      // Verify results
      expect(success).toBe(true)
      expect(state.cards.extractor.tier).toBe(1)
      expect(state.cards.extractor.automated).toBe(true)
      expect(state.getResource('ore')).toBe(0)
      expect(listener).toHaveBeenCalled()
    })

    it('should handle multiple card upgrades independently', () => {
      state.addResource('ore', 100)
      state.addResource('data', 20)

      // Upgrade extractor
      state.upgradeCard('extractor')
      expect(state.cards.extractor.tier).toBe(1)

      // Upgrade sensor
      state.upgradeCard('sensor')
      expect(state.cards.sensor.tier).toBe(1)

      // Both should be upgraded
      expect(state.cards.extractor.tier).toBe(1)
      expect(state.cards.sensor.tier).toBe(1)

      // Resources should be properly deducted
      expect(state.getResource('ore')).toBe(10) // 100 - 50 - 40
      expect(state.getResource('data')).toBe(10) // 20 - 10
    })

    it('should persist upgrade state across save/load', () => {
      state.addResource('ore', 50)
      state.upgradeCard('extractor')

      // Save state
      const saveData = state.toJSON()

      // Create new state and restore
      const newState = new GameState()
      global.window = { CARD_CONFIGS: mockCardConfigs }
      newState.fromJSON(saveData)

      // Verify tier and automation persisted
      expect(newState.cards.extractor.tier).toBe(1)
      expect(newState.cards.extractor.automated).toBe(true)
      expect(newState.getResource('ore')).toBe(0)
    })
  })
})
