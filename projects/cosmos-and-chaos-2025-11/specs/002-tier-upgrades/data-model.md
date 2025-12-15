# Data Model: Tier Upgrade System

## Entities

### CardConfiguration (Extended)

Existing entity in `js/cards.js`. Extending with `upgradeCosts`.

```javascript
{
  id: "extractor",
  tier: 0,
  // ... existing fields ...
  
  // NEW: Upgrade Configuration
  upgradeCosts: {
    1: { // Cost to upgrade FROM Tier 0 TO Tier 1
      ore: 50
    },
    2: {
      ore: 500,
      metal: 200
    }
  },
  
  // NEW: Tier Benefits (for display/logic)
  tierBenefits: {
    1: {
      automation: true,
      rateMultiplier: 1.0, // 100% efficiency
      description: "Unlocks automated production"
    }
  }
}
```

### GameState (Events)

New events to be emitted by `state.js` / `production.js`.

**Event**: `card:upgraded`
```javascript
{
  cardId: "extractor",
  newTier: 1,
  automated: true
}
```

**Event**: `card:produced` (Refinement)
```javascript
{
  cardId: "extractor",
  resourceType: "ore",
  amount: 1,
  totalProduced: 154 // The new counter value to display
}
```

## Validation Rules

1. **Upgrade Eligibility**:
   - `Current Tier < Max Tier`
   - `Player Resources >= Upgrade Cost`
2. **Persistence**:
   - `save.js` must serialize `cards[id].tier` and `cards[id].automated`.

## State Transitions

- **Tier 0 -> Tier 1**:
  - Trigger: User action (Upgrade Modal).
  - Condition: Resources available.
  - Effect: Resources deducted, Tier = 1, Automated = true.
