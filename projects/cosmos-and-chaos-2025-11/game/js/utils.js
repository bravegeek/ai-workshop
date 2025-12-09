/**
 * Utility functions
 * Helper methods for common operations
 */

console.log('🔧 Utils module loaded');

// Format large numbers with commas
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Clamp value between min and max
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Log with timestamp
export function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}
