console.log('Background script loaded');

// Track which tabs have content scripts ready
const readyTabs = new Set();

// Handle content script ready messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTENT_SCRIPT_READY') {
    console.log('Content script ready in tab:', sender.tab.id);
    readyTabs.add(sender.tab.id);
    sendResponse({ status: 'acknowledged' });
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only proceed if the tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url?.includes('odin.fun')) {
    console.log('Odin.fun page loaded');

    // Wait for content script to be ready
    let retries = 0;
    const maxRetries = 5;
    
    const tryConnect = async () => {
      try {
        if (readyTabs.has(tabId)) {
          await chrome.tabs.sendMessage(tabId, { 
            type: 'PAGE_LOAD',
            url: tab.url
          });
          console.log('Message sent successfully');
        } else if (retries < maxRetries) {
          retries++;
          console.log(`Waiting for content script... (attempt ${retries})`);
          setTimeout(tryConnect, 1000);
        } else {
          console.log('Max retries reached, content script not responding');
        }
      } catch (err) {
        console.log('Connection error:', err);
        if (retries < maxRetries) {
          retries++;
          setTimeout(tryConnect, 1000);
        }
      }
    };

    tryConnect();
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  readyTabs.delete(tabId);
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'analyzeToken') {
    // Handle token analysis request
    fetch(`https://odinsmash.com/api/token-analysis/${request.tokenId}`)
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
  if (request.type === 'fetchImage') {
    fetch(request.url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => sendResponse({ data: reader.result });
        reader.readAsDataURL(blob);
      })
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});