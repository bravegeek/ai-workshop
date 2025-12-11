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
