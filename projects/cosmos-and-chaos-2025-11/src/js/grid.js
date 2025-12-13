/**
 * Grid management system
 * Handles 10×10 grid with 5×4 viewport
 * Now uses centralized GameState
 */

import { gameState } from './state.js';

console.log('📐 Grid module loaded');

// Grid state
const gridState = {
  rows: 4,
  cols: 5,
  cells: [] // 2D array of cell elements
};

// Create a single grid cell
function createGridCell(row, col) {
  const cell = document.createElement('div');
  cell.className = 'grid-cell';
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.occupied = 'false';

  // Add drop zone event handlers
  cell.addEventListener('dragover', handleDragOver);
  cell.addEventListener('dragleave', handleDragLeave);
  cell.addEventListener('drop', handleDrop);

  return cell;
}

// Drop zone handlers
function handleDragOver(e) {
  e.preventDefault(); // Allow drop

  const cell = e.currentTarget;
  const isEmpty = cell.dataset.occupied === 'false';

  if (isEmpty) {
    cell.classList.add('drop-target');
    cell.classList.remove('drop-invalid');
    e.dataTransfer.dropEffect = 'move';
  } else {
    cell.classList.add('drop-invalid');
    cell.classList.remove('drop-target');
    e.dataTransfer.dropEffect = 'none';
  }
}

function handleDragLeave(e) {
  const cell = e.currentTarget;
  cell.classList.remove('drop-target', 'drop-invalid');
}

function handleDrop(e) {
  e.preventDefault();

  const cell = e.currentTarget;
  const isEmpty = cell.dataset.occupied === 'false';

  if (!isEmpty) {
    console.warn('Cannot drop on occupied cell');
    return;
  }

  // Get the dragged card (from cards.js)
  const draggedCard = document.querySelector('.dragging');
  if (!draggedCard) return;

  const sourceCell = draggedCard.parentElement;

  // Move card to new cell
  cell.appendChild(draggedCard);
  cell.dataset.occupied = 'true';

  // Update source cell
  if (sourceCell && sourceCell.classList.contains('grid-cell')) {
    sourceCell.dataset.occupied = 'false';
  }

  // Update gameState with new position
  const cardId = draggedCard.dataset.cardId;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  gameState.placeCard(cardId, row, col);

  // Log the move
  if (window.addLogEntry) {
    window.addLogEntry(`Moved ${cardId} to [${row},${col}]`);
  }

  console.log(`Card moved to [${row},${col}]`);
}

// Initialize grid system
export function initGrid() {
  console.log('📐 Initializing 5×4 grid system...');

  const gridContainer = document.querySelector('.grid-container');
  if (!gridContainer) {
    console.error('Grid container not found!');
    return gridState;
  }

  // Clear any placeholder content
  gridContainer.innerHTML = '';

  // Create 5×4 grid (20 cells)
  for (let row = 0; row < gridState.rows; row++) {
    gridState.cells[row] = [];
    for (let col = 0; col < gridState.cols; col++) {
      const cell = createGridCell(row, col);
      gridState.cells[row][col] = cell;
      gridContainer.appendChild(cell);
    }
  }

  console.log(`✓ Grid created: ${gridState.cols}×${gridState.rows} cells (${gridState.rows * gridState.cols} total)`);

  return gridState;
}

// Get cell at position
export function getCell(row, col) {
  if (row >= 0 && row < gridState.rows && col >= 0 && col < gridState.cols) {
    return gridState.cells[row][col];
  }
  return null;
}

// Check if cell is occupied
export function isCellOccupied(row, col) {
  const cell = getCell(row, col);
  return cell ? cell.dataset.occupied === 'true' : false;
}

/**
 * Get adjacent cell coordinates for a given cell (N, S, E, W)
 * @param {number} row
 * @param {number} col
 * @returns {Array<Object>} Array of {row, col} for adjacent cells
 */
export function getAdjacentCells(row, col) {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, 1], [0, -1]]; // N, S, E, W

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < gridState.rows &&
        newCol >= 0 && newCol < gridState.cols) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  return neighbors;
}

/**
 * Determine if two cards are logically connected based on I/O
 * @param {Object} cardA - First card object from gameState.cards
 * @param {Object} cardB - Second card object from gameState.cards
 * @returns {boolean} True if cardA produces something cardB consumes, or vice-versa
 */
export function areCardsConnected(cardA, cardB) {
  if (!cardA || !cardB) return false;

  // Check if cardA's outputs match cardB's inputs
  const aToB = (cardA.outputs || []).some(outputType =>
    (cardB.inputRequirements && cardB.inputRequirements[outputType])
  );

  // Check if cardB's outputs match cardA's inputs
  const bToA = (cardB.outputs || []).some(outputType =>
    (cardA.inputRequirements && cardA.inputRequirements[outputType])
  );

  return aToB || bToA;
}

/**
 * Get all placed and logically connected neighbor cards for a given card.
 * A neighbor is connected if it's adjacent and has matching I/O.
 * @param {Object} card - The card object (from gameState.cards) to find neighbors for.
 * @returns {Array<Object>} An array of connected neighbor card objects.
 */
export function getConnectedNeighbors(card) {
  if (!card || !card.placed) return [];

  const connectedNeighbors = [];
  const adjacentCells = getAdjacentCells(card.row, card.col);

  for (const { row, col } of adjacentCells) {
        // Directly query gameState for card at adjacent position
        const neighborCardId = Object.keys(gameState.cards).find(id => {
          const currentCard = gameState.cards[id];
          console.log(`    Checking gameState.cards[${id}]: placed=${currentCard.placed}, row=${currentCard.row}, col=${currentCard.col} against target (row=${row}, col=${col})`);
          return currentCard.placed &&
                 currentCard.row === row &&
                 currentCard.col === col;
        });
        
        if (neighborCardId) {      const neighborCard = gameState.getCard(neighborCardId);

      // Check if they are logically connected
      if (neighborCard && areCardsConnected(card, neighborCard)) {
        connectedNeighbors.push(neighborCard);
      }
    }
  }
  return connectedNeighbors;
}

export { gridState };
