/**
 * Main entry point for Cosmos and Chaos
 * Phase 1: Core Grid & Cards (MVP)
 */

import { initGrid } from './grid.js';
import { initCards } from './cards.js';
import { initResources } from './resources.js';

console.log('🚀 Cosmos and Chaos - Initializing...');

// Game state will be managed here
const gameState = {
  phase: 'MVP Phase 1',
  initialized: false
};

// Initialize game systems
function init() {
  console.log('📦 Initializing game systems...');

  // Step 3: Initialize grid
  initGrid();

  // Step 4: Initialize cards (test card for template verification)
  initCards();

  // Resources will be initialized in Step 6
  // initResources() - Step 6

  gameState.initialized = true;
  console.log('✓ Game systems ready');
  console.log('Current Phase:', gameState.phase);
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { gameState };
