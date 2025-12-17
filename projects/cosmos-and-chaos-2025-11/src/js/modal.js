/**
 * Upgrade Modal System (Phase 3 - US3)
 * Handles upgrade modal display, cost visualization, and upgrade confirmation
 */

import { gameState } from './state.js';
import { CARD_CONFIGS } from './cards.js';
import { isResourceDiscovered } from './resources.js';
import { formatNumber } from './utils.js';

console.log('🪟 Modal module loaded');

/**
 * Open the upgrade modal for a specific card (Phase 3 - T013)
 * @param {string} cardId - Card identifier
 */
export function openUpgradeModal(cardId) {
  const card = gameState.getCard(cardId);
  const cardConfig = CARD_CONFIGS[cardId];

  if (!card || !cardConfig) {
    console.warn(`Cannot open upgrade modal: invalid card ${cardId}`);
    return;
  }

  const modal = document.getElementById('upgrade-modal');
  if (!modal) {
    console.error('Upgrade modal element not found');
    return;
  }

  // Calculate next tier
  const nextTier = card.tier + 1;
  const upgradeCost = cardConfig.upgradeCosts?.[nextTier];
  const tierBenefit = cardConfig.tierBenefits?.[nextTier];

  if (!upgradeCost) {
    console.warn(`No upgrade available for ${cardId} from tier ${card.tier}`);
    alert(`This card is already at maximum tier!`);
    return;
  }

  // Populate modal content
  populateModalContent(cardId, card, cardConfig, nextTier, upgradeCost, tierBenefit);

  // Show modal
  modal.classList.remove('hidden');

  console.log(`📋 Opened upgrade modal for ${cardId}`);
}

/**
 * Close the upgrade modal
 */
export function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * Populate modal content with card info, costs, and benefits (Phase 3 - T013, T014)
 */
function populateModalContent(cardId, card, cardConfig, nextTier, upgradeCost, tierBenefit) {
  // Card info
  const cardName = document.querySelector('.modal-card-name');
  const cardTier = document.querySelector('.modal-card-tier');

  if (cardName) cardName.textContent = cardConfig.name;
  if (cardTier) cardTier.textContent = `Current Tier: T${card.tier} → Upgrade to T${nextTier}`;

  // Cost visualization (T014 - with progress bars)
  const costList = document.getElementById('cost-list');
  if (costList) {
    costList.innerHTML = '';

    Object.entries(upgradeCost).forEach(([resourceType, requiredAmount]) => {
      const discovered = isResourceDiscovered(resourceType);
      const currentAmount = gameState.getResource(resourceType);
      const progress = Math.min((currentAmount / requiredAmount) * 100, 100);
      const sufficient = currentAmount >= requiredAmount;

      const costItem = document.createElement('div');
      costItem.className = 'cost-item' + (discovered ? '' : ' hidden-resource');

      const label = discovered ? resourceType.toUpperCase() : 'UNKNOWN';

      costItem.innerHTML = `
        <span class="cost-label">${label}</span>
        <div class="cost-progress">
          <div class="cost-progress-bar ${sufficient ? '' : 'insufficient'}" style="width: ${progress}%"></div>
        </div>
        <span class="cost-values">${formatNumber(currentAmount)} / ${formatNumber(requiredAmount)}</span>
      `;

      costList.appendChild(costItem);
    });
  }

  // Benefits
  const benefitsList = document.getElementById('benefits-list');
  if (benefitsList && tierBenefit) {
    benefitsList.textContent = tierBenefit.description || 'Unlocks new capabilities';
  }

  // Update confirm button state
  const confirmBtn = document.getElementById('confirm-upgrade-btn');
  if (confirmBtn) {
    const canUpgrade = gameState.canUpgrade(cardId);
    confirmBtn.disabled = !canUpgrade;

    // Store cardId on the button for the click handler
    confirmBtn.dataset.cardId = cardId;

    if (!canUpgrade) {
      confirmBtn.title = 'Insufficient resources';
    } else {
      confirmBtn.title = '';
    }
  }
}

/**
 * Handle upgrade confirmation (Phase 3 - T015)
 */
function handleUpgradeConfirm(e) {
  const button = e.target;
  const cardId = button.dataset.cardId;

  if (!cardId) {
    console.error('No card ID found on confirm button');
    return;
  }

  console.log(`⬆️ Confirming upgrade for ${cardId}`);

  // Attempt upgrade
  const success = gameState.upgradeCard(cardId);

  if (success) {
    // Update the card tier display in the DOM
    const cardElement = document.querySelector(`.card[data-card-id="${cardId}"]`);
    if (cardElement) {
      const tierDisplay = cardElement.querySelector('.card-tier');
      const card = gameState.getCard(cardId);
      if (tierDisplay && card) {
        tierDisplay.textContent = `T${card.tier}`;
      }
    }

    // Close modal
    closeUpgradeModal();

    // Show success message
    console.log(`✅ Successfully upgraded ${cardId}`);
  } else {
    // Show error message
    console.error(`❌ Failed to upgrade ${cardId}`);
    alert('Upgrade failed! Check console for details.');
  }
}

/**
 * Initialize modal event listeners
 */
export function initModal() {
  console.log('🪟 Initializing modal system...');

  // Close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeUpgradeModal);
  }

  // Cancel button
  const cancelBtn = document.getElementById('cancel-upgrade-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeUpgradeModal);
  }

  // Confirm button (T015)
  const confirmBtn = document.getElementById('confirm-upgrade-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleUpgradeConfirm);
  }

  // Overlay click to close
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeUpgradeModal);
  }

  // Listen for card:upgraded event to update modal if open
  gameState.on('card:upgraded', (data) => {
    console.log(`🎉 Card ${data.cardId} upgraded to Tier ${data.newTier}`);
  });

  console.log('✓ Modal system initialized');
}

// Expose for global access (needed by card click handlers)
if (typeof window !== 'undefined') {
  window.openUpgradeModal = openUpgradeModal;
  window.closeUpgradeModal = closeUpgradeModal;
}
