# Production API Contract

**Version**: 1.0.0
**Status**: Draft
**Last Updated**: 2025-12-11

---

## Overview

This contract defines the API for card production automation, efficiency calculations, and automated resource generation in Phase 2.

---

## Methods

### `calculateCardEfficiency(cardId: string): number`

Calculates production efficiency for a card based on input availability.

**Parameters**:
- `cardId` (string): Card identifier ('extractor', 'processor', etc.)

**Returns**:
- `number`: Efficiency value from 0.0 to 1.0

**Preconditions**:
- `cardId` must reference an existing card in `gameState.cards`
- Card must be placed on grid (`card.placed === true`)

**Postconditions**:
- `efficiencies[cardId]` updated with new efficiency value
- `productionRates[cardId]` updated with new actual rate
- `card:efficiency:changed` event emitted

**Algorithm**:
```javascript
1. If card has no input requirements → return 1.0 (base producer)
2. For each input type in card.inputRequirements:
   a. Calculate ratio: available / required
   b. Clamp to [0.0, 1.0]
3. Return minimum ratio (bottleneck determines efficiency)
4. Store bottleneck resource type
```

**Examples**:
```javascript
// Base producer (no inputs)
gameState.calculateCardEfficiency('extractor');
// Returns: 1.0 (always 100%)

// Processor requires 5 ore + 1 energy
// Available: 4 ore, 2 energy
gameState.calculateCardEfficiency('processor');
// Returns: 0.8 (min(4/5, 2/1) = 0.8, bottleneck: ore)

// No inputs available
gameState.calculateCardEfficiency('processor');
// Returns: 0.0 (cannot produce)
```

**Side Effects**:
- Updates `gameState.efficiencies[cardId]`
- Updates `gameState.productionRates[cardId].efficiency`
- Emits `card:efficiency:changed` event

---

### `updateCardProduction(cardId: string, deltaTime: number): number`

Updates card production based on efficiency and time delta.

**Parameters**:
- `cardId` (string): Card identifier
- `deltaTime` (number): Time elapsed since last update (seconds)

**Returns**:
- `number`: Amount of resource produced (fractional)

**Preconditions**:
- `cardId` must reference an existing, placed card
- `card.automated === true` (manual cards don't auto-produce)
- `deltaTime` > 0 and < 1.0 (sanity check - max 1 second delta)

**Postconditions**:
- Card's production buffer updated
- If buffer ≥ 1.0, whole units added to global resources
- Card's production counter updated
- `card.lastProductionTick` updated to current time

**Algorithm**:
```javascript
1. Get card's actualRate (baseRate * efficiency)
2. Calculate production: actualRate * deltaTime
3. Add production to card.productionBuffer
4. If productionBuffer >= 1.0:
   a. Flush whole units to global resources
   b. Keep fractional remainder
5. Return production amount
```

**Examples**:
```javascript
// Extractor: 1.0 ore/sec base rate, 100% efficiency
// deltaTime = 0.5 seconds
const produced = gameState.updateCardProduction('extractor', 0.5);
// Returns: 0.5 ore
// card.productionBuffer: 0.5 (not yet flushed)

// Next tick: deltaTime = 0.7 seconds
const produced = gameState.updateCardProduction('extractor', 0.7);
// Returns: 0.7 ore
// card.productionBuffer: 0.2 (1.2 total, flushed 1.0 to global ore)
```

**Error Handling**:
```javascript
// Card not placed
gameState.updateCardProduction('unplaced-card', 0.5);
// Throws: Error('Card not placed on grid')

// Manual card
gameState.updateCardProduction('manual-card', 0.5);
// Returns: 0 (manual cards don't auto-produce)

// Invalid deltaTime
gameState.updateCardProduction('extractor', -0.5);
// Throws: RangeError('Delta time must be positive')
```

---

### `startAutomation(cardId: string): void`

Enables automated production for a card.

**Parameters**:
- `cardId` (string): Card identifier

**Preconditions**:
- Card must be Tier 1+ (Tier 0 is manual only)
- Card must be placed on grid

**Postconditions**:
- `card.automated = true`
- Card registered with production system
- Production begins on next game tick

**Examples**:
```javascript
// Upgrade extractor from T0 (manual) to T1 (auto)
gameState.startAutomation('extractor');
// card.automated: true
// Production starts automatically
```

---

### `stopAutomation(cardId: string): void`

Disables automated production for a card.

**Parameters**:
- `cardId` (string): Card identifier

**Postconditions**:
- `card.automated = false`
- Production stops immediately
- Production buffer preserved (not reset)

**Examples**:
```javascript
// Temporarily disable processor
gameState.stopAutomation('processor');
// card.automated: false
// Production paused, buffer unchanged
```

---

### `getCardStatusLED(cardId: string): LEDColor`

Returns LED color based on card efficiency.

**Parameters**:
- `cardId` (string): Card identifier

**Returns**:
- `LEDColor`: 'green' | 'yellow' | 'red'

**Algorithm**:
```javascript
1. If card is base producer → return 'green'
2. If card is manual → return 'green'
3. Get efficiency from gameState.efficiencies[cardId]
4. If efficiency >= 0.80 → return 'green'
5. If efficiency >= 0.40 → return 'yellow'
6. Else → return 'red'
```

**Examples**:
```javascript
// Extractor (base producer)
gameState.getCardStatusLED('extractor');
// Returns: 'green' (always)

// Processor at 85% efficiency
gameState.getCardStatusLED('processor');
// Returns: 'green'

// Processor at 50% efficiency
gameState.getCardStatusLED('processor');
// Returns: 'yellow'

// Processor at 20% efficiency
gameState.getCardStatusLED('processor');
// Returns: 'red'
```

---

### `getProductionSummary(cardId: string): ProductionSummary`

Returns detailed production information for a card.

**Parameters**:
- `cardId` (string): Card identifier

**Returns**:
```javascript
{
  baseRate: number,          // Production rate at 100% efficiency
  efficiency: number,        // Current efficiency (0.0-1.0)
  actualRate: number,        // Effective rate (baseRate * efficiency)
  bottleneck: string | null, // Limiting resource or null
  outputType: string,        // Resource being produced
  totalProduced: number,     // Lifetime production count
  statusLED: string          // LED color ('green'|'yellow'|'red')
}
```

**Example**:
```javascript
const summary = gameState.getProductionSummary('processor');
// Returns:
// {
//   baseRate: 2.0,
//   efficiency: 0.8,
//   actualRate: 1.6,
//   bottleneck: 'ore',
//   outputType: 'metal',
//   totalProduced: 1234,
//   statusLED: 'green'
// }
```

---

## Events

### `card:efficiency:changed`

Emitted when card efficiency recalculates.

**Payload**:
```javascript
{
  cardId: string,
  efficiency: {
    value: number,           // New efficiency (0.0-1.0)
    bottleneck: string | null,  // Limiting resource
    previous: number         // Previous efficiency (optional)
  }
}
```

**Subscribers**:
- Status LED UI components
- Efficiency tooltip generators
- Player notifications (e.g., "Processor efficiency critical!")

---

### `card:production:changed`

Emitted when card production rate updates.

**Payload**:
```javascript
{
  cardId: string,
  rate: {
    baseRate: number,
    efficiency: number,
    actualRate: number
  }
}
```

**Subscribers**:
- Production stat displays
- Performance analytics

---

### `card:produced`

Emitted when card flushes production to global resources.

**Payload**:
```javascript
{
  cardId: string,
  resourceType: string,
  amount: number,          // Amount flushed (whole units)
  totalProduced: number    // Card's lifetime production
}
```

**Subscribers**:
- Achievement checkers ("Produce 1000 ore")
- Statistics trackers
- Visual effects (particle burst on production)

---

## Efficiency Calculation Details

### Formula

```javascript
function calculateEfficiency(card, resources) {
  // Base producer check
  if (!card.inputRequirements || Object.keys(card.inputRequirements).length === 0) {
    return 1.0;
  }

  // Calculate ratio for each input
  const ratios = Object.entries(card.inputRequirements).map(([type, required]) => {
    const available = resources.getTrueResourceValue(type);
    return Math.min(available / required, 1.0); // Cap at 100%
  });

  // Return minimum (bottleneck)
  return Math.min(...ratios);
}
```

### Threshold Mapping

| Efficiency Range | LED Color | Meaning |
|------------------|-----------|---------|
| >= 0.80 | Green | Healthy production |
| 0.40 - 0.79 | Yellow | Bottleneck detected |
| < 0.40 | Red | Critical shortage |

### Edge Cases

**No inputs (base producer)**:
```javascript
// Extractor T1
inputRequirements: {}
efficiency: 1.0 (always)
LED: 'green' (always)
```

**Multiple inputs (processor)**:
```javascript
// Processor requires ore=5, energy=1
// Available: ore=10, energy=0.5

ratios = {
  ore: 10/5 = 2.0 → clamped to 1.0,
  energy: 0.5/1 = 0.5
}
efficiency = min(1.0, 0.5) = 0.5
bottleneck = 'energy'
LED = 'yellow' (0.5 is in [0.4, 0.8) range)
```

**Zero availability**:
```javascript
// Processor requires ore=5
// Available: ore=0

ratio = 0/5 = 0
efficiency = 0
LED = 'red'
actualRate = baseRate * 0 = 0 (no production)
```

---

## Production Loop Integration

### Game Loop (60 FPS)

```javascript
class GameLoop {
  constructor() {
    this.lastFrame = performance.now();
  }

  tick(timestamp) {
    const deltaTime = (timestamp - this.lastFrame) / 1000; // Convert to seconds
    this.lastFrame = timestamp;

    // Cap delta to prevent huge jumps on lag
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Update all automated cards
    Object.keys(gameState.cards).forEach(cardId => {
      const card = gameState.cards[cardId];

      if (card.placed && card.automated) {
        // Recalculate efficiency (resource availability may have changed)
        gameState.calculateCardEfficiency(cardId);

        // Update production
        gameState.updateCardProduction(cardId, clampedDelta);
      }
    });

    requestAnimationFrame(this.tick.bind(this));
  }
}
```

### Efficiency Update Frequency

**Option A: Every frame** (60 Hz)
- Pros: Most responsive, catches resource changes immediately
- Cons: CPU overhead (25 cards * 60/sec = 1500 calculations/sec)

**Option B: Every production tick** (when resources change)
- Pros: Only recalculates when necessary
- Cons: Requires event subscription, more complex

**Recommended**: Option A for MVP, optimize to Option B if performance issues arise.

---

## Performance Considerations

### Efficiency Calculation Cost

```javascript
// Worst case: Card with 3 input requirements
// Cost: 3 divisions + 3 comparisons + 1 min operation
// Estimated: 0.01ms per card

// With 25 cards at 60 FPS:
// Total: 25 * 0.01ms * 60/sec = 15ms/sec = 0.025% CPU
```

### Production Update Cost

```javascript
// Per card per frame:
// - 1 multiplication (rate * delta)
// - 1 addition (accumulator update)
// - 1 comparison (if >= 1.0)
// - Conditional flush (1 in ~60 frames)

// Estimated: 0.02ms per card per frame

// With 25 cards at 60 FPS:
// Total: 25 * 0.02ms * 60/sec = 30ms/sec = 0.05% CPU
```

**Conclusion**: Production system overhead is negligible (<0.1% CPU).

---

## Testing Contract

```javascript
describe('Production API', () => {
  it('calculateCardEfficiency handles base producers', () => {
    const card = { id: 'extractor', inputRequirements: {} };
    const efficiency = gameState.calculateCardEfficiency('extractor');
    expect(efficiency).toBe(1.0);
  });

  it('calculateCardEfficiency finds bottleneck', () => {
    gameState.cards.processor.inputRequirements = { ore: 5, energy: 1 };
    gameState.resources.ore = 4;
    gameState.resources.energy = 10;

    const efficiency = gameState.calculateCardEfficiency('processor');
    expect(efficiency).toBeCloseTo(0.8); // Limited by ore: 4/5 = 0.8
    expect(gameState.efficiencies.processor.bottleneck).toBe('ore');
  });

  it('updateCardProduction flushes accumulators correctly', () => {
    gameState.productionRates.extractor = {
      baseRate: 2.0,
      efficiency: 1.0,
      actualRate: 2.0
    };
    gameState.cards.extractor.productionBuffer = 0;

    // First update: 2.0 * 0.3 = 0.6 (no flush)
    gameState.updateCardProduction('extractor', 0.3);
    expect(gameState.cards.extractor.productionBuffer).toBeCloseTo(0.6);

    // Second update: 0.6 + (2.0 * 0.4) = 1.4 (flush 1, keep 0.4)
    gameState.updateCardProduction('extractor', 0.4);
    expect(gameState.cards.extractor.productionBuffer).toBeCloseTo(0.4);
    expect(gameState.resources.ore).toBe(1); // Flushed
  });

  it('getCardStatusLED returns correct colors', () => {
    gameState.efficiencies.processor = { value: 0.9, isBaseProducer: false };
    expect(gameState.getCardStatusLED('processor')).toBe('green');

    gameState.efficiencies.processor.value = 0.6;
    expect(gameState.getCardStatusLED('processor')).toBe('yellow');

    gameState.efficiencies.processor.value = 0.2;
    expect(gameState.getCardStatusLED('processor')).toBe('red');
  });

  it('startAutomation enables production', () => {
    gameState.cards.extractor.automated = false;
    gameState.startAutomation('extractor');
    expect(gameState.cards.extractor.automated).toBe(true);
  });
});
```

---

## Migration Notes

### From Phase 1.5

Phase 1.5 had manual production only (`clickCard()` function).

**New in Phase 2**:
- Automated production loop
- Efficiency calculations
- Production accumulators
- Status LEDs

**Backwards Compatibility**:
```javascript
// Manual cards still work via click handler
function clickCard(cardId) {
  const card = gameState.cards[cardId];

  if (card.automated) {
    // Automated cards don't respond to clicks
    return;
  }

  // Manual production (Phase 1.5 behavior)
  gameState.addResourceAccurate(card.outputType, card.clickProduction);
}
```

---

**Contract Status**: Draft
**Review Required**: Before Phase 2 implementation
**Breaking Changes**: None (extends Phase 1.5 behavior)
