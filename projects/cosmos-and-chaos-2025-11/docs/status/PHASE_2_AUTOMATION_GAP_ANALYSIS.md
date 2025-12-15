# Phase 2 Automation Gap Analysis

**Date:** 2025-12-14
**Status:** Documented Gap

---

## Summary

During the review of the Phase 1.5 refactoring and Phase 2 preparations, a specific disconnect was identified between the backend automation logic and the frontend UI display.

## The Gap

**Backend Logic (Implemented):**
- `src/js/production.js` correctly calculates resource production based on time deltas.
- It calculates production for all automated, placed cards.
- It emits `card:produced` events via the central `GameState`.

**Frontend UI (Missing):**
- The UI (specifically `src/js/cards.js` or `src/js/display.js`) currently **does not listen** to the `card:produced` event.
- Card counters on the DOM are only updated when a user manually clicks a card (via `handleCardClick` in `cards.js`).
- As a result, even though resources are being produced in the background (visible in console logs or state inspection), the numbers on the cards do not change automatically.

## Required Actions for Phase 2

1. **Wire up UI Listener:**
   - In `src/js/display.js` (or `cards.js`), add a listener for the `card:produced` event.
   - Ideally, `DisplayUpdateManager` in `display.js` should handle this to respect the throttling/update rate requirements defined in the Phase 2 plan.

2. **Update Card DOM:**
   - The listener should trigger an update to the specific card's counter element (`.counter-primary`).

3. **Verify Throttling:**
   - Ensure that high-frequency production events (e.g., from multiple cards) do not cause excessive DOM repaints, adhering to the 60 FPS performance goal.

## Reference

- **Backend Event:** `gameState.emit('card:produced', { cardId, resourceType, amount, totalProduced })`
- **Current Manual Update:** `updateCardCounter(cards[id], value)` in `src/js/cards.js`
