/**
 * Resource tracking system
 * Manages Ore, Metal, Energy, Science
 * Now uses centralized GameState
 */

import { gameState } from './state.js';

console.log('💎 Resources module loaded');

// Cache DOM elements for performance
let resourceElements = null;

// Update resource display in UI
function updateResourceDisplay(type) {
  // Use cached elements if available
  if (!resourceElements) {
    cacheResourceElements();
  }

  if (resourceElements[type]) {
    resourceElements[type].textContent = gameState.getResource(type);
  } else {
    console.warn(`Could not find display element for resource: ${type}`);
  }
}

// Cache DOM element references for performance
function cacheResourceElements() {
  resourceElements = {};
  const allLabels = document.querySelectorAll('.resource-label');

  allLabels.forEach(label => {
    const type = label.textContent.trim().toLowerCase();
    const valueElement = label.parentElement.querySelector('.resource-value');
    if (valueElement) {
      resourceElements[type] = valueElement;
    }
  });
}

// Update all resource displays
function updateAllDisplays() {
  ['ore', 'metal', 'energy', 'science'].forEach(type => {
    updateResourceDisplay(type);
  });
}

// Initialize resource system
export function initResources() {
  console.log('💎 Initializing resource system...');

  // Cache DOM elements
  cacheResourceElements();

  // Subscribe to state changes for automatic UI updates
  gameState.on('resource:changed', ({ type, total }) => {
    updateResourceDisplay(type);
  });

  // Set initial display values
  updateAllDisplays();

  console.log('✓ Resource system initialized');
}

// Add resource - delegates to gameState
export function addResource(type, amount) {
  return gameState.addResource(type, amount);
}

// Subtract resource - delegates to gameState
export function subtractResource(type, amount) {
  return gameState.subtractResource(type, amount);
}

// Get resource amount (utility)
export function getResource(type) {
  return gameState.getResource(type);
}

// Check if player has enough resources
export function hasResources(costs) {
  return gameState.hasResources(costs);
}

/**
 * Check if a resource has been discovered (Phase 3 - US3)
 * A resource is considered "discovered" if the player has ever had any amount of it
 * This is used for spoiler protection in upgrade modals
 * @param {string} resourceType - Resource type (ore, metal, energy, etc.)
 * @returns {boolean} True if resource has been discovered
 */
export function isResourceDiscovered(resourceType) {
  // For Phase 3 MVP, we'll use a simple heuristic:
  // A resource is discovered if the player currently has any amount OR has ever produced it
  // In the future, this could be tracked explicitly in gameState

  const currentAmount = gameState.getResource(resourceType);
  if (currentAmount > 0) {
    return true;
  }

  // Check if any card that produces this resource has ever been used
  // This requires checking if any card with this resource as output has production > 0
  const cards = gameState.cards;
  for (const cardId in cards) {
    const card = cards[cardId];
    const cardConfig = window.CARD_CONFIGS?.[cardId];

    if (cardConfig && cardConfig.outputs && cardConfig.outputs.includes(resourceType)) {
      if (card.production > 0) {
        return true;
      }
    }
  }

  // Default to discovered for basic resources (ore, energy are always known)
  if (resourceType === 'ore' || resourceType === 'energy') {
    return true;
  }

  return false;
}

// Expose functions globally for console testing
window.addResource = addResource;
window.subtractResource = subtractResource;
window.getResource = getResource;
window.isResourceDiscovered = isResourceDiscovered;  // Phase 3 - needed by display.js

// Test function for console testing
// Usage in browser console: testResources()
window.testResources = function() {
  console.log('🧪 Testing resource system...');
  console.log('Adding 100 ore...');
  addResource('ore', 100);
  console.log('Adding 50 metal...');
  addResource('metal', 50);
  console.log('Adding 75 energy...');
  addResource('energy', 75);
  console.log('Adding 25 science...');
  addResource('science', 25);
  console.log('✓ Test complete! Check the Data Stack sidebar.');
};
