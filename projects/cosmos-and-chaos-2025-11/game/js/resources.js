/**
 * Resource tracking system
 * Manages Ore, Metal, Energy, Science
 */

console.log('💎 Resources module loaded');

// Resource state
const resources = {
  ore: 0,
  metal: 0,
  energy: 0,
  science: 0
};

// Update resource display in UI
function updateResourceDisplay(type) {
  // Find the resource label by text content
  const allLabels = document.querySelectorAll('.resource-label');
  let valueElement = null;

  allLabels.forEach(label => {
    if (label.textContent.trim() === type.toUpperCase()) {
      valueElement = label.parentElement.querySelector('.resource-value');
    }
  });

  if (valueElement) {
    valueElement.textContent = resources[type];
  } else {
    console.warn(`Could not find display element for resource: ${type}`);
  }
}

// Update all resource displays
function updateAllDisplays() {
  Object.keys(resources).forEach(type => {
    updateResourceDisplay(type);
  });
}

// Initialize resource system
export function initResources() {
  console.log('💎 Initializing resource system...');

  // Set initial display values
  updateAllDisplays();

  console.log('✓ Resource system initialized');
  return resources;
}

// Add resource
export function addResource(type, amount) {
  if (resources.hasOwnProperty(type)) {
    resources[type] += amount;
    updateResourceDisplay(type);
    console.log(`+${amount} ${type} (Total: ${resources[type]})`);
  }
}

// Subtract resource
export function subtractResource(type, amount) {
  if (resources.hasOwnProperty(type)) {
    resources[type] = Math.max(0, resources[type] - amount);
    updateResourceDisplay(type);
    console.log(`-${amount} ${type} (Total: ${resources[type]})`);
  }
}

// Get resource amount (utility)
export function getResource(type) {
  return resources.hasOwnProperty(type) ? resources[type] : 0;
}

// Check if player has enough resources
export function hasResources(costs) {
  for (const [type, amount] of Object.entries(costs)) {
    if (getResource(type) < amount) {
      return false;
    }
  }
  return true;
}

// Expose functions globally for console testing
window.addResource = addResource;
window.subtractResource = subtractResource;
window.getResource = getResource;
window.resources = resources;

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

export { resources };
