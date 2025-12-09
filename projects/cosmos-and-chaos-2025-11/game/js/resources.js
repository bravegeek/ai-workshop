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

// Initialize resource system
export function initResources() {
  console.log('💎 Resource system initialized');
  // Resource tracking will be implemented in Step 6
  return resources;
}

// Add resource
export function addResource(type, amount) {
  if (resources.hasOwnProperty(type)) {
    resources[type] += amount;
    console.log(`+${amount} ${type} (Total: ${resources[type]})`);
  }
}

// Subtract resource
export function subtractResource(type, amount) {
  if (resources.hasOwnProperty(type)) {
    resources[type] = Math.max(0, resources[type] - amount);
    console.log(`-${amount} ${type} (Total: ${resources[type]})`);
  }
}

export { resources };
