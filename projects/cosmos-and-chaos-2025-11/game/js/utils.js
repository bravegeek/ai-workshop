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

// Add entry to log feed UI
export function addLogEntry(message) {
  const logEntries = document.querySelector('.log-entries');
  if (!logEntries) return;

  // Get current time in HH:MM:SS format
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  // Create log entry
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = `[${timeStr}] ${message}`;

  // Add to log feed
  logEntries.appendChild(entry);

  // Auto-scroll to bottom
  logEntries.scrollTop = logEntries.scrollHeight;

  // Keep only last 100 entries
  const entries = logEntries.querySelectorAll('.log-entry');
  if (entries.length > 100) {
    entries[0].remove();
  }
}

// Expose globally for console testing
window.addLogEntry = addLogEntry;
