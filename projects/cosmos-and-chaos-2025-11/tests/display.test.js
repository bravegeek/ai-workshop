/**
 * @vitest-environment jsdom
 * Tests for Display Updates (Phase 2 - User Story 2)
 * Validates visual updates including Status LEDs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/js/state.js';
// We expect this module to exist (TDD - fail first)
// import { DisplayUpdateManager } from '../src/js/display.js';

describe('Display Updates', () => {
  let gameState;
  
  beforeEach(() => {
    gameState = new GameState();
    document.body.innerHTML = '';
  });

  describe('LED Updates', () => {
    it('updates LED class based on efficiency', () => {
      // Mock card element
      const cardId = 'processor';
      const cardElement = document.createElement('div');
      cardElement.dataset.cardId = cardId;
      cardElement.innerHTML = `
        <div class="card-header">
          <div class="status-led"></div>
        </div>
      `;
      document.body.appendChild(cardElement);

      // Setup state
      gameState.cards.processor = {
        id: 'processor',
        placed: true,
        automated: true
      };
      gameState.efficiencies.processor = { value: 1.0 }; // Green

      // We manually trigger the logic we expect DisplayUpdateManager to perform
      // OR we test the manager itself.
      // Since we can't import the manager yet, we'll write the test for the LOGIC
      // that the manager WILL implement, essentially specifying the behavior.

      const led = cardElement.querySelector('.status-led');
      
      // Simulate update
      const status = gameState.getCardStatusLED(cardId);
      led.classList.remove('green', 'yellow', 'red');
      led.classList.add(status);

      expect(led.classList.contains('green')).toBe(true);

      // Change to yellow
      gameState.efficiencies.processor.value = 0.5;
      const status2 = gameState.getCardStatusLED(cardId);
      led.classList.remove('green', 'yellow', 'red');
      led.classList.add(status2);
      
      expect(led.classList.contains('yellow')).toBe(true);
      expect(led.classList.contains('green')).toBe(false);
    });
  });
});