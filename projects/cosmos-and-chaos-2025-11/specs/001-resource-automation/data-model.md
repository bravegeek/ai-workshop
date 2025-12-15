# Data Model: Resource Automation & Live Counters

**Feature Branch**: `001-resource-automation`
**Date**: 2025-12-11
**Status**: Design Complete

---

## Overview

This document defines the data entities, relationships, and state schemas for Phase 2 resource automation. All entities integrate with the existing Phase 1.5 centralized `GameState` architecture.

---

## Entity Schemas

### 1. Resource

Represents a game resource type with current amount and accumulator for fractional tracking.

**Properties**:
```javascript
{
  type: string,            // Resource type ID: 'ore'|'energy'|'data'|'biomass'|'nanites'
  name: string,            // Display name: 'Ore', 'Energy', etc.
  icon: string,            // Display icon (emoji or SVG path): '⛏️', '⚡', etc.
  color: string,           // CSS color for UI: '#999999', '#00ffff', etc.
  amount: number,          // Whole units (displayed value)
  accumulator: number      // Fractional part (0.0 to 0.999...)
}
```

**Methods**:
```javascript
add(amount: number): void           // Add resource (fractional supported)
subtract(amount: number): void      // Subtract resource
getDisplayValue(): number           // Get whole units only
getTrueValue(): number              // Get precise value (amount + accumulator)
canAfford(cost: number): boolean    // Check if sufficient resources exist
```

**Validation**:
- `type` must be one of: 'ore', 'energy', 'data', 'biomass', 'nanites'
- `amount` ≥ 0 (cannot go negative)
- `accumulator` range: [0, 1)
- `getTrueValue()` must equal `amount + accumulator`

**Example**:
```javascript
const ore = {
  type: 'ore',
  name: 'Ore',
  icon: '⛏️',
  color: '#999999',
  amount: 42,
  accumulator: 0.7
};

ore.add(0.5);  // amount: 43, accumulator: 0.2 (flushed 1)
ore.getDisplayValue();  // 43
ore.getTrueValue();     // 43.2
```

---

### 2. ProductionRate

Represents the production speed of a card, including base rate and efficiency modifiers.

**Properties**:
```javascript
{
  resourceType: string,      // What is produced: 'ore', 'metal', etc.
  baseRate: number,          // Base production per second (e.g., 1.0 ore/sec)
  efficiency: number,        // Current efficiency multiplier (0.0 to 1.0)
  actualRate: number,        // Effective rate: baseRate * efficiency
  lastUpdate: number         // Timestamp of last production tick (ms)
}
```

**Methods**:
```javascript
calculateProduction(deltaTime: number): number  // Returns amount produced since last update
updateEfficiency(newEfficiency: number): void   // Recalculate actualRate
```

**Derived Fields**:
```javascript
actualRate = baseRate * efficiency
```

**Validation**:
- `baseRate` ≥ 0
- `efficiency` range: [0.0, 1.0]
- `actualRate` = `baseRate * efficiency`
- `lastUpdate` must be valid timestamp

**Example**:
```javascript
const productionRate = {
  resourceType: 'ore',
  baseRate: 2.0,        // 2 ore per second at 100% efficiency
  efficiency: 0.8,      // Currently at 80% (ore bottleneck)
  actualRate: 1.6,      // Producing 1.6 ore/sec
  lastUpdate: performance.now()
};

const deltaTime = 0.5; // 500ms elapsed
const produced = productionRate.calculateProduction(deltaTime);
// Result: 0.8 ore (1.6/sec * 0.5sec)
```

---

### 3. Efficiency

Represents card production efficiency based on input availability.

**Properties**:
```javascript
{
  value: number,                    // Efficiency percentage (0.0 to 1.0)
  bottleneck: string | null,        // Limiting resource type ('ore', etc.) or null
  inputRatios: Map<string, number>, // Ratio for each input type
  isBaseProducer: boolean,          // True if card has no inputs (always 100%)
  lastCalculated: number            // Timestamp of last calculation
}
```

**Methods**:
```javascript
calculate(inputRequirements: Object, available: Object): number  // Compute efficiency
getStatusLED(): string         // Returns 'green'|'yellow'|'red'
getLabel(): string             // Returns human-readable label (e.g., "Healthy (85%)")
getBottleneck(): string | null // Returns limiting resource type
```

**Calculation**:
```javascript
// For each input type, calculate ratio:
inputRatios = {
  ore: available.ore / required.ore,      // e.g., 4/5 = 0.8
  energy: available.energy / required.energy // e.g., 2/1 = 2.0
}

// Efficiency = minimum ratio (bottleneck determines overall)
efficiency.value = Math.min(...Object.values(inputRatios))
efficiency.bottleneck = findKeyWithMinValue(inputRatios)
```

**LED Mapping**:
```javascript
getStatusLED():
  if (isBaseProducer) return 'green'
  if (value >= 0.80) return 'green'
  if (value >= 0.40) return 'yellow'
  return 'red'
```

**Validation**:
- `value` range: [0.0, 1.0]
- If `isBaseProducer` is true, `value` must be 1.0
- `bottleneck` must reference a valid resource type or be null

**Example**:
```javascript
const efficiency = {
  value: 0.8,
  bottleneck: 'ore',
  inputRatios: new Map([
    ['ore', 0.8],      // 4 available / 5 required
    ['energy', 2.0]    // 2 available / 1 required (abundant)
  ]),
  isBaseProducer: false,
  lastCalculated: performance.now()
};

efficiency.getStatusLED();  // 'green' (80% is ≥ threshold)
efficiency.getLabel();      // 'Healthy (80%)'
efficiency.getBottleneck(); // 'ore'
```

---

## Terminology Clarification: Counter vs. Production Buffer

**Important**: This document uses two distinct terms that are sometimes conflated:

- **Counter** (Entity 4 below): A visual display component that shows formatted resource values to the player. Updates are throttled (2Hz/1Hz/0.5Hz) for performance. This is what the player sees.

- **Production Buffer / Accumulator**: Internal state fields (`resourceAccumulators`, `cardAccumulators`) that track fractional resource amounts with full precision. Updated every frame (60 FPS) to maintain calculation accuracy.

**Key Distinction**: The production buffer maintains accurate calculations at 60 FPS, while the Counter displays updates are throttled for performance. This separation ensures visual smoothness without sacrificing accuracy.

---

### 4. Counter

Visual display component for showing resource values on cards.

**Properties**:
```javascript
{
  label: string,             // Display label: 'ORE MINED', 'ENERGY STORED', etc.
  value: number,             // Current displayed value (whole number)
  formattedValue: string,    // Formatted display: '1.2K', '3.4M', etc.
  updateTier: string,        // Update frequency: 'primary'|'secondary'|'tertiary'
  lastUpdate: number,        // Timestamp of last display refresh
  element: HTMLElement | null // Cached DOM reference (null if not rendered)
}
```

**Methods**:
```javascript
update(newValue: number): void           // Update displayed value
format(value: number): string            // Apply K/M/B formatting
shouldUpdate(currentTime: number): boolean // Check if refresh is due
render(): void                           // Update DOM (if element exists)
```

**Update Tiers**:
```javascript
updateTier: 'primary'   // 2 Hz (500ms interval) - main counters
updateTier: 'secondary' // 1 Hz (1000ms interval) - supporting metrics
updateTier: 'tertiary'  // 0.5 Hz (2000ms interval) - detail stats
```

**Formatting Rules**:
```javascript
format(value):
  if (value < 1000) return value.toString()
  if (value < 1_000_000) return (value / 1000).toFixed(1) + 'K'
  if (value < 1_000_000_000) return (value / 1_000_000).toFixed(1) + 'M'
  return (value / 1_000_000_000).toFixed(1) + 'B'
```

**Validation**:
- `value` ≥ 0
- `updateTier` must be 'primary', 'secondary', or 'tertiary'
- `formattedValue` must match `format(value)`

**Example**:
```javascript
const counter = {
  label: 'ORE MINED',
  value: 1234,
  formattedValue: '1.2K',
  updateTier: 'primary',
  lastUpdate: performance.now(),
  element: document.querySelector('.counter-ore')
};

counter.update(5678);
// value: 5678, formattedValue: '5.7K'
```

---

### 5. StatusLED

Visual indicator showing card efficiency state.

**Properties**:
```javascript
{
  color: string,              // LED color: 'green'|'yellow'|'red'
  efficiency: number,         // Efficiency value this LED represents (0.0-1.0)
  tooltip: string,            // Hover tooltip text
  element: HTMLElement | null // Cached DOM reference
}
```

**Methods**:
```javascript
update(efficiency: Efficiency): void   // Update color based on efficiency
setColor(color: string): void          // Change LED color (triggers CSS transition)
generateTooltip(efficiency: Efficiency): string  // Create tooltip text
render(): void                         // Update DOM
```

**Tooltip Generation**:
```javascript
generateTooltip(efficiency):
  if (color === 'green'):
    return "✓ Production running smoothly\n  Efficiency: {efficiency.value * 100}%"

  if (color === 'yellow'):
    return "⚠ Production bottleneck detected\n  Efficiency: {efficiency.value * 100}%\n  Limiting factor: {efficiency.bottleneck}"

  if (color === 'red'):
    return "✗ Card unable to produce\n  Efficiency: {efficiency.value * 100}%\n  Missing inputs: [list]"
```

**CSS Classes**:
```css
.status-led { /* Base styles */ }
.status-led.green { background-color: #00ff00; }
.status-led.yellow { background-color: #ffff00; }
.status-led.red { background-color: #ff0000; }
```

**Validation**:
- `color` must be 'green', 'yellow', or 'red'
- `efficiency` range: [0.0, 1.0]
- LED `color` must match efficiency thresholds

**Example**:
```javascript
const statusLED = {
  color: 'yellow',
  efficiency: 0.62,
  tooltip: '⚠ Production bottleneck detected\n  Efficiency: 62%\n  Limiting factor: ore',
  element: document.querySelector('.status-led-processor')
};

statusLED.update(newEfficiency);
// Updates color and tooltip based on new efficiency value
```

---

### 6. IOIndicator

Visual component showing resource inputs and outputs on card edges.

**Properties**:
```javascript
{
  resourceType: string,       // Resource type: 'ore', 'energy', etc.
  direction: string,          // Flow direction: 'input'|'output'
  position: string,           // Edge position: 'left'|'right'|'top'|'bottom'
  isConnected: boolean,       // True if adjacent card matches this I/O
  color: string,              // Resource color (from Resource.color)
  element: HTMLElement | null // Cached DOM reference
}
```

**Methods**:
```javascript
updateConnection(connected: boolean): void  // Set connected state
highlight(): void                          // Pulse animation when connected
render(): void                             // Update DOM
```

**Position Rules**:
```javascript
// Input indicators: left/right edges
// Output indicators: top/bottom edges
// (Convention: resources flow up/down through card)

position: 'left'    // Input from left neighbor
position: 'right'   // Input from right neighbor
position: 'top'     // Output to top neighbor
position: 'bottom'  // Output to bottom neighbor
```

**CSS Classes**:
```css
.card-io-indicator { /* Base styles */ }
.card-io-indicator.input.left { left: -4px; top: 50%; }
.card-io-indicator.input.right { right: -4px; top: 50%; }
.card-io-indicator.output.top { top: -4px; left: 50%; }
.card-io-indicator.output.bottom { bottom: -4px; left: 50%; }
.card-io-indicator.connected { animation: pulse 2s infinite; }
```

**Validation**:
- `resourceType` must be valid resource type
- `direction` must be 'input' or 'output'
- `position` must be 'left', 'right', 'top', or 'bottom'
- `color` must be valid CSS color

**Example**:
```javascript
const ioIndicator = {
  resourceType: 'ore',
  direction: 'input',
  position: 'left',
  isConnected: true,
  color: '#999999',
  element: document.querySelector('.io-ore-input')
};

ioIndicator.updateConnection(false);
// isConnected: false, stops pulse animation
```

---

## State Schema Extensions

### GameState Extensions

Add to existing `GameState` class from Phase 1.5:

```javascript
class GameState extends EventEmitter {
  constructor() {
    super();

    // Existing Phase 1.5 fields:
    this.version = 1;
    this.resources = { ore: 0, metal: 0, energy: 0, science: 0 };
    this.cards = { /* ... */ };

    // === PHASE 2 ADDITIONS ===

    // Resource accumulators for fractional tracking
    this.resourceAccumulators = {
      ore: 0,
      energy: 0,
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
    this.productionRates = {
      extractor: { resourceType: 'ore', baseRate: 1.0, efficiency: 1.0, actualRate: 1.0 },
      sensor: { resourceType: 'data', baseRate: 0.5, efficiency: 1.0, actualRate: 0.5 },
      // ... etc
    };

    // Efficiency tracking for each card
    this.efficiencies = {
      extractor: { value: 1.0, bottleneck: null, isBaseProducer: true },
      processor: { value: 0.8, bottleneck: 'ore', isBaseProducer: false },
      // ... etc
    };
  }

  // === NEW METHODS ===

  /**
   * Add resource with fractional support
   * Automatically flushes whole units and emits events
   */
  addResourceAccurate(type, amount) {
    this.resourceAccumulators[type] += amount;

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

  /**
   * Get true resource value (for save/load and calculations)
   */
  getTrueResourceValue(type) {
    return this.resources[type] + this.resourceAccumulators[type];
  }

  /**
   * Update card production rate based on efficiency
   */
  updateCardProduction(cardId, efficiency) {
    const rate = this.productionRates[cardId];
    rate.efficiency = efficiency;
    rate.actualRate = rate.baseRate * efficiency;

    this.emit('card:production:changed', { cardId, rate });
  }

  /**
   * Calculate and update card efficiency
   */
  calculateCardEfficiency(cardId) {
    const card = this.cards[cardId];
    if (!card.inputRequirements || Object.keys(card.inputRequirements).length === 0) {
      // Base producer - always 100%
      this.efficiencies[cardId] = {
        value: 1.0,
        bottleneck: null,
        isBaseProducer: true,
        lastCalculated: performance.now()
      };
      return 1.0;
    }

    // Calculate efficiency from input ratios
    const ratios = Object.entries(card.inputRequirements).map(([type, required]) => {
      const available = this.getTrueResourceValue(type);
      return Math.min(available / required, 1.0);
    });

    const efficiency = Math.min(...ratios);
    const bottleneck = ratios.indexOf(efficiency);

    this.efficiencies[cardId] = {
      value: efficiency,
      bottleneck: Object.keys(card.inputRequirements)[bottleneck],
      isBaseProducer: false,
      lastCalculated: performance.now()
    };

    this.updateCardProduction(cardId, efficiency);
    this.emit('card:efficiency:changed', { cardId, efficiency: this.efficiencies[cardId] });

    return efficiency;
  }
}
```

---

## Card Schema Extensions

Extend existing card state objects to include production automation fields:

```javascript
// Existing Phase 1.5 card state:
this.cards = {
  extractor: {
    id: 'extractor',
    placed: false,
    row: null,
    col: null,
    production: 0,     // Keep existing field for compatibility
    automated: false,
    rate: 0,
    tier: 0
  },
  // ...
};

// === PHASE 2 ADDITIONS to card objects ===
this.cards.extractor = {
  // ... existing fields ...

  // Production automation
  inputRequirements: {},         // {} for base producer, { ore: 5, energy: 1 } for consumer
  outputs: ['ore'],              // What this card produces
  productionBuffer: 0,           // Accumulator for card's production counter
  lastProductionTick: 0,         // Timestamp of last production

  // Visual state
  counters: [
    { label: 'ORE MINED', value: 0, tier: 'primary' }
  ],
  statusLED: { color: 'green', efficiency: 1.0 },
  ioIndicators: [
    { resourceType: 'ore', direction: 'output', position: 'bottom', isConnected: false }
  ]
};
```

---

## Relationships

### Resource ↔ Card
- Each Card can **produce** zero or more Resource types (via `outputs` array)
- Each Card can **consume** zero or more Resource types (via `inputRequirements` object)
- Resources are **shared globally** (stored in `GameState.resources`)

### ProductionRate ↔ Card
- Each Card has one ProductionRate per output resource
- ProductionRate is updated when Card efficiency changes
- ProductionRate drives automatic resource accumulation

### Efficiency ↔ Card
- Each automated Card has one Efficiency object
- Efficiency is recalculated when:
  - Resources change (input availability)
  - Card is moved (adjacency changes)
  - Game tick (periodic re-check)

### Counter ↔ Card
- Each Card has 1-3 Counters (primary, secondary, tertiary)
- Counter displays Card's local production accumulator
- Counter updates are throttled based on `updateTier`

### StatusLED ↔ Card
- Each Card has one StatusLED
- StatusLED reflects Card's current Efficiency
- LED color transitions via CSS (smooth UX)

### IOIndicator ↔ Card
- Each Card has 0-4 IOIndicators (one per adjacent edge with I/O)
- IOIndicator shows connection state to adjacent Cards
- Connected indicators highlight when matching I/O types align

---

## Data Flow

### Production Cycle

1. **Game Loop** (60 FPS):
   - Calculate `deltaTime` since last frame
   - For each automated Card:
     - Calculate efficiency based on current resources
     - Calculate production: `baseRate * efficiency * deltaTime`
     - Add production to card's `productionBuffer` (accumulator)
     - If `productionBuffer >= 1`, flush to global resources

2. **Display Update Loop** (throttled by tier):
   - Primary (2Hz): Update main counters, status LEDs
   - Secondary (1Hz): Update efficiency percentages
   - Tertiary (0.5Hz): Update detail stats

3. **Event Propagation**:
   - `resource:changed` → UI updates resource displays
   - `card:efficiency:changed` → Status LED updates color
   - `card:production:changed` → Counter updates value

---

## Save/Load Schema

### Serialized Format

```javascript
{
  version: 1,

  // Resources (whole units only for display)
  resources: {
    ore: 1234,
    energy: 567,
    data: 89,
    biomass: 0,
    nanites: 0
  },

  // Resource accumulators (fractional parts - critical for accuracy!)
  resourceAccumulators: {
    ore: 0.7,
    energy: 0.3,
    data: 0.1,
    biomass: 0.0,
    nanites: 0.0
  },

  // Card state
  cards: {
    extractor: {
      placed: true,
      row: 2,
      col: 3,
      production: 1234,
      tier: 1,
      automated: true,
      productionBuffer: 0.8  // Save card accumulators too!
    },
    // ... other cards
  },

  // Metadata
  lastSaved: 1702307845123,
  playTime: 3600
}
```

### Validation Rules

On load:
- Verify `version` is compatible
- Validate all `resourceAccumulators` are in range [0, 1)
- Recalculate derived fields (efficiencies, production rates)
- Default missing fields to 0 (backwards compatibility)

---

## Migration from Phase 1.5

### Existing Data

Phase 1.5 has:
- `resources` object (4 types: ore, metal, energy, science)
- `cards` object with basic state

### Migration Steps

1. **Add new resource types**:
   ```javascript
   gameState.resources.data = 0;
   gameState.resources.biomass = 0;
   gameState.resources.nanites = 0;
   ```

2. **Initialize accumulators**:
   ```javascript
   gameState.resourceAccumulators = { ore: 0, energy: 0, data: 0, biomass: 0, nanites: 0 };
   gameState.cardAccumulators = { extractor: 0, sensor: 0, /* ... */ };
   ```

3. **Add card automation fields**:
   ```javascript
   Object.values(gameState.cards).forEach(card => {
     card.inputRequirements = CARD_CONFIGS[card.id].inputRequirements || {};
     card.outputs = CARD_CONFIGS[card.id].outputs || [];
     card.productionBuffer = 0;
     card.lastProductionTick = performance.now();
   });
   ```

4. **Initialize production systems**:
   ```javascript
   gameState.productionRates = {};
   gameState.efficiencies = {};
   Object.keys(gameState.cards).forEach(cardId => {
     gameState.productionRates[cardId] = { baseRate: 1.0, efficiency: 1.0, actualRate: 1.0 };
     gameState.efficiencies[cardId] = { value: 1.0, bottleneck: null, isBaseProducer: true };
   });
   ```

---

## Type Definitions (for TypeScript migration)

```typescript
type ResourceType = 'ore' | 'energy' | 'data' | 'biomass' | 'nanites';
type UpdateTier = 'primary' | 'secondary' | 'tertiary';
type LEDColor = 'green' | 'yellow' | 'red';
type IODirection = 'input' | 'output';
type CardPosition = 'left' | 'right' | 'top' | 'bottom';

interface Resource {
  type: ResourceType;
  name: string;
  icon: string;
  color: string;
  amount: number;
  accumulator: number;
}

interface ProductionRate {
  resourceType: ResourceType;
  baseRate: number;
  efficiency: number;
  actualRate: number;
  lastUpdate: number;
}

interface Efficiency {
  value: number;
  bottleneck: ResourceType | null;
  inputRatios: Map<ResourceType, number>;
  isBaseProducer: boolean;
  lastCalculated: number;
}

interface Counter {
  label: string;
  value: number;
  formattedValue: string;
  updateTier: UpdateTier;
  lastUpdate: number;
  element: HTMLElement | null;
}

interface StatusLED {
  color: LEDColor;
  efficiency: number;
  tooltip: string;
  element: HTMLElement | null;
}

interface IOIndicator {
  resourceType: ResourceType;
  direction: IODirection;
  position: CardPosition;
  isConnected: boolean;
  color: string;
  element: HTMLElement | null;
}
```

---

**Data Model Status**: Complete
**Next Phase**: Generate contracts/ (API contracts for state mutations)
