// Background script to handle upgrade process
const API_BASE_URL = 'https://db5f-64-191-7-8.ngrok-free.app';

// Check premium status periodically
chrome.alarms.create('checkPremiumStatus', {
  periodInMinutes: 60 // Check every hour
});

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPremiumStatus') {
    verifyPremiumStatus();
  }
});

// Listen for tab updates to detect successful payment
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('/success?session_id=')) {
    console.log('[Debug] Payment success detected, retrieving license...');
    const urlParams = new URLSearchParams(new URL(tab.url).search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      await retrieveLicenseKey(sessionId);
    }
  }
});

// Retrieve license key after successful payment
async function retrieveLicenseKey(sessionId) {
  try {
    console.log('[Debug] Retrieving license key for session:', sessionId);
    const response = await fetch(`${API_BASE_URL}/get-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    const data = await response.json();
    console.log('[Debug] License key response:', data);

    if (data.licenseKey) {
      await chrome.storage.local.set({ licenseKey: data.licenseKey });
      console.log('[Debug] License key stored, verifying status...');
      await verifyPremiumStatus();
    }
  } catch (error) {
    console.error('Error retrieving license key:', error);
  }
}

// Verify premium status
async function verifyPremiumStatus() {
  try {
    const { licenseKey } = await chrome.storage.local.get('licenseKey');
    console.log('[Debug] Checking license key:', licenseKey);

    if (!licenseKey) {
      console.log('[Debug] No license key found');
      await updatePremiumStatus(false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });

    const data = await response.json();
    console.log('[Debug] License verification response:', data);

    if (data.status === 'premium') {
      console.log('[Debug] Valid premium license found');
      await updatePremiumStatus(true);
    } else {
      console.log('[Debug] Invalid or expired license');
      await updatePremiumStatus(false);
    }
  } catch (error) {
    console.error('Error verifying premium status:', error);
    await updatePremiumStatus(false);
  }
}

// Update premium status in storage and notify content script
async function updatePremiumStatus(isPremium) {
  console.log('[Debug] Updating premium status to:', isPremium);
  
  await chrome.storage.local.set({ isPremium });

  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        type: 'PREMIUM_STATUS_UPDATED',
        isPremium
      });
      console.log('[Debug] Notified tab:', tab.id);
    } catch (error) {
      // Ignore errors for inactive tabs
      console.log('[Debug] Could not notify tab:', tab.id);
    }
  }
}

// Initial check on extension load
verifyPremiumStatus();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_PREMIUM_STATUS') {
    verifyPremiumStatus();
    sendResponse({ received: true });
  }
  return true; // Keep the message channel open for async response
});
