/**
 * Card system
 * Manages the 8 core cards and their interactions
 * Now uses centralized GameState
 */

import { addResource, subtractResource, getResource } from './resources.js';
import { addLogEntry } from './utils.js';
import { gameState } from './state.js';

console.log('🃏 Cards module loaded');

// Card registry (DOM elements)
const cards = {
  extractor: null,  // T01 Proton Cutter
  sensor: null,     // T02 Ore Scanner
  storage: null,    // T03 Cargo Bay
  processor: null,  // T04 Refinery Module
  reactor: null,    // Basic Reactor
  engine: null,     // Basic Thruster
  habitat: null,    // Basic Quarters
  lab: null         // Basic Lab
};

// Card configurations for all 8 core cards
const CARD_CONFIGS = {
  extractor: {
    id: 'extractor',
    name: 'PROTON CUTTER',
    tier: 0,
    icon: '⚡',
    counterLabel: 'ORE MINED',
    counterValue: 0,
    button: 'FIRE',
    secondaryCounters: '<span>+1/click</span>',
    progress: 0,
    // Phase 2: Production automation
    inputRequirements: {},        // Base producer - no inputs
    outputs: ['ore'],             // Produces ore
    baseRate: 1.0                 // 1 ore per second at Tier 1
  },
  sensor: {
    id: 'sensor',
    name: 'ORE SCANNER',
    tier: 0,
    icon: '📡',
    counterLabel: 'SCANS',
    counterValue: 0,
    button: 'SCAN',
    secondaryCounters: '<span>Reveals info</span>',
    progress: 0,
    // Phase 2: Production automation
    inputRequirements: {},        // Base producer
    outputs: ['data'],            // Produces data
    baseRate: 0.5                 // 0.5 data per second at Tier 1
  },
  storage: {
    id: 'storage',
    name: 'CARGO BAY',
    tier: 0,
    icon: '📦',
    counterLabel: 'CAPACITY',
    counterValue: '0/1000',
    secondaryCounters: '<span>Passive</span>',
    progress: 0,
    // Phase 2: Passive card - no production
    inputRequirements: {},
    outputs: [],
    baseRate: 0
  },
  processor: {
    id: 'processor',
    name: 'REFINERY',
    tier: 1,
    icon: '⚙️',
    counterLabel: 'METAL',
    counterValue: 0,
    button: 'REFINE',
    secondaryCounters: '<span>10 Ore → 1 Metal</span>',
    progress: 0,
    // Phase 2: Production automation
    inputRequirements: { ore: 5 },  // Requires 5 ore per cycle
    outputs: ['metal'],            // Produces metal
    baseRate: 0.4                  // 0.4 metal per second (2 metal per 5 seconds)
  },
  reactor: {
    id: 'reactor',
    name: 'BASIC REACTOR',
    tier: 0,
    icon: '⚛️',
    counterLabel: 'ENERGY',
    counterValue: 0,
    button: 'GENERATE',
    secondaryCounters: '<span>+5/click</span>',
    progress: 0,
    // Phase 2: Production automation
    inputRequirements: {},        // Base producer
    outputs: ['energy'],          // Produces energy
    baseRate: 5.0                 // 5 energy per second
  },
  engine: {
    id: 'engine',
    name: 'BASIC THRUSTER',
    tier: 0,
    icon: '🚀',
    counterLabel: 'SPEED',
    counterValue: '0 m/s',
    secondaryCounters: '<span>Passive</span>',
    progress: 0,
    // Phase 2: Passive card - no production
    inputRequirements: {},
    outputs: [],
    baseRate: 0
  },
  habitat: {
    id: 'habitat',
    name: 'BASIC QUARTERS',
    tier: 0,
    icon: '🏠',
    counterLabel: 'CREW',
    counterValue: '10',
    secondaryCounters: '<span>Morale: 100%</span>',
    progress: 100,
    // Phase 2: Production automation
    inputRequirements: {},        // Base producer
    outputs: ['biomass'],         // Produces biomass
    baseRate: 0.2                 // 0.2 biomass per second
  },
  lab: {
    id: 'lab',
    name: 'BASIC LAB',
    tier: 0,
    icon: '🔬',
    counterLabel: 'SCIENCE',
    counterValue: 0,
    button: 'RESEARCH',
    secondaryCounters: '<span>+1/click</span>',
    progress: 0,
    // Phase 2: Production automation
    inputRequirements: { data: 2, energy: 1 },  // Requires data and energy
    outputs: ['science'],         // Produces science
    baseRate: 0.3                 // 0.3 science per second
  }
};

// Handle card button clicks
function handleCardClick(cardId, buttonAction) {
  switch (cardId) {
    case 'extractor':
      // FIRE - Mine ore
      addResource('ore', 1);
      gameState.incrementProduction(cardId);
      updateCardCounter(cards.extractor, gameState.getCard(cardId).production);
      addLogEntry('Proton Cutter: +1 Ore');
      flashCard(cards.extractor);
      break;

    case 'sensor':
      // SCAN - Perform scan
      gameState.incrementProduction(cardId);
      updateCardCounter(cards.sensor, gameState.getCard(cardId).production);
      addLogEntry(`Ore Scanner: Scan #${gameState.getCard(cardId).production} complete`);
      flashCard(cards.sensor);
      break;

    case 'processor':
      // REFINE - Convert 10 Ore → 1 Metal
      if (getResource('ore') >= 10) {
        subtractResource('ore', 10);
        addResource('metal', 1);
        gameState.incrementProduction(cardId);
        updateCardCounter(cards.processor, gameState.getCard(cardId).production);
        addLogEntry('Refinery: -10 Ore, +1 Metal');
        flashCard(cards.processor);
      } else {
        addLogEntry('Refinery: Insufficient Ore (need 10)');
        flashCard(cards.processor, 'error');
      }
      break;

    case 'reactor':
      // GENERATE - Produce energy
      addResource('energy', 5);
      gameState.incrementProduction(cardId);
      updateCardCounter(cards.reactor, gameState.getCard(cardId).production);
      addLogEntry('Reactor: +5 Energy');
      flashCard(cards.reactor);
      break;

    case 'lab':
      // RESEARCH - Produce science
      addResource('science', 1);
      gameState.incrementProduction(cardId);
      updateCardCounter(cards.lab, gameState.getCard(cardId).production);
      addLogEntry('Lab: +1 Science');
      flashCard(cards.lab);
      break;
  }
}

// Update a card's counter display
function updateCardCounter(card, value) {
  if (!card) return;
  const counterPrimary = card.querySelector('.counter-primary');
  if (counterPrimary) {
    counterPrimary.textContent = value;
  }
}

// Flash effect for visual feedback
function flashCard(card, type = 'success') {
  if (!card) return;
  const flashClass = type === 'error' ? 'flash-error' : 'flash-success';
  card.classList.add(flashClass);
  setTimeout(() => card.classList.remove(flashClass), 200);
}

// Create a card element
export function createCard(config) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.cardId = config.id;
  card.dataset.tier = config.tier || 0;

  // Make card draggable
  card.draggable = true;

  // Build body content with optional button
  let bodyContent = `
    <div class="card-icon">${config.icon || '⬡'}</div>
    ${config.button ? `<button class="card-button" data-action="${config.button.toLowerCase()}">${config.button}</button>` : ''}
    <div class="card-counter">
      <div class="counter-label">${config.counterLabel || 'COUNT'}</div>
      <div class="counter-primary">${config.counterValue || 0}</div>
      ${config.secondaryCounters ? `<div class="counter-secondary">${config.secondaryCounters}</div>` : ''}
    </div>
  `;

  // Card HTML structure
  card.innerHTML = `
    <div class="card-header">
      <div class="card-name">${config.name}</div>
      <div class="card-tier">T${config.tier || 0}</div>
      <div class="card-status">
        <div class="status-led ${config.active ? 'active' : ''}"></div>
      </div>
    </div>
    <div class="card-body">${bodyContent}</div>
    <div class="card-footer">
      <div class="status-bar">
        <div class="status-bar-fill">
          <div class="status-bar-progress" style="width: ${config.progress || 0}%"></div>
        </div>
        <div class="status-bar-text">${config.progress || 0}%</div>
      </div>
    </div>
  `;

  // Add click event listener to button if present
  if (config.button) {
    const button = card.querySelector('.card-button');
    if (button) {
      console.log(`✓ Adding click handler to ${config.name} button`);
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card drag when clicking button
        console.log(`🖱️ Button clicked: ${config.name}`);
        handleCardClick(config.id, config.button.toLowerCase());
      });
    } else {
      console.warn(`⚠️ Button not found for ${config.name}`);
    }
  }

  // Add drag event handlers
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);

  return card;
}

// Drag event handlers
let draggedCard = null;
let sourceCell = null;

function handleDragStart(e) {
  draggedCard = e.target;
  sourceCell = draggedCard.parentElement;

  // Store card ID for drop handler
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', draggedCard.innerHTML);

  // Add dragging class for visual feedback
  setTimeout(() => {
    draggedCard.classList.add('dragging');
  }, 0);

  addLogEntry(`Dragging ${draggedCard.dataset.cardId}...`);
}

function handleDragEnd(e) {
  draggedCard.classList.remove('dragging');

  // Remove all drop-target highlights
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('drop-target', 'drop-invalid');
  });

  draggedCard = null;
  sourceCell = null;
}

// Place a card on the grid
function placeCard(card, row, col) {
  const gridCell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  if (gridCell && gridCell.dataset.occupied !== 'true') {
    gridCell.appendChild(card);
    gridCell.dataset.occupied = 'true';

    // Update gameState
    const cardId = card.dataset.cardId;
    gameState.placeCard(cardId, row, col);

    return true;
  }
  return false;
}

// Initialize card system
export function initCards() {
  console.log('🃏 Initializing card system...');

  // Create all 8 core cards
  cards.extractor = createCard(CARD_CONFIGS.extractor);
  cards.sensor = createCard(CARD_CONFIGS.sensor);
  cards.storage = createCard(CARD_CONFIGS.storage);
  cards.processor = createCard(CARD_CONFIGS.processor);
  cards.reactor = createCard(CARD_CONFIGS.reactor);
  cards.engine = createCard(CARD_CONFIGS.engine);
  cards.habitat = createCard(CARD_CONFIGS.habitat);
  cards.lab = createCard(CARD_CONFIGS.lab);

  // Place cards on grid in starting layout (2 rows of 4)
  const layout = [
    { card: cards.extractor, row: 0, col: 0 },
    { card: cards.sensor, row: 0, col: 1 },
    { card: cards.storage, row: 0, col: 2 },
    { card: cards.processor, row: 0, col: 3 },
    { card: cards.reactor, row: 1, col: 0 },
    { card: cards.engine, row: 1, col: 1 },
    { card: cards.habitat, row: 1, col: 2 },
    { card: cards.lab, row: 1, col: 3 }
  ];

  let placedCount = 0;
  layout.forEach(({ card, row, col }) => {
    if (placeCard(card, row, col)) {
      placedCount++;
    }
  });

  console.log(`✓ ${placedCount}/8 cards placed on grid`);

  return cards;
}

// Expose for debugging
window.cards = cards;
window.handleCardClick = handleCardClick;

export { cards, CARD_CONFIGS };
