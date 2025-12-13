# Resource API Contract

**Version**: 1.0.0
**Status**: Draft
**Last Updated**: 2025-12-11

---

## Overview

This contract defines the API for resource management operations in Phase 2. All resource mutations go through the centralized `GameState` class to maintain consistency and enable event-driven UI updates.

---

## Methods

### `addResourceAccurate(type: ResourceType, amount: number): void`

Adds resources with fractional support using accumulator pattern.

**Parameters**:
- `type` (ResourceType): Resource type identifier ('ore', 'energy', 'data', 'biomass', 'nanites')
- `amount` (number): Amount to add (can be fractional, e.g., 0.7)

**Preconditions**:
- `type` must be a valid ResourceType
- `amount` can be any number (positive or negative)

**Postconditions**:
- Resource accumulator increased by `amount`
- If accumulator ≥ 1.0, whole units flushed to `resources[type]`
- If flush occurred, `resource:changed` event emitted

**Side Effects**:
- Emits `resource:changed` event when whole units flush
- May trigger UI updates via event listeners

**Examples**:
```javascript
// Add fractional ore
gameState.addResourceAccurate('ore', 0.3);
// Result: accumulator = 0.3, display value unchanged

// Add more ore (triggers flush)
gameState.addResourceAccurate('ore', 0.8);
// Result: accumulator = 0.1, display value +1, event emitted

// Add large amount
gameState.addResourceAccurate('energy', 15.7);
// Result: accumulator = 0.7, display value +15, event emitted
```

**Error Handling**:
```javascript
// Invalid type
gameState.addResourceAccurate('invalid', 10);
// Throws: TypeError('Invalid resource type: invalid')

// Negative amounts are allowed (for consumption)
gameState.addResourceAccurate('ore', -5.2);
// Result: Subtracts 5.2 from ore (accumulator handles correctly)
```

---

### `getTrueResourceValue(type: ResourceType): number`

Returns precise resource value including accumulator (for calculations and save/load).

**Parameters**:
- `type` (ResourceType): Resource type identifier

**Returns**:
- `number`: Precise value = `resources[type] + resourceAccumulators[type]`

**Preconditions**:
- `type` must be a valid ResourceType

**Postconditions**:
- None (read-only operation)

**Examples**:
```javascript
// With ore = 42, accumulator = 0.7
gameState.getTrueResourceValue('ore');
// Returns: 42.7

// For save/load
const saveData = {
  ore: gameState.getTrueResourceValue('ore')  // 42.7 (precise)
};
```

---

### `getResource(type: ResourceType): number`

Returns displayed resource value (whole units only).

**Parameters**:
- `type` (ResourceType): Resource type identifier

**Returns**:
- `number`: Whole units only = `Math.floor(resources[type])`

**Preconditions**:
- `type` must be a valid ResourceType

**Postconditions**:
- None (read-only operation)

**Examples**:
```javascript
// With ore = 42.7 (internal), accumulator = 0
gameState.getResource('ore');
// Returns: 42 (displayed value)
```

---

### `subtractResource(type: ResourceType, amount: number): boolean`

Subtracts resources with accumulator support. Returns success/failure.

**Parameters**:
- `type` (ResourceType): Resource type identifier
- `amount` (number): Amount to subtract (positive number)

**Returns**:
- `boolean`: `true` if subtraction successful, `false` if insufficient resources

**Preconditions**:
- `type` must be a valid ResourceType
- `amount` > 0

**Postconditions**:
- If sufficient resources: Amount subtracted, `resource:changed` event emitted
- If insufficient: No change, returns `false`

**Side Effects**:
- Emits `resource:changed` event if subtraction succeeds

**Examples**:
```javascript
// Sufficient resources (ore = 100)
const success = gameState.subtractResource('ore', 25);
// Returns: true, ore now 75

// Insufficient resources (ore = 10)
const success = gameState.subtractResource('ore', 50);
// Returns: false, ore unchanged (10)

// Fractional subtraction
gameState.subtractResource('energy', 2.5);
// Returns: true (if sufficient), subtracts 2.5 from energy
```

---

### `canAfford(costs: Record<ResourceType, number>): boolean`

Checks if player has sufficient resources for a cost.

**Parameters**:
- `costs` (Record<ResourceType, number>): Map of resource type to required amount

**Returns**:
- `boolean`: `true` if all costs can be afforded, `false` otherwise

**Preconditions**:
- All keys in `costs` must be valid ResourceTypes
- All values in `costs` must be ≥ 0

**Postconditions**:
- None (read-only operation)

**Examples**:
```javascript
// Check upgrade cost
const canUpgrade = gameState.canAfford({
  ore: 50,
  energy: 10,
  data: 5
});
// Returns: true if all three resources available

// Empty cost
gameState.canAfford({});
// Returns: true (no cost = always affordable)
```

---

### `consumeResources(costs: Record<ResourceType, number>): boolean`

Attempts to consume resources for a cost. Atomic operation (all or nothing).

**Parameters**:
- `costs` (Record<ResourceType, number>): Map of resource type to required amount

**Returns**:
- `boolean`: `true` if consumption successful, `false` if insufficient

**Preconditions**:
- All keys in `costs` must be valid ResourceTypes
- All values in `costs` must be ≥ 0

**Postconditions**:
- If affordable: All resources subtracted, events emitted, returns `true`
- If not affordable: No changes, returns `false` (atomic transaction)

**Side Effects**:
- Emits `resource:changed` for each resource type consumed

**Examples**:
```javascript
// Purchase upgrade (costs: 50 ore, 10 energy)
const success = gameState.consumeResources({
  ore: 50,
  energy: 10
});

if (success) {
  // Upgrade granted
  console.log('Upgrade purchased!');
} else {
  // Insufficient resources
  console.log('Cannot afford upgrade');
}
```

**Atomicity Guarantee**:
```javascript
// Player has: 100 ore, 5 energy
// Attempt to buy: 50 ore, 10 energy
gameState.consumeResources({ ore: 50, energy: 10 });
// Returns: false (not enough energy)
// Result: No resources consumed (ore still 100, energy still 5)
```

---

## Events

### `resource:changed`

Emitted when resource amount changes (whole units flushed).

**Payload**:
```javascript
{
  type: ResourceType,      // Which resource changed
  total: number,           // New display value (whole units)
  accumulated: number,     // Current accumulator value (fractional)
  delta: number            // Change amount (optional)
}
```

**Subscribers**:
- Resource display UI components
- Achievement/milestone checkers
- Analytics/statistics trackers

**Example**:
```javascript
gameState.on('resource:changed', (data) => {
  console.log(`${data.type} changed to ${data.total} (acc: ${data.accumulated})`);
  updateResourceDisplay(data.type, data.total);
});
```

---

## Data Validation

### Type Safety

```javascript
// ResourceType enum
const ResourceType = Object.freeze({
  ORE: 'ore',
  ENERGY: 'energy',
  DATA: 'data',
  BIOMASS: 'biomass',
  NANITES: 'nanites'
});

function isValidResourceType(type) {
  return Object.values(ResourceType).includes(type);
}
```

### Amount Validation

```javascript
function validateAmount(amount) {
  if (typeof amount !== 'number') {
    throw new TypeError(`Amount must be number, got ${typeof amount}`);
  }
  if (isNaN(amount)) {
    throw new RangeError('Amount cannot be NaN');
  }
  if (!isFinite(amount)) {
    throw new RangeError('Amount must be finite');
  }
  return true;
}
```

---

## Performance Considerations

### Accumulator Flush Cost

**Operation**: `addResourceAccurate(type, amount)`
**Time Complexity**: O(1)
**Estimated Cost**: ~0.02ms per call

**Benchmark**:
```javascript
// 1000 calls with random fractional amounts
const start = performance.now();
for (let i = 0; i < 1000; i++) {
  gameState.addResourceAccurate('ore', Math.random());
}
const end = performance.now();
console.log(`Average per call: ${(end - start) / 1000}ms`);
// Typical result: 0.01-0.03ms per call
```

### Event Emission Cost

**Event**: `resource:changed`
**Listeners**: 3-5 typical (resource display, achievements, stats)
**Estimated Cost**: ~0.1ms per emit

**Optimization**: Batch updates if adding multiple resources in same frame:
```javascript
// Instead of:
gameState.addResourceAccurate('ore', 5);
gameState.addResourceAccurate('energy', 10);
gameState.addResourceAccurate('data', 2);
// (3 event emissions if all flush)

// Consider batch API:
gameState.addResourcesBatch({
  ore: 5,
  energy: 10,
  data: 2
});
// (1 event emission with combined payload)
```

---

## Testing Contract

### Unit Test Requirements

```javascript
describe('Resource API', () => {
  beforeEach(() => {
    gameState = new GameState();
  });

  it('addResourceAccurate handles fractional amounts', () => {
    gameState.addResourceAccurate('ore', 0.3);
    expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.3);
    expect(gameState.resources.ore).toBe(0);

    gameState.addResourceAccurate('ore', 0.8);
    expect(gameState.resourceAccumulators.ore).toBeCloseTo(0.1);
    expect(gameState.resources.ore).toBe(1);
  });

  it('getTrueResourceValue returns precise value', () => {
    gameState.resources.ore = 42;
    gameState.resourceAccumulators.ore = 0.7;
    expect(gameState.getTrueResourceValue('ore')).toBeCloseTo(42.7);
  });

  it('subtractResource returns false when insufficient', () => {
    gameState.resources.ore = 10;
    const success = gameState.subtractResource('ore', 50);
    expect(success).toBe(false);
    expect(gameState.resources.ore).toBe(10); // Unchanged
  });

  it('consumeResources is atomic', () => {
    gameState.resources.ore = 100;
    gameState.resources.energy = 5;

    const success = gameState.consumeResources({
      ore: 50,
      energy: 10  // Not enough!
    });

    expect(success).toBe(false);
    expect(gameState.resources.ore).toBe(100); // Not consumed
    expect(gameState.resources.energy).toBe(5); // Not consumed
  });

  it('emits resource:changed when flushing accumulators', () => {
    const spy = jest.fn();
    gameState.on('resource:changed', spy);

    gameState.addResourceAccurate('ore', 1.5);

    expect(spy).toHaveBeenCalledWith({
      type: 'ore',
      total: 1,
      accumulated: 0.5
    });
  });
});
```

---

## Migration Notes

### From Phase 1.5

Phase 1.5 used `addResource(type, amount)` which only handled integers.

**Migration Path**:
```javascript
// Old (Phase 1.5)
addResource('ore', 5);  // Always integers

// New (Phase 2)
addResourceAccurate('ore', 5);  // Supports fractions

// Backwards compatibility wrapper:
function addResource(type, amount) {
  return addResourceAccurate(type, Math.floor(amount));
}
```

### Save Data Compatibility

```javascript
// Old save format (Phase 1.5)
{
  resources: { ore: 1234, energy: 567 }
}

// New save format (Phase 2)
{
  resources: { ore: 1234, energy: 567 },
  resourceAccumulators: { ore: 0.7, energy: 0.3 }  // NEW
}

// Load handler (backwards compatible):
function loadSave(data) {
  gameState.resources = data.resources;
  gameState.resourceAccumulators = data.resourceAccumulators || {
    ore: 0, energy: 0, data: 0, biomass: 0, nanites: 0
  };
}
```

---

**Contract Status**: Draft
**Review Required**: Before Phase 2 implementation
**Breaking Changes**: None (extends Phase 1.5 API)
