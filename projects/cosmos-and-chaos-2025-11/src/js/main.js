/**
 * Main entry point for Cosmos and Chaos
 * Phase 1: Core Grid & Cards (MVP)
 */

import { initGrid } from './grid.js';
import { initCards } from './cards.js';
import { initResources } from './resources.js';
import { gameState } from './state.js';
import { saveManager } from './save.js';
import { productionLoop } from './production.js'; // Phase 2

console.log('🚀 Cosmos and Chaos - Initializing...');

// Initialize save/load UI
function initSaveUI() {
  const saveButton = document.getElementById('save-button');
  const loadButton = document.getElementById('load-button');
  const saveStatus = document.getElementById('save-status');

  if (!saveButton || !loadButton || !saveStatus) {
    console.warn('Save UI elements not found');
    return;
  }

  // Save button handler
  saveButton.addEventListener('click', () => {
    const success = saveManager.save();
    if (success) {
      saveStatus.textContent = '✓ Game saved';
      saveStatus.style.color = '#0f0';
      setTimeout(() => {
        saveStatus.textContent = '';
      }, 2000);
    } else {
      saveStatus.textContent = '✗ Save failed';
      saveStatus.style.color = '#f00';
    }
  });

  // Load button handler
  loadButton.addEventListener('click', () => {
    const result = saveManager.load();
    if (result) {
      saveStatus.textContent = '✓ Game loaded';
      saveStatus.style.color = '#0f0';

      // Trigger UI refresh by emitting events
      // The resource and card displays should auto-update via event subscriptions
      gameState.emit('state:restored', { data: result });

      // Force full page reload to ensure UI sync
      setTimeout(() => {
        location.reload();
      }, 500);
    } else {
      saveStatus.textContent = '✗ No save found';
      saveStatus.style.color = '#f00';
    }
  });

  // Update load button state based on save availability
  if (!saveManager.hasSave()) {
    loadButton.disabled = true;
    loadButton.style.opacity = '0.5';
  }

  // Subscribe to save events to update button states
  gameState.on('game:saved', () => {
    loadButton.disabled = false;
    loadButton.style.opacity = '1';
  });

  console.log('✓ Save UI initialized');
}

// Initialize game systems
function init() {
  console.log('📦 Initializing game systems...');

  // Step 1: Initialize grid
  initGrid();

  // Step 2: Initialize cards
  initCards();

  // Step 3: Initialize resources
  initResources();

  // Step 4: Initialize save system
  initSaveUI();

  // Step 5: Start auto-save (every 30 seconds)
  saveManager.startAutoSave(30000);

  // Check for existing auto-save on load
  if (saveManager.hasSave(true)) {
    const autoSaveInfo = saveManager.getSaveInfo(true);
    if (autoSaveInfo) {
      console.log(`💾 Auto-save found from ${new Date(autoSaveInfo.timestamp).toLocaleString()}`);
    }
  }

  // Step 6: Start production loop (Phase 2)
  productionLoop.start();

  // Mark as initialized
  gameState.meta.initialized = true;
  console.log('✓ Game systems ready');
  console.log('Current Phase:', gameState.meta.phase);

  // Expose for console debugging
  window.gameState = gameState;
  window.productionLoop = productionLoop; // Phase 2
  window.dev = {
    state: () => console.table(gameState.toJSON()),
    resources: () => console.table(gameState.resources),
    cards: () => console.table(gameState.cards),
    save: () => saveManager.save(),
    load: () => saveManager.load(),
    export: () => console.log(saveManager.exportSave()),
    reset: () => saveManager.newGame(false),
    // Phase 2: Production debugging
    production: () => console.table(gameState.productionRates),
    efficiency: () => console.table(gameState.efficiencies),
    accumulators: () => console.table(gameState.resourceAccumulators),
    automate: (cardId) => gameState.startAutomation(cardId)
  };

  console.log('💡 Tip: Use window.dev.state() to inspect game state');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { gameState };
