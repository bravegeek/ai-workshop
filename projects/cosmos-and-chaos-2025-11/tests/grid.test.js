/**
 * @vitest-environment jsdom
 * Tests for Grid System (Phase 2 - User Story 3)
 * Validates card placement, adjacency, and I/O connections
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/js/state.js';
import { getAdjacentCells, areCardsConnected, getCell, gridState, getConnectedNeighbors, initGrid } from '../src/js/grid.js';

describe('Grid System', () => {
  let gameState;

  beforeEach(() => {
    // Reset the cards and grid state for each test
    gameState = new GameState();
    gameState.reset();
    
    // Mock the grid container in the JSDOM environment
    document.body.innerHTML = '<div class="grid-container"></div>';
    initGrid(); // Initialize gridState.cells
  });

  describe('Adjacency and Connections', () => {
    // T046: Test getAdjacentCells(row, col)
    it('getAdjacentCells returns correct neighbors for a cell', () => {
      // Assuming a 3x3 grid for simplicity for this test
      // Mock gridState for this test, as it's not exported from grid.js
      const originalGridStateRows = gameState.grid.rows;
      const originalGridStateCols = gameState.grid.cols;
      gameState.grid.rows = 3;
      gameState.grid.cols = 3;

      // Test center cell (1,1)
      const centerNeighbors = getAdjacentCells(1, 1);
      expect(centerNeighbors).toHaveLength(4);
      expect(centerNeighbors).toContainEqual({ row: 0, col: 1 });
      expect(centerNeighbors).toContainEqual({ row: 2, col: 1 });
      expect(centerNeighbors).toContainEqual({ row: 1, col: 2 });
      expect(centerNeighbors).toContainEqual({ row: 1, col: 0 });

      // Test corner cell (0,0)
      const cornerNeighbors = getAdjacentCells(0, 0);
      expect(cornerNeighbors).toHaveLength(2);
      expect(cornerNeighbors).toContainEqual({ row: 1, col: 0 });
      expect(cornerNeighbors).toContainEqual({ row: 0, col: 1 });

      // Test edge cell (0,1)
      const edgeNeighbors = getAdjacentCells(0, 1);
      expect(edgeNeighbors).toHaveLength(3);
      expect(edgeNeighbors).toContainEqual({ row: 0, col: 0 });
      expect(edgeNeighbors).toContainEqual({ row: 1, col: 1 });
      expect(edgeNeighbors).toContainEqual({ row: 0, col: 2 });

      gameState.grid.rows = originalGridStateRows;
      gameState.grid.cols = originalGridStateCols;
    });

    // T047: Test areCardsConnected(cardA, cardB)
    it('areCardsConnected identifies valid I/O connections', () => {
      const cardA = { id: 'cardA', outputs: ['ore'] };
      const cardB = { id: 'cardB', inputRequirements: { ore: 1, energy: 1 } };
      const cardC = { id: 'cardC', inputRequirements: { energy: 1 } };
      const cardD = { id: 'cardD', outputs: ['energy'] };

      expect(areCardsConnected(cardA, cardB)).toBe(true);
      expect(areCardsConnected(cardB, cardA)).toBe(true); // cardA outputs ore, cardB consumes ore
      expect(areCardsConnected(cardA, cardC)).toBe(false);
      expect(areCardsConnected(cardD, cardB)).toBe(true);
      expect(areCardsConnected(cardA, cardD)).toBe(false); // A has no energy outputs, D has no ore inputs
    });

    // T048: Test I/O indicator connection detection works on grid with placed cards
    it('I/O indicator connection detection works on grid with placed cards', () => {
        // Mock cards for testing in gameState
        gameState.cards.extractor.placed = true;
        gameState.cards.extractor.row = 0;
        gameState.cards.extractor.col = 0;
        gameState.cards.extractor.outputs = ['ore'];
        gameState.cards.extractor.inputRequirements = {}; // Base producer

        gameState.cards.processor.placed = true;
        gameState.cards.processor.row = 0;
        gameState.cards.processor.col = 1; // Adjacent to extractor
        gameState.cards.processor.outputs = ['metal'];
        gameState.cards.processor.inputRequirements = { ore: 1 }; // Needs ore

        gameState.cards.reactor.placed = true;
        gameState.cards.reactor.row = 1;
        gameState.cards.reactor.col = 0; // Adjacent to extractor
        gameState.cards.reactor.outputs = ['energy'];
        gameState.cards.reactor.inputRequirements = {}; // Base producer

        // Test utility to check if two placed cards are considered "connected" for I/O
        // Uses the real getAdjacentCells and areCardsConnected
        const checkIOConnection = (cardIdA, cardIdB) => {
            const cardA = gameState.getCard(cardIdA);
            const cardB = gameState.getCard(cardIdB);

            if (!cardA || !cardB || !cardA.placed || !cardB.placed) return false;

            // Check for actual adjacency using getAdjacentCells
            const adjacentCells = getAdjacentCells(cardA.row, cardA.col);
            const isAdjacent = adjacentCells.some(cell => cell.row === cardB.row && cell.col === cardB.col);
            
            if (!isAdjacent) return false;

            return areCardsConnected(cardA, cardB);
        };

        // Test extractor (produces ore) to processor (needs ore) - adjacent
        expect(checkIOConnection('extractor', 'processor')).toBe(true);

        // Test processor (needs ore) to extractor (produces ore) - adjacent, connection exists
        expect(checkIOConnection('processor', 'extractor')).toBe(true);

        // Test extractor (produces ore) to reactor (no input for ore) - adjacent but no match
        expect(checkIOConnection('extractor', 'reactor')).toBe(false);

        // Move processor away
        gameState.cards.processor.col = 2; // Not adjacent to extractor
        expect(checkIOConnection('extractor', 'processor')).toBe(false);
    });

    // Test for T051: Implement getConnectedNeighbors(card)
    it('getConnectedNeighbors returns correctly connected adjacent cards', () => {
      // Set up a grid with specific cards
      gameState.cards.extractor.outputs = ['ore'];
      gameState.cards.extractor.inputRequirements = {};
      gameState.placeCard('extractor', 0, 0);

      gameState.cards.processor.outputs = ['metal'];
      gameState.cards.processor.inputRequirements = { ore: 1 };
      gameState.placeCard('processor', 0, 1);

      gameState.cards.reactor.outputs = ['energy'];
      gameState.cards.reactor.inputRequirements = {};
      gameState.placeCard('reactor', 1, 0);

      gameState.cards.sensor.outputs = ['data'];
      gameState.cards.sensor.inputRequirements = { energy: 1 }; // Consumes energy
      gameState.placeCard('sensor', 1, 1);
      // --- End Mocking ---

      // Test extractor (0,0) - connected to processor (0,1)
      const extractor = gameState.getCard('extractor');
      const extractorNeighbors = getConnectedNeighbors(extractor);
      expect(extractorNeighbors).toHaveLength(1);
      expect(extractorNeighbors[0].id).toBe('processor'); // Extractor outputs ore, processor consumes ore

      // Test processor (0,1) - connected to extractor (0,0) and sensor (1,1)
      const processor = gameState.getCard('processor');
      // Adjust sensor to consume metal to make this connection work
      gameState.cards.sensor.inputRequirements = { metal: 1 }; // Sensor now consumes metal

      const processorNeighborsAdjusted = getConnectedNeighbors(processor);
      expect(processorNeighborsAdjusted).toHaveLength(2);
      const neighborIds = processorNeighborsAdjusted.map(n => n.id).sort();
      expect(neighborIds).toEqual(['extractor', 'sensor']); // Extractor (outputs ore) and Sensor (consumes metal from processor)

      // Test reactor (1,0) - connected to sensor (1,1)
      const reactor = gameState.getCard('reactor');
      // Reset sensor for reactor test
      gameState.cards.sensor.inputRequirements = { energy: 1 };
      const reactorNeighborsAdjusted = getConnectedNeighbors(reactor);
      expect(reactorNeighborsAdjusted).toHaveLength(1);
      expect(reactorNeighborsAdjusted[0].id).toBe('sensor'); // Reactor outputs energy, sensor consumes energy
    });
  });
});
