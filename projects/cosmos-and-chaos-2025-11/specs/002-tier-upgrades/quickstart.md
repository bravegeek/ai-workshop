# Quickstart: Tier Upgrade System

## Overview
This feature enables the "Tier 0 -> Tier 1" upgrade loop. It involves configuring costs, verifying logic, and updating the UI.

## Configuration

To add upgrade costs to a card, edit `src/js/cards.js`:

```javascript
// Example: Adding costs to Extractor
extractor: {
  // ...
  upgradeCosts: {
    1: { ore: 50 }
  }
}
```

## Testing Upgrades

1. **Grant Resources**:
   Open the browser console and type:
   ```javascript
   gameState.addResource('ore', 100);
   ```

2. **Verify Glow**:
   - At 0 ore: No glow.
   - At 25 ore (50%): Faint glow (`.glow-faint`).
   - At 38 ore (75%): Medium glow (`.glow-medium`).
   - At 50 ore (100%): Strong glow (`.glow-strong`).

3. **Perform Upgrade**:
   - Click the "Upgrade" icon (top right of card).
   - Click "Upgrade" in the modal.
   - Verify: Ore decreases by 50. Card Tier shows "T1".

4. **Verify Automation**:
   - Wait 1-2 seconds.
   - Verify the card's main counter increases automatically.

## Debugging

- **Event Logs**: Check console for `[Event] card:upgraded` or `[Display] Updating counter`.
- **State Inspection**: `gameState.getCard('extractor')` should show `tier: 1` and `automated: true`.
