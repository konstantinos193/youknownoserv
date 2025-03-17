console.log('%c OdinSmash Extension Loaded ', 'background: #00ffea; color: black; padding: 5px; border-radius: 3px;');

// Add these constants at the top
const TRUSTED_DEVELOPERS = [
  'vv5jb-7sm7u-vn3nq-6nflf-dghis-fd7ji-cx764-xunni-zosog-eqvpw-oae'
];

// Function to check if we're on a token page
function isTokenPage() {
    const isToken = window.location.pathname.includes('/token/');
    console.log('📍 Checking if token page:', isToken, window.location.pathname);
    return isToken;
}

// Function to get token ID from URL
function getTokenId() {
    const match = window.location.pathname.match(/\/token\/([^\/]+)/);
    const tokenId = match ? match[1] : null;
    console.log('🔍 Extracted token ID:', tokenId);
    return tokenId;
}

// Add helper functions
function formatUSDValue(value) {
  if (value === undefined || value === null) return '$0.00';
  
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

function calculateDevRisk(holders, totalSupply, creatorId) {
  if (!holders || holders.length === 0) return { risk: "UNKNOWN", message: "No holder data" };

  const devHolder = holders.find(holder => holder.user === creatorId);
  if (!devHolder) return { risk: "GOOD", message: "Developer not in top holders" };

  const devBalance = Number(devHolder.balance);
  const totalSupplyNum = Number(totalSupply);
  const devPercentage = (devBalance / totalSupplyNum) * 100;

  if (devPercentage >= 50) {
    return { 
      risk: "HIGH", 
      message: `Developer holds ${devPercentage.toFixed(2)}% of supply`
    };
  } else if (devPercentage >= 20) {
    return {
      risk: "WARNING",
      message: `Developer holds ${devPercentage.toFixed(2)}% of supply`
    };
  } else {
    return {
      risk: "GOOD",
      message: `Developer holds ${devPercentage.toFixed(2)}% of supply`
    };
  }
}

// Replace process.env usage with direct values
const API_URL = 'https://odin-smash-server.onrender.com'; // Replace with your actual API URL
const API_KEY = 'VlN{n\Y=5>D**nl)kNh0=:k^Jsr%%"+B|JxmHwV\=Zg09WH4|M'; // Replace with your actual API key if needed

// Update fetchWithCORS function to handle CORS issues more gracefully
async function fetchWithCORS(url) {
    try {
        // First try with CORS and proper headers
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'Origin': 'https://odinsmash.com' // Use the allowed origin
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error('Invalid JSON response');
        }
    } catch (error) {
        console.warn('⚠️ CORS fetch failed, trying no-cors:', error);
        // Fallback to no-cors with a proper error response
        try {
            const noCorsResponse = await fetch(`${API_URL}${url}`, {
                method: 'GET',
                mode: 'no-cors',
                credentials: 'omit'
            });
            
            // Since we can't read the response in no-cors mode, return a default response
            return { 
                status: 'success',
                message: 'Using fallback data due to CORS restrictions',
                token: { id: '2ait' }, // Default token data
                holders: { data: [] } // Empty holders array
            };
        } catch (noCorsError) {
            console.error('⚠️ No-cors fetch failed:', noCorsError);
            return { 
                status: 'error',
                message: 'CORS fetch failed',
                error: noCorsError.message,
                token: { id: '2ait' }, // Default token data
                holders: { data: [] } // Empty holders array
            };
        }
    }
}

// Function to calculate risk level
async function calculateRisk(data) {
    // First check for developer patterns
    if (!TRUSTED_DEVELOPERS.includes(data.token?.creator)) {
        try {
            // Check for multiple tokens by developer
            const creatorTokens = await fetchCreatorTokens(data.token.creator);
            if (creatorTokens && creatorTokens.length > 1) {
                const tradingAnalysis = await analyzeDevTrading(data.token.creator, data.token.id);
                
                return {
                    level: "EXTREME RISK",
                    color: "#dc2626",
                    message: `Developer has created ${creatorTokens.length} tokens`,
                    warning: `Dev sells/buys: ${tradingAnalysis.devSellCount}/${tradingAnalysis.devBuyCount}`,
                    stats: {
                        devTokens: creatorTokens.length,
                        devSells: tradingAnalysis.devSellCount,
                        devBuys: tradingAnalysis.devBuyCount,
                        devPercentage: data.devPercentage || 0,
                        top5Percentage: data.top5Percentage || 0
                    }
                };
            }
        } catch (error) {
            console.error('Error checking creator patterns:', error);
        }
    }

    // Special case for platform token
    if (data.token?.id === '2ait') {
        return {
            level: "LOW RISK",
            color: "#22c55e",
            message: "Platform token with verified distribution"
        };
    }

    const holders = data.holders.data || [];
    const totalSupply = Number(data.token.total_supply);
    const creatorId = data.token.creator;

    // Find developer's holdings
    const devHolder = holders.find(h => h.user === creatorId);
    const devHoldings = devHolder ? Number(devHolder.balance) : 0;
    const devPercentage = (devHoldings / totalSupply) * 100;

    // Check if dev has sold entire position
    if (devHoldings <= 0 || isNaN(devHoldings)) {
        return {
            level: "EXTREME RISK",
            color: "#dc2626",
            message: "Developer has sold their entire position",
            stats: { devPercentage: 0 }
        };
    }

    // Calculate top holder percentages
    const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
    const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance), 0);
    const top5Percentage = (top5Holdings / totalSupply) * 100;

    // Risk level checks matching the web app
    if (devPercentage >= 50 || top5Percentage >= 70) {
        return {
            level: "EXTREME RISK",
            color: "#dc2626",
            message: "Extremely high centralization. High probability of price manipulation.",
            stats: { devPercentage, top5Percentage }
        };
    } else if (devPercentage >= 30 || top5Percentage >= 50) {
        return {
            level: "VERY HIGH RISK",
            color: "#ef4444",
            message: "Very high centralization detected. Major price manipulation risk.",
            stats: { devPercentage, top5Percentage }
        };
    } else if (devPercentage >= 20 || top5Percentage >= 40) {
        return {
            level: "HIGH RISK",
            color: "#f97316",
            message: "High holder concentration. Exercise extreme caution.",
            stats: { devPercentage, top5Percentage }
        };
    } else if (devPercentage >= 10 || top5Percentage >= 30) {
        return {
            level: "MODERATE RISK",
            color: "#eab308",
            message: "Standard market risks apply. Trade carefully.",
            stats: { devPercentage, top5Percentage }
        };
    } else if (devPercentage >= 5 || top5Percentage >= 20) {
        return {
            level: "LOW RISK",
            color: "#22c55e",
            message: "Well distributed token supply",
            stats: { devPercentage, top5Percentage }
        };
    }

    return {
        level: "SAFE",
        color: "#22c55e",
        message: "Very well distributed",
        stats: { devPercentage, top5Percentage }
    };
}

// Function to format number
function formatNumber(num) {
    if (!num) return '0';
    const value = Number(num);
    const formatted = value >= 1000000 ? 
        (value / 1000000).toFixed(2) + 'M' : 
        value >= 1000 ? 
            (value / 1000).toFixed(2) + 'K' : 
            value.toFixed(2);
    console.log('🔢 Formatting number:', num, '→', formatted);
    return formatted;
}

// Helper function to wait for an element to appear
function waitForElement(selector, maxAttempts = 300, interval = 100) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkElement = () => {
            attempts++;
            const element = document.querySelector(selector);
            
            if (element) {
                console.log(`✅ Found element "${selector}" after ${attempts} attempts`);
                resolve(element);
            } else if (attempts >= maxAttempts) {
                reject(new Error(`Element "${selector}" not found after ${maxAttempts} attempts`));
            } else {
                setTimeout(checkElement, interval);
            }
        };
        
        checkElement();
    });
}

async function findInsertionPoint() {
    try {
        // Wait for the main container to be ready
        await waitForElement('.space-x-2.space-y-2');
        
        const element = document.querySelector('.space-x-2.space-y-2');
        if (element) {
            console.log('📍 Found target insertion point');
            return element;
        }
        
        throw new Error('Insertion point not found');
    } catch (error) {
        console.warn('⚠️ Using fallback insertion point:', error);
        return document.querySelector('main') || document.body;
    }
}

// Update loadImageWithFallback function with better error handling
async function loadImageWithFallback(url) {
  try {
    if (!url) {
      console.warn('Empty image URL provided');
      return chrome.runtime.getURL('icons/placeholder.png');
    }

    // First try with CORS
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'image/*',
          'Origin': 'https://odin.fun'
        }
      });
      
      if (!response.ok) throw new Error('CORS fetch failed');
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (corsError) {
      console.warn('⚠️ CORS fetch failed, trying no-cors:', corsError);
      
      // Fallback to no-cors
      const noCorsResponse = await fetch(url, {
        mode: 'no-cors',
        credentials: 'omit'
      });
      
      // Since we can't read the response in no-cors mode, return placeholder
      return chrome.runtime.getURL('icons/placeholder.png');
    }
  } catch (error) {
    console.warn('⚠️ Image load failed, using placeholder image:', error);
    return chrome.runtime.getURL('icons/placeholder.png');
  }
}

// Update the analyzeToken function to handle cleanup better
async function analyzeToken(tokenId) {
    cleanupExistingAnalysis();

    const analysis = document.createElement('div');
    analysis.className = 'odinsmash-analysis';
    analysis.style.cssText = `
        width: 100%;
        background: rgba(20, 21, 26, 0.95);
        border-radius: 12px;
        padding: 24px;
        margin: 16px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    try {
        const data = await fetchWithCORS(`/api/token-data/${tokenId}`);
        const risk = await calculateRisk(data);
        
        // Calculate correct percentages
        const devHolder = data.holders.data.find(h => h.user === data.token.creator);
        const devHoldingPercentage = devHolder ? (devHolder.balance / data.token.total_supply) * 100 : 0;
        
        const top5Sum = data.holders.data
            .slice(0, 5)
            .reduce((sum, holder) => sum + Number(holder.balance), 0);
        const top5Percentage = (top5Sum / data.token.total_supply) * 100;

        // Only fetch creator tokens if needed
        let creatorTokensMessage = '';
        if (!TRUSTED_DEVELOPERS.includes(data.token?.creator)) {
            const creatorTokens = await fetchCreatorTokens(data.token.creator);
            if (creatorTokens && creatorTokens.length > 1) {
                creatorTokensMessage = `Developer has created ${creatorTokens.length} tokens`;
            }
        }

        analysis.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${chrome.runtime.getURL('icons/icon128.png')}" 
                             style="width: 24px; height: 24px; border-radius: 4px;"
                             onerror="this.style.display='none'">
                        <span style="font-size: 14px; font-weight: 600; color: #00ffea;">Smash Analysis</span>
                    </div>
                    <div style="color: ${risk.color}; font-weight: 600; font-size: 14px; padding: 4px 12px; background: ${risk.color}1A; border-radius: 6px;">
                        ${risk.level}
                    </div>
                </div>
                
                ${creatorTokensMessage ? `
                <div style="color: #9ca3af; font-size: 14px; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    ${creatorTokensMessage}
                </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; gap: 16px;">
                    <div style="flex: 1; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Dev Holdings</div>
                        <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${devHoldingPercentage.toFixed(2)}%</div>
                    </div>
                    <div style="flex: 1; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Top 5 Holders</div>
                        <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${top5Percentage.toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        `;

        const insertionPoint = await findInsertionPoint();
        if (insertionPoint) {
            insertionPoint.parentNode.insertBefore(analysis, insertionPoint);
        }

    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

// Add a cleanup function
function cleanupExistingAnalysis() {
    const existingAnalysis = document.querySelector('.odinsmash-analysis');
    if (existingAnalysis) {
        existingAnalysis.remove();
    }
}

// Update initialize function
function initialize() {
    console.log('🚀 Initializing OdinSmash');
    
    // Clean up existing analysis first
    cleanupExistingAnalysis();
    
    // Only add analysis if we're on a token page
    if (isTokenPage()) {
        const tokenId = getTokenId();
        if (tokenId) {
            console.log('🎯 Found token page, starting analysis for token:', tokenId);
            analyzeToken(tokenId);
        }
    }
    
    // Always show indicator
    addIndicator();
}

// Update URL watcher
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('🔄 URL changed, reinitializing...');
        setTimeout(() => {
            cleanupExistingAnalysis();
            initialize();
        }, 500); // Small delay to ensure DOM is ready
    }
}).observe(document, {subtree: true, childList: true});

// Run on load
console.log('📥 Running initial analysis');
initialize();

// Or if you're using the no-cors mode (note: this will give you an opaque response)
function fetchNoCORS(url) {
  return fetch(url, {
    mode: 'no-cors',
    credentials: 'include'
  });
}

// Also update the analysis styling to better match the site's design
function updateAnalysisStyle(analysis) {
    analysis.style.cssText = `
        position: relative;
        width: 100%;
        padding: 16px;
        background: rgba(26, 27, 30, 0.8);
        border-bottom: 1px solid #2d2e32;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        z-index: 100;
    `;
}

// Add these helper functions
async function fetchCreatorTokens(creatorId) {
    try {
        const response = await fetch(`${API_URL}/api/user/${creatorId}/created`, {
            headers: {
                'Accept': 'application/json',
                'x-api-key': API_KEY,
            }
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching creator tokens:', error);
        return [];
    }
}

async function analyzeDevTrading(creatorId, tokenId) {
    try {
        const response = await fetch(`${API_URL}/api/user/${creatorId}/activity?token=${tokenId}`, {
            headers: {
                'Accept': 'application/json',
                'x-api-key': API_KEY,
            }
        });
        
        if (!response.ok) return { hasSoldAndRebought: false };
        
        const data = await response.json();
        const transactions = data.data || [];
        
        let devSellCount = 0;
        let devBuyCount = 0;
        
        transactions.forEach(tx => {
            if (tx.action === 'SELL') devSellCount++;
            if (tx.action === 'BUY') devBuyCount++;
        });

        return {
            hasSoldAndRebought: devSellCount >= 3 && devBuyCount > 0,
            devSellCount,
            devBuyCount
        };
    } catch (error) {
        console.error('Error analyzing dev trading:', error);
        return { hasSoldAndRebought: false };
    }
}

// Function to add indicator
function addIndicator() {
    console.log('🏷️ Adding OdinSmash indicator');
    const existing = document.getElementById('odinsmash-indicator');
    if (existing) existing.remove();

    // Wait for the Bitcoin balance container
    setTimeout(() => {
        waitForElement('div[class*="fixed left-0 right-0 top-0 z-10"]', 300, 100)
            .then(headerRightSection => {
                console.log('Found header right section:', headerRightSection);
                
                const indicator = document.createElement('div');
                indicator.id = 'odinsmash-indicator';
                indicator.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 36px;
                    padding: 0 12px;
                    margin-right: 8px;
                    font-weight: 600;
                    background: #00ffea;
                    color: #000000;
                    border-radius: 6px;
                    font-size: 12px;
                    transition: background 0.2s;
                    font-family: ui-monospace, monospace;
                    cursor: pointer;
                    z-index: 1000;
                `;
                
                // Add hover effect
                indicator.onmouseover = () => {
                    indicator.style.background = '#00e6d2';
                };
                indicator.onmouseout = () => {
                    indicator.style.background = '#00ffea';
                };
                
                // Content with icon
                indicator.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>ODINSMASH</span>
                `;

                // Insert as first child of the right section
                headerRightSection.insertBefore(indicator, headerRightSection.firstChild);
                console.log('✅ Indicator added successfully');
            })
            .catch(error => {
                console.warn('⚠️ Could not find header right section:', error);
            });
    }, 2000); // Increased wait time to 2 seconds
}