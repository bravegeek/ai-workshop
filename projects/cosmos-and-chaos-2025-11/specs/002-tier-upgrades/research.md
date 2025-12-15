# Research: Tier Upgrade System

**Status**: Complete
**Date**: 2025-12-14

## Decisions

### 1. Visual Feedback (Glow Effects)
**Decision**: Use CSS classes (`.glow-faint`, `.glow-medium`, `.glow-strong`) managed by JavaScript.
**Rationale**: 
- CSS animations (box-shadow) are hardware accelerated and performant.
- Classes allow for clean separation of visual style from logic.
- Avoids inline style thrashing.
**Implementation**:
- `cards.css`: Define keyframes/styles for each class.
- `state.js`: Calculate upgrade progress (0.0 to 1.0).
- `DisplayUpdateManager`: Check progress periodically (e.g., 2Hz) and toggle classes.

### 2. Modal Architecture
**Decision**: Single reusable Modal component in `index.html` (hidden by default), populated dynamically.
**Rationale**:
- Reduces DOM node count (vs one modal per card).
- Simpler state management (only one modal open at a time).
**Implementation**:
- Add `<div id="upgrade-modal" class="modal hidden">...</div>` to `index.html`.
- `js/modal.js` (or `utils.js`): `openUpgradeModal(cardId)`, `closeModal()`.

### 3. Automation Display Fix
**Decision**: Implement `card:produced` event listener in `DisplayUpdateManager`.
**Rationale**:
- `resource:changed` is too generic (could be from any source).
- `card:produced` (from backend `production.js`) allows targeting the specific card element to update its counter.
- Decouples production logic from rendering logic.
**Implementation**:
- `production.js`: Ensure `card:produced` event includes `{ cardId, currentProductionCount }`.
- `display.js`: Listen for `card:produced` and update `.counter-primary` for `cardId`.

### 4. Upgrade Icon Location
**Decision**: Add to `.card-header` next to the Tier indicator.
**Rationale**:
- Per specification clarification.
- Consistent visibility without blocking the main "Click to Produce" button.
**Implementation**:
- Update `createCard` template string in `cards.js`.

## Alternatives Considered

- **Inline CSS for Glow**: Rejected due to performance cost of recalcuating/applying styles every frame.
- **Canvas Rendering for Glow**: Rejected as overkill for simple box-shadow effects; keeps DOM simple.
- **Polling for Counter Updates**: Rejected in favor of Event-driven updates to save CPU cycles (idle time).
