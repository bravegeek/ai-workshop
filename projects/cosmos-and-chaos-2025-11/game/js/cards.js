/**
 * Card system
 * Manages the 8 core cards and their interactions
 */

console.log('🃏 Cards module loaded');

// Card registry
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
    progress: 0
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
    progress: 0
  },
  storage: {
    id: 'storage',
    name: 'CARGO BAY',
    tier: 0,
    icon: '📦',
    counterLabel: 'CAPACITY',
    counterValue: '0/1000',
    secondaryCounters: '<span>Passive</span>',
    progress: 0
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
    progress: 0
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
    progress: 0
  },
  engine: {
    id: 'engine',
    name: 'BASIC THRUSTER',
    tier: 0,
    icon: '🚀',
    counterLabel: 'SPEED',
    counterValue: '0 m/s',
    secondaryCounters: '<span>Passive</span>',
    progress: 0
  },
  habitat: {
    id: 'habitat',
    name: 'BASIC QUARTERS',
    tier: 0,
    icon: '🏠',
    counterLabel: 'CREW',
    counterValue: '10',
    secondaryCounters: '<span>Morale: 100%</span>',
    progress: 100
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
    progress: 0
  }
};

// Create a card element
export function createCard(config) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.cardId = config.id;
  card.dataset.tier = config.tier || 0;

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

  return card;
}

// Place a card on the grid
function placeCard(card, row, col) {
  const gridCell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  if (gridCell && gridCell.dataset.occupied !== 'true') {
    gridCell.appendChild(card);
    gridCell.dataset.occupied = 'true';
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

export { cards, CARD_CONFIGS };
