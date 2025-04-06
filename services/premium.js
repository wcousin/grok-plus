const API_BASE_URL = 'http://localhost:3000';

class PremiumService {
  static async init() {
    const installationId = await this.getInstallationId();
    const status = await this.checkPremiumStatus(installationId);
    return status;
  }

  static async getInstallationId() {
    const { installationId } = await chrome.storage.local.get('installationId');
    if (installationId) return installationId;

    const newId = crypto.randomUUID();
    await chrome.storage.local.set({ installationId: newId });
    return newId;
  }

  static async checkPremiumStatus(installationId) {
    const { licenseKey } = await chrome.storage.local.get('licenseKey');
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installationId, licenseKey })
      });

      const data = await response.json();
      return data.status === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  static async initiateUpgrade() {
    const installationId = await this.getInstallationId();
    
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installationId })
      });

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error initiating upgrade:', error);
      throw error;
    }
  }

  static enforceFreemiumLimits = {
    async checkPromptLimit() {
      const isPremium = await this.checkPremiumStatus();
      if (isPremium) return true;

      const { prompts = [] } = await chrome.storage.local.get('prompts');
      return prompts.length < 5;
    },

    async checkCategoryLimit() {
      const isPremium = await this.checkPremiumStatus();
      if (isPremium) return true;

      const { categories = [] } = await chrome.storage.local.get('categories');
      return categories.length < 2; // 1 default category + 1 custom
    },

    async canUseFavorites() {
      return this.checkPremiumStatus();
    },

    async canViewHistory() {
      return this.checkPremiumStatus();
    },

    async canCopyPrompt() {
      return this.checkPremiumStatus();
    }
  }
}

export default PremiumService;
