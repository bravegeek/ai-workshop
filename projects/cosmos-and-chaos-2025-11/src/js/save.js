/**
 * Save/Load System
 * Handles game state persistence with localStorage
 */

import { gameState } from './state.js';

console.log('💾 Save module loaded');

/**
 * SaveManager - Handles save/load operations
 * - LocalStorage persistence
 * - Auto-save support
 * - Validation and error handling
 * - Export/import support
 */
class SaveManager {
  constructor(state) {
    this.gameState = state;
    this.SAVE_KEY = 'cosmos_chaos_save';
    this.AUTO_SAVE_KEY = 'cosmos_chaos_autosave';
    this.VERSION = 1;
    this.autoSaveInterval = null;
  }

  /**
   * Save game to localStorage
   * @param {boolean} isAutoSave - Is this an auto-save?
   * @returns {boolean} Success status
   */
  save(isAutoSave = false) {
    try {
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        ...this.gameState.toJSON()
      };

      const key = isAutoSave ? this.AUTO_SAVE_KEY : this.SAVE_KEY;
      localStorage.setItem(key, JSON.stringify(data));

      const saveType = isAutoSave ? 'Auto-save' : 'Manual save';
      console.log(`✓ ${saveType} complete`);

      // Emit save event
      this.gameState.emit('game:saved', { isAutoSave, timestamp: data.timestamp });

      return true;
    } catch (err) {
      console.error('Save failed:', err);

      // Check if localStorage is full
      if (err.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded! Try clearing old saves.');
      }

      return false;
    }
  }

  /**
   * Load game from localStorage
   * @param {boolean} loadAutoSave - Load auto-save instead of manual save?
   * @returns {Object|null} Loaded save data or null if failed
   */
  load(loadAutoSave = false) {
    try {
      const key = loadAutoSave ? this.AUTO_SAVE_KEY : this.SAVE_KEY;
      const json = localStorage.getItem(key);

      if (!json) {
        console.log('No save file found');
        return null;
      }

      const data = JSON.parse(json);

      // Validate save data
      if (!this.validate(data)) {
        console.error('Invalid save data - save file corrupted');
        return null;
      }

      // Restore state
      const success = this.gameState.fromJSON(data);
      if (!success) {
        console.error('Failed to restore game state');
        return null;
      }

      const saveType = loadAutoSave ? 'auto-save' : 'manual save';
      console.log(`✓ Game loaded from ${saveType}`);
      console.log(`Save timestamp: ${new Date(data.timestamp).toLocaleString()}`);

      // Emit load event
      this.gameState.emit('game:loaded', {
        timestamp: data.timestamp,
        isAutoSave: loadAutoSave
      });

      return data;
    } catch (err) {
      console.error('Load failed:', err);
      return null;
    }
  }

  /**
   * Validate save data structure
   * @param {Object} data - Save data to validate
   * @returns {boolean} Is valid
   */
  validate(data) {
    // Check version
    if (!data.version || typeof data.version !== 'number') {
      console.error('Invalid save: missing or invalid version');
      return false;
    }

    // Check timestamp
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      console.error('Invalid save: missing or invalid timestamp');
      return false;
    }

    // Use GameState's validation
    return this.gameState.validate(data);
  }

  /**
   * Check if a save exists
   * @param {boolean} checkAutoSave - Check auto-save instead of manual?
   * @returns {boolean} Save exists
   */
  hasSave(checkAutoSave = false) {
    const key = checkAutoSave ? this.AUTO_SAVE_KEY : this.SAVE_KEY;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get save metadata without loading
   * @param {boolean} checkAutoSave - Check auto-save instead of manual?
   * @returns {Object|null} Save metadata
   */
  getSaveInfo(checkAutoSave = false) {
    try {
      const key = checkAutoSave ? this.AUTO_SAVE_KEY : this.SAVE_KEY;
      const json = localStorage.getItem(key);
      if (!json) return null;

      const data = JSON.parse(json);
      return {
        version: data.version,
        timestamp: data.timestamp,
        playtime: data.meta?.playtime || 0,
        resources: data.resources
      };
    } catch (err) {
      console.error('Failed to get save info:', err);
      return null;
    }
  }

  /**
   * Delete save file
   * @param {boolean} deleteAutoSave - Delete auto-save instead of manual?
   * @returns {boolean} Success status
   */
  deleteSave(deleteAutoSave = false) {
    try {
      const key = deleteAutoSave ? this.AUTO_SAVE_KEY : this.SAVE_KEY;
      localStorage.removeItem(key);
      const saveType = deleteAutoSave ? 'Auto-save' : 'Manual save';
      console.log(`✓ ${saveType} deleted`);
      return true;
    } catch (err) {
      console.error('Failed to delete save:', err);
      return false;
    }
  }

  /**
   * Export save to JSON string (for backup/sharing)
   * @returns {string|null} JSON string or null if failed
   */
  exportSave() {
    try {
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        ...this.gameState.toJSON()
      };
      return JSON.stringify(data, null, 2);
    } catch (err) {
      console.error('Export failed:', err);
      return null;
    }
  }

  /**
   * Import save from JSON string
   * @param {string} jsonString - JSON save data
   * @returns {boolean} Success status
   */
  importSave(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!this.validate(data)) {
        console.error('Invalid import data');
        return false;
      }

      const success = this.gameState.fromJSON(data);
      if (success) {
        console.log('✓ Save imported successfully');
        this.gameState.emit('game:imported', { timestamp: data.timestamp });
      }

      return success;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  /**
   * Start auto-save at regular intervals
   * @param {number} intervalMs - Auto-save interval in milliseconds (default 30s)
   */
  startAutoSave(intervalMs = 30000) {
    // Stop existing auto-save if running
    this.stopAutoSave();

    console.log(`✓ Auto-save enabled (every ${intervalMs / 1000}s)`);

    this.autoSaveInterval = setInterval(() => {
      this.save(true);
    }, intervalMs);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('✓ Auto-save disabled');
    }
  }

  /**
   * Reset game to initial state (NEW GAME)
   * @param {boolean} keepSaves - Keep save files?
   * @returns {boolean} Success status
   */
  newGame(keepSaves = true) {
    try {
      this.gameState.reset();

      if (!keepSaves) {
        this.deleteSave(false);  // Delete manual save
        this.deleteSave(true);   // Delete auto-save
      }

      console.log('✓ New game started');
      this.gameState.emit('game:new', {});

      return true;
    } catch (err) {
      console.error('Failed to start new game:', err);
      return false;
    }
  }
}

// Create singleton instance
const saveManager = new SaveManager(gameState);

// Expose for console debugging (browser only)
if (typeof window !== 'undefined') {
  window.saveManager = saveManager;
  window.saveGame = () => saveManager.save();
  window.loadGame = () => saveManager.load();
  window.exportSave = () => {
    const data = saveManager.exportSave();
    console.log('Copy this save data:');
    console.log(data);
    return data;
  };
}

export { saveManager, SaveManager };
