/**
 * Unit tests for SaveManager (save.js)
 * Tests save/load functionality, validation, and localStorage integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SaveManager } from '../src/js/save.js'
import { GameState } from '../src/js/state.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

global.localStorage = localStorageMock

describe('SaveManager - Basic Operations', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should initialize with correct properties', () => {
    expect(saveManager.SAVE_KEY).toBe('cosmos_chaos_save')
    expect(saveManager.AUTO_SAVE_KEY).toBe('cosmos_chaos_autosave')
    expect(saveManager.VERSION).toBe(1)
  })

  it('should save game state to localStorage', () => {
    gameState.addResource('ore', 100)
    gameState.placeCard('extractor', 0, 0)

    const success = saveManager.save()

    expect(success).toBe(true)
    expect(localStorage.getItem(saveManager.SAVE_KEY)).toBeTruthy()
  })

  it('should load game state from localStorage', () => {
    // Set up initial state
    gameState.addResource('ore', 50)
    gameState.addResource('metal', 10)
    saveManager.save()

    // Create new state and load
    const newGameState = new GameState()
    const newSaveManager = new SaveManager(newGameState)
    const result = newSaveManager.load()

    expect(result).toBeTruthy()
    expect(newGameState.getResource('ore')).toBe(50)
    expect(newGameState.getResource('metal')).toBe(10)
  })

  it('should return null when no save exists', () => {
    const result = saveManager.load()
    expect(result).toBe(null)
  })

  it('should check if save exists', () => {
    expect(saveManager.hasSave()).toBe(false)

    saveManager.save()

    expect(saveManager.hasSave()).toBe(true)
  })

  it('should separate manual and auto-saves', () => {
    gameState.addResource('ore', 100)
    saveManager.save(false) // Manual save

    gameState.addResource('ore', 50)
    saveManager.save(true)  // Auto-save

    expect(saveManager.hasSave(false)).toBe(true) // Has manual save
    expect(saveManager.hasSave(true)).toBe(true)  // Has auto-save

    // Load manual save - should have 100 ore
    const newGameState1 = new GameState()
    const saveManager1 = new SaveManager(newGameState1)
    saveManager1.load(false)
    expect(newGameState1.getResource('ore')).toBe(100)

    // Load auto-save - should have 150 ore
    const newGameState2 = new GameState()
    const saveManager2 = new SaveManager(newGameState2)
    saveManager2.load(true)
    expect(newGameState2.getResource('ore')).toBe(150)
  })

  it('should delete save files', () => {
    saveManager.save()
    expect(saveManager.hasSave()).toBe(true)

    saveManager.deleteSave()
    expect(saveManager.hasSave()).toBe(false)
  })
})

describe('SaveManager - Validation', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should validate correct save data', () => {
    const validData = {
      version: 1,
      timestamp: Date.now(),
      resources: { ore: 10, metal: 5, energy: 20, science: 2 },
      cards: {
        extractor: { production: 5 },
        sensor: { production: 0 },
        storage: { production: 0 },
        processor: { production: 0 },
        reactor: { production: 0 },
        engine: { production: 0 },
        habitat: { production: 0 },
        lab: { production: 0 }
      }
    }

    expect(saveManager.validate(validData)).toBe(true)
  })

  it('should reject save without version', () => {
    const invalidData = {
      timestamp: Date.now(),
      resources: { ore: 10 }
    }

    expect(saveManager.validate(invalidData)).toBe(false)
  })

  it('should reject save without timestamp', () => {
    const invalidData = {
      version: 1,
      resources: { ore: 10 }
    }

    expect(saveManager.validate(invalidData)).toBe(false)
  })

  it('should reject corrupted JSON in localStorage', () => {
    localStorage.setItem(saveManager.SAVE_KEY, '{invalid json}')

    const result = saveManager.load()
    expect(result).toBe(null)
  })

  it('should reject saves that fail GameState validation', () => {
    const invalidData = {
      version: 1,
      timestamp: Date.now(),
      resources: { ore: -100 }, // Negative resource
      cards: {}
    }

    localStorage.setItem(saveManager.SAVE_KEY, JSON.stringify(invalidData))

    const result = saveManager.load()
    expect(result).toBe(null)
  })
})

describe('SaveManager - Save Metadata', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should include timestamp in saves', () => {
    const beforeSave = Date.now()
    saveManager.save()
    const afterSave = Date.now()

    const saveData = JSON.parse(localStorage.getItem(saveManager.SAVE_KEY))
    expect(saveData.timestamp).toBeGreaterThanOrEqual(beforeSave)
    expect(saveData.timestamp).toBeLessThanOrEqual(afterSave)
  })

  it('should get save info without loading', () => {
    gameState.addResource('ore', 500)
    saveManager.save()

    const info = saveManager.getSaveInfo()

    expect(info).toBeTruthy()
    expect(info.version).toBe(1)
    expect(info.timestamp).toBeTruthy()
    expect(info.resources.ore).toBe(500)
  })

  it('should return null for save info when no save exists', () => {
    const info = saveManager.getSaveInfo()
    expect(info).toBe(null)
  })

  it('should handle corrupted save data gracefully when getting info', () => {
    localStorage.setItem(saveManager.SAVE_KEY, '{invalid}')

    const info = saveManager.getSaveInfo()
    expect(info).toBe(null)
  })
})

describe('SaveManager - Export/Import', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should export save as JSON string', () => {
    gameState.addResource('ore', 100)
    gameState.addResource('metal', 20)

    const exported = saveManager.exportSave()

    expect(exported).toBeTruthy()
    expect(typeof exported).toBe('string')

    const parsed = JSON.parse(exported)
    expect(parsed.resources.ore).toBe(100)
    expect(parsed.resources.metal).toBe(20)
  })

  it('should import save from JSON string', () => {
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      resources: { ore: 200, metal: 50, energy: 100, science: 10 },
      cards: {
        extractor: { id: 'extractor', placed: true, row: 0, col: 0, production: 10, automated: false, rate: 0, tier: 0 },
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

    const jsonString = JSON.stringify(saveData)
    const success = saveManager.importSave(jsonString)

    expect(success).toBe(true)
    expect(gameState.getResource('ore')).toBe(200)
    expect(gameState.getResource('metal')).toBe(50)
    expect(gameState.cards.extractor.production).toBe(10)
  })

  it('should reject invalid JSON on import', () => {
    const success = saveManager.importSave('{invalid json}')
    expect(success).toBe(false)
  })

  it('should reject invalid data on import', () => {
    const invalidData = { version: 1, resources: { ore: -50 } }
    const success = saveManager.importSave(JSON.stringify(invalidData))
    expect(success).toBe(false)
  })
})

describe('SaveManager - Auto-save', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    saveManager.stopAutoSave()
    localStorage.clear()
    vi.useRealTimers()
  })

  it('should start auto-save with default interval', () => {
    saveManager.startAutoSave()
    expect(saveManager.autoSaveInterval).toBeTruthy()
  })

  it('should auto-save at specified intervals', () => {
    saveManager.startAutoSave(1000) // 1 second

    gameState.addResource('ore', 10)
    vi.advanceTimersByTime(1000)

    expect(saveManager.hasSave(true)).toBe(true)
  })

  it('should stop auto-save', () => {
    saveManager.startAutoSave(1000)
    saveManager.stopAutoSave()

    expect(saveManager.autoSaveInterval).toBe(null)
  })

  it('should not create multiple auto-save intervals', () => {
    saveManager.startAutoSave(1000)
    const firstInterval = saveManager.autoSaveInterval

    saveManager.startAutoSave(1000)
    const secondInterval = saveManager.autoSaveInterval

    // Should have stopped first and created new one
    expect(firstInterval).not.toBe(secondInterval)
  })
})

describe('SaveManager - New Game', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should reset game state', () => {
    gameState.addResource('ore', 500)
    gameState.placeCard('extractor', 0, 0)

    saveManager.newGame()

    expect(gameState.getResource('ore')).toBe(0)
    expect(gameState.cards.extractor.placed).toBe(false)
  })

  it('should keep saves by default', () => {
    saveManager.save()
    saveManager.newGame(true)

    expect(saveManager.hasSave()).toBe(true)
  })

  it('should delete saves when requested', () => {
    saveManager.save()
    saveManager.save(true) // Auto-save

    saveManager.newGame(false)

    expect(saveManager.hasSave(false)).toBe(false)
    expect(saveManager.hasSave(true)).toBe(false)
  })
})

describe('SaveManager - Event Emissions', () => {
  let gameState
  let saveManager

  beforeEach(() => {
    gameState = new GameState()
    saveManager = new SaveManager(gameState)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should emit game:saved event on save', () => {
    const listener = vi.fn()
    gameState.on('game:saved', listener)

    saveManager.save()

    expect(listener).toHaveBeenCalledWith({
      isAutoSave: false,
      timestamp: expect.any(Number)
    })
  })

  it('should emit game:loaded event on load', () => {
    const listener = vi.fn()

    saveManager.save()

    gameState.on('game:loaded', listener)
    saveManager.load()

    expect(listener).toHaveBeenCalledWith({
      timestamp: expect.any(Number),
      isAutoSave: false
    })
  })

  it('should emit game:new event on new game', () => {
    const listener = vi.fn()
    gameState.on('game:new', listener)

    saveManager.newGame()

    expect(listener).toHaveBeenCalledWith({})
  })
})
