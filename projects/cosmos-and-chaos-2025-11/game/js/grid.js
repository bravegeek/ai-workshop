/**
 * Grid management system
 * Handles 10×10 grid with 5×4 viewport
 */

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

  // Log the move
  const cardId = draggedCard.dataset.cardId;
  const row = cell.dataset.row;
  const col = cell.dataset.col;

  // Import addLogEntry (will be available from cards.js context)
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

export { gridState };
