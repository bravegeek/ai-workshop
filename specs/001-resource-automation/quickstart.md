# Quickstart Guide: Resource Automation Implementation

**Feature**: Resource Automation & Live Counters (Phase 2)
**Target Audience**: Developers implementing this feature
**Prerequisites**: Phase 1.5 complete (centralized GameState, SaveManager, tests)

---

## Overview

This guide walks you through implementing Phase 2 resource automation step-by-step. Follow the sections in order to build the feature incrementally while maintaining tests and 60 FPS performance.

**Estimated Time**: 8-12 hours
**Complexity**: Moderate

---

## Step 1: Extend GameState with Accumulators (1-2 hours)

### 1.1 Add Accumulator Fields

Edit `src/js/state.js`:

```javascript
class GameState extends EventEmitter {
  constructor() {
    super();
    this.version = 1;

    // Existing resources
    this.resources = {
      ore: 0,
      metal: 0,
      energy: 0,
      science: 0,
      data: 0,        // NEW: Add Phase 2 resources
      biomass: 0,     // NEW
      nanites: 0      // NEW
    };

    // NEW: Resource accumulators for fractional tracking
    this.resourceAccumulators = {
      ore: 0,
      metal: 0,
      energy: 0,
      science: 0,
      data: 0,
      biomass: 0,
      nanites: 0
    };

    // Existing cards
    this.cards = { /* ... */ };

    // NEW: Card production accumulators
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

    // NEW: Production rates
    this.productionRates = {};

    // NEW: Efficiency tracking
    this.efficiencies = {};
  }

  // NEW: Add resources with fractional support
  addResourceAccurate(type, amount) {
    if (!this.resources.hasOwnProperty(type)) {
      throw new TypeError(`Invalid resource type: ${type}`);
    }

    this.resourceAccumulators[type] += amount;

    // Flush whole units
    if (Math.abs(this.resourceAccumulators[type]) >= 1) {
      const whole = Math.floor(this.resourceAccumulators[type]);
      this.resources[type] += whole;
      this.resourceAccumulators[type] -= whole;

      this.emit('resource:changed', {
        type,
        total: this.resources[type],
        accumulated: this.resourceAccumulators[type]
      });
    }
  }

  // NEW: Get true resource value (for calculations)
  getTrueResourceValue(type) {
    return this.resources[type] + this.resourceAccumulators[type];
  }
}
```

### 1.2 Write Tests

Create `tests/accumulators.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Resource Accumulators', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  it('tracks fractional amounts without loss', () => {
    gameState.addResourceAccurate('ore', 0.3);
    expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.3);
    expect(gameState.resources.ore).toBe(0);

    gameState.addResourceAccurate('ore', 0.3);
    expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.6);

    gameState.addResourceAccurate('ore', 0.5);
    expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.4);
    expect(gameState.resources.ore).toBe(1); // Flushed
  });

  it('getTrueResourceValue returns precise value', () => {
    gameState.resources.ore = 42;
    gameState.resourceAccumulators.ore = 0.7;
    expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(42.7);
  });
});
```

Run tests: `npm test`

---

## Step 2: Implement Efficiency Calculation (2-3 hours)

### 2.1 Add Efficiency Method to GameState

Edit `src/js/state.js`:

```javascript
class GameState extends EventEmitter {
  // ... existing code ...

  /**
   * Calculate card efficiency based on input availability
   * @param {string} cardId - Card identifier
   * @returns {number} Efficiency from 0.0 to 1.0
   */
  calculateCardEfficiency(cardId) {
    const card = this.cards[cardId];

    // Base producer check
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

    // Efficiency = minimum ratio (bottleneck)
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

    // Update production rate
    if (this.productionRates[cardId]) {
      this.productionRates[cardId].efficiency = efficiency;
      this.productionRates[cardId].actualRate =
        this.productionRates[cardId].baseRate * efficiency;
    }

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
}
```

### 2.2 Add Card Input Requirements

Edit `src/js/cards.js` to add input/output specifications:

```javascript
const CARD_CONFIGS = {
  extractor: {
    id: 'extractor',
    name: 'PROTON CUTTER',
    tier: 0,
    inputRequirements: {},        // NEW: No inputs (base producer)
    outputs: ['ore'],             // NEW: Produces ore
    baseRate: 1.0,                // NEW: 1 ore per second at T1
    // ... existing fields ...
  },
  processor: {
    id: 'processor',
    name: 'REFINERY',
    tier: 1,
    inputRequirements: { ore: 5 }, // NEW: Requires 5 ore per cycle
    outputs: ['metal'],           // NEW: Produces metal
    baseRate: 0.4,                // NEW: 2 metal per 5 seconds (0.4/sec)
    // ... existing fields ...
  },
  reactor: {
    id: 'reactor',
    name: 'BASIC REACTOR',
    tier: 0,
    inputRequirements: {},        // NEW: No inputs
    outputs: ['energy'],          // NEW: Produces energy
    baseRate: 5.0,                // NEW: 5 energy per second
    // ... existing fields ...
  },
  // ... other cards ...
};
```

### 2.3 Write Efficiency Tests

Create `tests/efficiency.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';

describe('Efficiency Calculation', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    gameState.cards.processor = {
      id: 'processor',
      inputRequirements: { ore: 5, energy: 1 },
      placed: true
    };
  });

  it('returns 100% for base producers', () => {
    gameState.cards.extractor = {
      id: 'extractor',
      inputRequirements: {},
      placed: true
    };
    const efficiency = gameState.calculateCardEfficiency('extractor');
    expect(efficiency).toBe(1.0);
  });

  it('calculates efficiency from input ratios', () => {
    gameState.resources.ore = 10;
    gameState.resources.energy = 1;

    const efficiency = gameState.calculateCardEfficiency('processor');
    expect(efficiency).toBe(1.0); // min(10/5, 1/1) = 1.0
  });

  it('identifies bottleneck resource', () => {
    gameState.resources.ore = 4;
    gameState.resources.energy = 10;

    gameState.calculateCardEfficiency('processor');
    expect(gameState.efficiencies.processor.bottleneck).toBe('ore');
  });

  it('returns correct LED colors', () => {
    gameState.resources.ore = 4;
    gameState.resources.energy = 1;

    gameState.calculateCardEfficiency('processor');
    expect(gameState.getCardStatusLED('processor')).toBe('green'); // 0.8 = 80%

    gameState.resources.ore = 2.5;
    gameState.calculateCardEfficiency('processor');
    expect(gameState.getCardStatusLED('processor')).toBe('yellow'); // 0.5 = 50%

    gameState.resources.ore = 1;
    gameState.calculateCardEfficiency('processor');
    expect(gameState.getCardStatusLED('processor')).toBe('red'); // 0.2 = 20%
  });
});
```

Run tests: `npm test`

---

## Step 3: Implement Production Loop (2-3 hours)

### 3.1 Create Production System

Create `src/js/production.js`:

```javascript
import { gameState } from './state.js';

/**
 * Update card production based on time delta
 * @param {string} cardId - Card identifier
 * @param {number} deltaTime - Time elapsed in seconds
 * @returns {number} Amount produced
 */
export function updateCardProduction(cardId, deltaTime) {
  const card = gameState.cards[cardId];

  // Skip if not automated or not placed
  if (!card.automated || !card.placed) {
    return 0;
  }

  // Calculate production
  const rate = gameState.productionRates[cardId];
  if (!rate) return 0;

  const production = rate.actualRate * deltaTime;

  // Add to card's buffer
  gameState.cardAccumulators[cardId] += production;

  // Flush whole units to global resources
  if (Math.abs(gameState.cardAccumulators[cardId]) >= 1) {
    const whole = Math.floor(gameState.cardAccumulators[cardId]);
    gameState.cardAccumulators[cardId] -= whole;

    // Add to global resources
    const outputType = card.outputs[0]; // First output for now
    gameState.addResourceAccurate(outputType, whole);

    // Update card's production counter
    card.production += whole;

    gameState.emit('card:produced', {
      cardId,
      resourceType: outputType,
      amount: whole,
      totalProduced: card.production
    });
  }

  return production;
}

/**
 * Game loop - updates all automated cards
 */
export class ProductionLoop {
  constructor() {
    this.isRunning = false;
    this.lastFrame = performance.now();
  }

  start() {
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
  }

  tick = (timestamp = performance.now()) => {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastFrame) / 1000;
    this.lastFrame = timestamp;

    // Cap delta to prevent huge jumps on lag
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Update all automated cards
    Object.keys(gameState.cards).forEach(cardId => {
      const card = gameState.cards[cardId];

      if (card.placed && card.automated) {
        // Recalculate efficiency
        gameState.calculateCardEfficiency(cardId);

        // Update production
        updateCardProduction(cardId, clampedDelta);
      }
    });

    requestAnimationFrame(this.tick);
  }
}
```

### 3.2 Initialize Production Loop

Edit `src/js/main.js`:

```javascript
import { ProductionLoop } from './production.js';

// Initialize production loop
const productionLoop = new ProductionLoop();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // ... existing initialization ...

  // Start production
  productionLoop.start();
});
```

### 3.3 Write Production Tests

Create `tests/production.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';
import { updateCardProduction } from '../src/js/production.js';

describe('Production System', () => {
  let gameState;

  beforeEach(() => {
    global.gameState = new GameState();
    gameState = global.gameState;

    gameState.cards.extractor = {
      id: 'extractor',
      placed: true,
      automated: true,
      outputs: ['ore'],
      production: 0
    };

    gameState.productionRates.extractor = {
      baseRate: 2.0,
      efficiency: 1.0,
      actualRate: 2.0
    };

    gameState.cardAccumulators.extractor = 0;
  });

  it('produces resources over time', () => {
    // 0.3 seconds at 2.0/sec = 0.6 ore
    updateCardProduction('extractor', 0.3);
    expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.6);
    expect(gameState.resources.ore).toBe(0); // Not yet flushed

    // 0.7 seconds at 2.0/sec = 1.4 ore total
    updateCardProduction('extractor', 0.7);
    expect(gameState.cardAccumulators.extractor).toBeCloseTo(0.4);
    expect(gameState.resources.ore).toBe(1); // Flushed 1 unit
  });

  it('scales production by efficiency', () => {
    gameState.productionRates.extractor.efficiency = 0.5;
    gameState.productionRates.extractor.actualRate = 1.0; // 2.0 * 0.5

    updateCardProduction('extractor', 1.0);
    expect(gameState.cardAccumulators.extractor).toBeCloseTo(1.0);
  });
});
```

Run tests: `npm test`

---

## Step 4: Add Display Update Manager (2-3 hours)

### 4.1 Create Display Manager

Create `src/js/display.js`:

```javascript
import { gameState } from './state.js';

/**
 * Format numbers with K/M/B notation
 */
export function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  return (num / 1_000_000_000).toFixed(1) + 'B';
}

/**
 * Manages throttled display updates for counters
 */
export class DisplayUpdateManager {
  constructor() {
    this.updateRates = {
      'primary': 2,     // 2 Hz
      'secondary': 1,   // 1 Hz
      'tertiary': 0.5   // 0.5 Hz
    };

    this.lastUpdate = {
      'primary': 0,
      'secondary': 0,
      'tertiary': 0
    };

    this.cards = [];
    this.startUpdateLoop();
  }

  registerCard(cardId, tier = 'primary') {
    this.cards.push({ cardId, tier });
  }

  shouldUpdate(tier, timestamp) {
    const interval = 1000 / this.updateRates[tier];
    return timestamp - this.lastUpdate[tier] >= interval;
  }

  updateCardDisplay(cardId) {
    const card = gameState.cards[cardId];
    const element = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!element) return;

    // Update counter
    const counterEl = element.querySelector('.counter-primary');
    if (counterEl) {
      counterEl.textContent = formatNumber(card.production);
    }

    // Update status LED
    const ledEl = element.querySelector('.status-led');
    if (ledEl) {
      const ledColor = gameState.getCardStatusLED(cardId);
      ledEl.className = `status-led ${ledColor}`;
    }
  }

  updateResourceDisplay() {
    document.querySelectorAll('[data-resource]').forEach(el => {
      const type = el.dataset.resource;
      const value = gameState.resources[type];
      el.textContent = formatNumber(value);
    });
  }

  startUpdateLoop() {
    const loop = (timestamp) => {
      Object.keys(this.updateRates).forEach(tier => {
        if (this.shouldUpdate(tier, timestamp)) {
          this.lastUpdate[tier] = timestamp;

          // Update cards of this tier
          this.cards
            .filter(({ tier: cardTier }) => cardTier === tier)
            .forEach(({ cardId }) => this.updateCardDisplay(cardId));

          // Update resources (primary tier only)
          if (tier === 'primary') {
            this.updateResourceDisplay();
          }
        }
      });

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
```

### 4.2 Initialize Display Manager

Edit `src/js/main.js`:

```javascript
import { DisplayUpdateManager } from './display.js';

const displayManager = new DisplayUpdateManager();

// Register all cards
Object.keys(gameState.cards).forEach(cardId => {
  displayManager.registerCard(cardId, 'primary');
});
```

---

## Step 5: Update UI (CSS & HTML) (1-2 hours)

### 5.1 Add Status LED Styles

Edit `src/css/cards.css`:

```css
/* Status LED indicator */
.status-led {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.status-led.green {
  background-color: #00ff00;
  box-shadow: 0 0 8px #00ff00;
}

.status-led.yellow {
  background-color: #ffff00;
  box-shadow: 0 0 8px #ffff00;
}

.status-led.red {
  background-color: #ff0000;
  box-shadow: 0 0 8px #ff0000;
}

/* Counter updates */
.counter-primary {
  font-size: 24px;
  font-weight: bold;
  color: #00ffff;
  font-family: 'Consolas', monospace;
}
```

### 5.2 Update Card HTML Template

Edit card rendering in `src/js/cards.js`:

```javascript
function renderCard(card) {
  return `
    <div class="card" data-card-id="${card.id}">
      <div class="card-header">
        <span class="card-name">${card.name}</span>
        <div class="status-led green"></div>
      </div>
      <div class="card-body">
        <div class="counter-primary">0</div>
        <div class="counter-label">${card.counterLabel}</div>
      </div>
    </div>
  `;
}
```

---

## Step 6: Update Save/Load (1 hour)

### 6.1 Update SaveManager

Edit `src/js/save.js`:

```javascript
class SaveManager {
  serialize() {
    return {
      version: 1,
      resources: gameState.resources,

      // NEW: Save accumulators
      resourceAccumulators: gameState.resourceAccumulators,
      cardAccumulators: gameState.cardAccumulators,

      cards: gameState.cards,
      lastSaved: Date.now()
    };
  }

  deserialize(saveData) {
    gameState.resources = saveData.resources;

    // NEW: Restore accumulators (backwards compatible)
    gameState.resourceAccumulators = saveData.resourceAccumulators || {
      ore: 0, metal: 0, energy: 0, science: 0, data: 0, biomass: 0, nanites: 0
    };
    gameState.cardAccumulators = saveData.cardAccumulators || {};

    gameState.cards = saveData.cards;

    // Recalculate derived state
    Object.keys(gameState.cards).forEach(cardId => {
      gameState.calculateCardEfficiency(cardId);
    });
  }
}
```

---

## Step 7: Testing & Validation (1-2 hours)

### 7.1 Run All Tests

```bash
npm test
```

Verify all tests pass:
- ✓ Resource accumulators
- ✓ Efficiency calculations
- ✓ Production updates
- ✓ Save/load compatibility

### 7.2 Manual Testing Checklist

- [ ] Place Tier 1 card on grid
- [ ] Observe counter automatically incrementing
- [ ] Verify 60 FPS in DevTools (Performance tab)
- [ ] Check status LED changes color when efficiency changes
- [ ] Verify save/load preserves accumulators
- [ ] Test with 25+ cards simultaneously
- [ ] Confirm no resource loss after 10+ minutes

**Edge Case Validation** (covered by automated tests):
- [ ] Move card while producing → verify resources persist (covered by save/load tests T014-T015)
- [ ] Leave tab unfocused for 30 seconds → verify accurate accumulation on return (covered by T082 performance accuracy test)
- [ ] Generate >1,000,000 resources → verify K/M/B formatting displays correctly (covered by T068 formatNumber implementation, T084 manual validation)

### 7.3 Performance Profiling

```bash
# Open browser DevTools
# Navigate to Performance tab
# Record for 10 seconds with 25 cards active
# Check:
# - FPS stays at 60
# - No long tasks (>50ms)
# - CPU usage <10%
```

---

## Troubleshooting

### Issue: Counters not updating

**Check**:
- Is `DisplayUpdateManager` started? (check console for errors)
- Is card registered with display manager?
- Is card DOM element present with correct `data-card-id`?

**Fix**:
```javascript
console.log('Registered cards:', displayManager.cards);
```

### Issue: Resources disappearing

**Likely Cause**: Accumulator not saved/loaded

**Fix**: Verify `SaveManager.serialize()` includes `resourceAccumulators`

### Issue: Efficiency always 0%

**Likely Cause**: Input requirements not defined

**Fix**:
```javascript
console.log('Card inputs:', gameState.cards.processor.inputRequirements);
// Should be: { ore: 5, energy: 1 }, NOT undefined
```

### Issue: FPS drops below 60

**Likely Cause**: Too many DOM updates

**Fix**: Verify throttling is working:
```javascript
console.log('Update intervals:', displayManager.lastUpdate);
// Primary should update every ~500ms, not every frame
```

---

## Next Steps

After completing this quickstart:

1. **Add I/O indicators** (Phase 2 continuation)
2. **Implement adjacency detection** (Phase 2 continuation)
3. **Add tooltips for efficiency details** (Polish)
4. **Optimize for 50+ cards** (Performance tuning)

---

## Getting Help

- Check `/specs/001-resource-automation/research.md` for technical details
- Review `/specs/001-resource-automation/contracts/` for API documentation
- Run tests: `npm test`
- Check browser console for errors

---

**Quickstart Status**: Complete
**Estimated Completion Time**: 8-12 hours
**Difficulty**: Moderate
