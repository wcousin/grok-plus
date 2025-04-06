import PremiumService from '../services/premium.js';

export function showUpgradeModal(message) {
  const modal = document.createElement('div');
  modal.className = 'gp-upgrade-modal';
  modal.innerHTML = `
    <div class="gp-modal-content">
      <div class="gp-modal-header">
        <h2>Upgrade to Premium</h2>
        <button class="gp-close-button">×</button>
      </div>
      <div class="gp-modal-body">
        <p class="gp-upgrade-message">${message}</p>
        <div class="gp-pricing-table">
          <div class="gp-plan gp-free">
            <h3>Free Plan</h3>
            <ul>
              <li>5 Stored Prompts</li>
              <li>1 Custom Category</li>
              <li>Basic Features</li>
            </ul>
            <p class="gp-price">$0</p>
            <button class="gp-button" disabled>Current Plan</button>
          </div>
          <div class="gp-plan gp-premium">
            <h3>Premium Plan</h3>
            <ul>
              <li>Unlimited Prompts</li>
              <li>Unlimited Categories</li>
              <li>Favorites Feature</li>
              <li>Copy Button</li>
              <li>Prompt History</li>
            </ul>
            <p class="gp-price">$4.99/month</p>
            <button class="gp-button gp-upgrade-button">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeButton = modal.querySelector('.gp-close-button');
  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  const upgradeButton = modal.querySelector('.gp-upgrade-button');
  upgradeButton.addEventListener('click', async () => {
    try {
      await PremiumService.initiateUpgrade();
      modal.remove();
    } catch (error) {
      console.error('Error initiating upgrade:', error);
      // Show error message to user
      const messageEl = modal.querySelector('.gp-upgrade-message');
      messageEl.textContent = 'An error occurred. Please try again later.';
      messageEl.style.color = 'red';
    }
  });
}
