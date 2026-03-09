/**
 * Constructable Stylesheet definitions for the UI module.
 * All CSS is defined here and adopted by the shadow root.
 */

export const STYLES_CSS = /* css */ `
:host {
  all: initial;
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: var(--lob-z, 2147483646);
}

/* ─── Pulse Highlight ──────────────────────────────────────────────────── */

@keyframes lob-pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.0);
  }
}

.lob-pulse {
  position: fixed;
  pointer-events: none;
  border: 2px solid rgba(59, 130, 246, 0.7);
  border-radius: 4px;
  box-sizing: border-box;
  animation: lob-pulse-glow 1.5s ease-in-out infinite;
}

/* ─── Micro-Label ──────────────────────────────────────────────────────── */

.lob-label {
  position: fixed;
  pointer-events: none;
  background: #1a1a2e;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 1;
}

/* ─── Mini-Map Panel ───────────────────────────────────────────────────── */

.lob-minimap {
  position: fixed;
  pointer-events: auto;
  width: 240px;
  max-height: 320px;
  overflow-y: auto;
  background: #1a1a2e;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.lob-minimap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.lob-minimap-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
  pointer-events: auto;
}

.lob-minimap-toggle:hover {
  color: #ffffff;
}

.lob-minimap-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.lob-minimap-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.15s;
  font-size: 12px;
  line-height: 1.4;
  color: #ffffff;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.lob-minimap-entry:hover,
.lob-minimap-entry:focus {
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

.lob-minimap-entry:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.7);
  outline-offset: -2px;
}

.lob-minimap-icon {
  flex-shrink: 0;
  font-size: 10px;
}

.lob-minimap-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lob-minimap.collapsed .lob-minimap-list {
  display: none;
}

/* ─── Accessibility: Reduced Motion ────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .lob-pulse {
    animation: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8);
  }
}

/* ─── Print ────────────────────────────────────────────────────────────── */

@media print {
  :host {
    display: none !important;
  }
}
`;

export function createStylesheet(): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(STYLES_CSS);
  return sheet;
}
