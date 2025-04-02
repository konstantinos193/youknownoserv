'use client';

import Link from "next/link"
import { Button } from "/components/ui/button"
import { Input } from "/components/ui/input"
import { Search, ArrowUpDown, Filter, Globe, Send } from "lucide-react"
import { useState, useEffect, useCallback } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateRiskLevel } from '@/utils/calculateRiskLevel';
import { fetchCreatorTokens } from '@/utils/fetchCreatorTokens'; // Import the function

interface Token {
  id: string;
  name: string;
  ticker: string;
  price: number;
  marketcap: number;
  volume: number;
  holder_count: number;
  created_time: string;
  creator: string;
  total_supply: string;
  btc_liquidity: number;
  token_liquidity: number;
  creator_balance?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

interface RiskAssessment {
  level: string;
  color: string;
  message: string;
  warning: string;
}

const TRUSTED_DEVELOPERS = [
  'vv5jb-7sm7u-vn3nq-6nflf-dghis-fd7ji-cx764-xunni-zosog-eqvpw-oae'
];

// Update the API_BASE_URL to point to your local server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Add API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Add this near the top of the file
const REQUEST_THROTTLE_DELAY = 1000; // 1 second between batches
const BATCH_SIZE = 5; // Number of requests per batch

// Create a request queue and processing system
let requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;
  console.log("Processing request queue...");

  while (requestQueue.length > 0) {
    const batch = requestQueue.splice(0, BATCH_SIZE);
    console.log(`Processing batch of ${batch.length} requests...`);
    await Promise.all(batch.map(fn => fn()));
    if (requestQueue.length > 0) {
      console.log("Waiting before processing next batch...");
      await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE_DELAY));
    }
  }

  isProcessingQueue = false;
  console.log("Finished processing request queue.");
};

// Update fetchWithRetry to handle 404s more gracefully
const fetchWithRetry = async (url: string) => {
  return new Promise<any>((resolve) => {
    const executeFetch = async () => {
      const maxRetries = 3;
      const backoffDelay = 1000;
      const cacheKey = `api_cache_${url}`;
      const cacheDuration = 5 * 60 * 1000; // 5 minutes

      // Ensure the URL starts with /api/ for user activity requests
      const fullUrl = url.startsWith('/user/') 
        ? `${API_BASE_URL}/api${url}`
        : url.startsWith('/') 
          ? `${API_BASE_URL}${url}`
          : url;

      // Check cache first
      try {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheDuration) {
              return resolve(data);
            }
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const headers: HeadersInit = {
            'Accept': 'application/json',
            'x-api-key': API_KEY || '' // Ensure API key is never undefined
          };

          const response = await fetch(fullUrl, {
            headers,
            cache: 'no-store'
          });

          // Handle various status codes
          if (response.status === 404) {
            console.warn(`Resource not found at ${fullUrl}`);
            return resolve(null);
          }

          if (response.status === 429 || response.status === 403) {
            if (attempt < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
              continue;
            }
            return resolve(null);
          }

          if (!response.ok) {
            console.error(`API error: ${response.status} for ${fullUrl}`);
            return resolve(null);
          }

          const data = await response.json();
          
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(cacheKey, JSON.stringify({
                data: data.data,
                timestamp: Date.now()
              }));
            }
          } catch (error) {
            console.warn('Cache write error:', error);
          }

          // Log successful fetch
          console.log(`Successfully fetched data from ${fullUrl}`);
          return resolve(data.data);
        } catch (error) {
          console.error(`Attempt ${attempt + 1}/${maxRetries} failed for ${url}:`, error);
          if (attempt === maxRetries - 1) {
            return resolve(null);
          }
          await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
        }
      }
    };

    requestQueue.push(executeFetch);
    console.log(`Added request to queue for URL: ${url}`); // Log when a request is added
    processQueue(); // Ensure the queue is processed immediately
  });
};

// Update the processHolderData function
const processHolderData = async (holders: any[], token: Token): Promise<RiskAssessment> => {
  // Check for zero holders first
  if (!token.holder_count || token.holder_count === 0) {
    return {
      level: "RUGGED",
      color: "text-red-600",
      message: "Token appears to be abandoned",
      warning: "No holders found - Token likely rugged"
    };
  }

  // If no holders data but holder_count > 0, show pending
  if (!holders || holders.length === 0) {
    return {
      level: "PENDING",
      color: "text-yellow-500",
      message: "Loading holder data",
      warning: "Please wait while we analyze the token"
    };
  }

  // Find developer's holdings
  const devHolder = holders.find(h => h.user === token.creator);
  const devHoldings = devHolder ? Number(devHolder.balance) / 1e11 : 0;
  const totalSupplyNum = Number(token.total_supply) / 1e11;
  const devPercentage = (devHoldings / totalSupplyNum) * 100;

  // Sort holders by balance for top holder calculations
  const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
  const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance) / 1e11, 0);
  const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, h) => sum + Number(h.balance) / 1e11, 0);
  
  const top5Percentage = (top5Holdings / totalSupplyNum) * 100;
  const top10Percentage = (top10Holdings / totalSupplyNum) * 100;

  // Build concise warning message
  const holderStats = [
    `Dev: ${devPercentage.toFixed(2)}%`,
    `Top 5: ${top5Percentage.toFixed(2)}%`,
    `Top 10: ${top10Percentage.toFixed(2)}%`
  ].join(' | ');

  let warnings = [];
  let isExtremeRisk = false;

  // Check if dev has sold position
  if (devHoldings <= 0 || isNaN(devHoldings)) {
    warnings.push("Developer has sold their entire position");
    isExtremeRisk = true;
  }

  // Check for multiple tokens by developer and their selling patterns
  if (!TRUSTED_DEVELOPERS.includes(token.creator)) {
    try {
      const creatorTokens = await fetchCreatorTokens(token.creator);
      if (creatorTokens && creatorTokens.length > 1) {
        // Check selling patterns for all tokens
        let soldTokensCount = 0;
        const last24Hours = Date.now() - (24 * 60 * 60 * 1000);

        for (const creatorToken of creatorTokens) {
          const tradingAnalysis = await analyzeDevTrading(token.creator, creatorToken.id);
          if (tradingAnalysis.hasSoldAndRebought && 
              new Date(creatorToken.last_sell_time).getTime() > last24Hours) {
            soldTokensCount++;
          }
        }

        warnings.push(`Developer has created ${creatorTokens.length} tokens`);
        
        if (soldTokensCount > 1) {
          warnings.push(`Developer has sold multiple tokens within 24h`);
        }
        
        isExtremeRisk = true;
      }
    } catch (error) {
      console.error('Error checking creator tokens:', error);
    }
  }

  // If either extreme risk condition is met, show combined warnings
  if (isExtremeRisk) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Multiple high-risk factors detected - Extreme risk of abandonment",
      warning: `DANGER: ${warnings.join(" & ")}`
    };
  }

  // Regular risk level checks
  if (devPercentage >= 50 || top5Percentage >= 70) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Extremely high centralization. High probability of price manipulation.",
      warning: holderStats
    };
  } else if (devPercentage >= 30 || top5Percentage >= 50) {
    return {
      level: "VERY HIGH RISK",
      color: "text-red-500",
      message: "Very high centralization detected. Major price manipulation risk.",
      warning: holderStats
    };
  } else if (devPercentage >= 20 || top5Percentage >= 40) {
    return {
      level: "HIGH RISK",
      color: "text-orange-500",
      message: "High holder concentration. Exercise extreme caution.",
      warning: holderStats
    };
  } else if (devPercentage >= 10 || top5Percentage >= 30) {
    return {
      level: "MODERATE RISK",
      color: "text-yellow-500",
      message: "Standard market risks apply. Trade carefully.",
      warning: holderStats
    };
  } else if (devPercentage >= 5 || top5Percentage >= 20) {
    return {
      level: "LOW RISK",
      color: "text-green-400",
      message: "Well distributed token supply",
      warning: holderStats
    };
  }

  return {
    level: "SAFE",
    color: "text-green-500",
    message: "Very well distributed",
    warning: holderStats
  };
}

const API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://odin.fun/',
  'Origin': 'https://odin.fun',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add this helper function for localStorage
const CACHE_KEY = 'cached_tokens';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedTokens = () => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  return data;
};

const setCachedTokens = (tokens: Token[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: tokens,
    timestamp: Date.now()
  }));
};

// Add these helper functions at the top of the file
const HOLDER_CACHE_KEY = (tokenId: string) => `holder_cache_${tokenId}`;
const HOLDER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedHolders = (tokenId: string) => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(HOLDER_CACHE_KEY(tokenId));
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > HOLDER_CACHE_DURATION) {
    localStorage.removeItem(HOLDER_CACHE_KEY(tokenId));
    return null;
  }
  return data;
};

const setCachedHolders = (tokenId: string, holders: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HOLDER_CACHE_KEY(tokenId), JSON.stringify({
    data: holders,
    timestamp: Date.now()
  }));
};

// Update getTokens function to use batched endpoint
async function getTokens(): Promise<Token[]> {
  const maxRetries = 3;
  const backoffDelay = 1000;

  // Try to get cached data first
  const cachedData = getCachedTokens();
  if (cachedData) {
    return cachedData;
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'x-api-key': API_KEY
      };

      const response = await fetch(
        `${API_BASE_URL}/tokens?sort=created_time:desc&page=1&limit=20`,
        {
          headers,
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      
      const data = await response.json();
      const tokens = data.data || [];
      
      // Cache successful response
      if (tokens.length > 0) {
        setCachedTokens(tokens);
      }
      
      return tokens;

    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries - 1) {
        const cachedTokens = getCachedTokens();
        if (cachedTokens) {
          console.log('Using cached tokens due to API failure');
          return cachedTokens;
        }
        return [];
      }

      await sleep(backoffDelay * Math.pow(2, attempt));
    }
  }

  return [];
}

// Update the fetchTokenHolders function
const fetchTokenHolders = async (tokenIds: string | string[], creatorId: string) => {
  try {
    const ids = Array.isArray(tokenIds) ? tokenIds : [tokenIds];
    
    // First check cache
    const cachedHolders = ids.map(id => getCachedHolders(id)).filter(Boolean);
    if (cachedHolders.length === ids.length) {
      return cachedHolders.reduce((acc, holders, index) => {
        acc[ids[index]] = { holders };
        return acc;
      }, {} as Record<string, { holders: any[] }>);
    }

    // Log before sending batch request
    console.log(`Fetching holders for tokens: ${JSON.stringify(ids)}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/batch-holders?tokenIds=${JSON.stringify(ids)}`,
      {
        headers: {
          'x-api-key': API_KEY || '',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch holders for tokens: ${JSON.stringify(ids)}`);
      return ids.reduce((acc, id) => {
        acc[id] = { holders: [] };
        return acc;
      }, {} as Record<string, { holders: any[] }>);
    }

    const holdersMap = await response.json();
    
    // Ensure each token has at least an empty array
    ids.forEach(id => {
      if (!holdersMap[id]) {
        holdersMap[id] = { holders: [] };
      }
    });
    
    // Process each token's holders
    Object.entries(holdersMap).forEach(([tokenId, data]) => {
      const holdersArray = data?.holders || [];
      
      // Normalize creatorId and holder addresses for comparison
      const normalizedCreatorId = creatorId.toLowerCase().trim();
      
      // Find the creator's holdings with normalized comparison
      const creatorHoldings = holdersArray.find(h => 
        h.user?.toLowerCase().trim() === normalizedCreatorId
      );
      
      const devHoldings = creatorHoldings?.balance || 0;
      
      holdersMap[tokenId] = {
        holders: holdersArray,
        devHoldings: Number(devHoldings)
      };
      
      setCachedHolders(tokenId, holdersArray);
    });
    
    return holdersMap;
  } catch (error) {
    console.error('Error fetching holders:', error);
    return Array.isArray(tokenIds) ? 
      tokenIds.reduce((acc, id) => {
        acc[id] = { holders: [] };
        return acc;
      }, {} as Record<string, { holders: any[] }>) :
      { [tokenIds]: { holders: [] } };
  }
};

// First, define the cache key constant
const USER_CREATED_CACHE_KEY = 'user_created_tokens';

// Update the fetchCreatorTokens function
async function fetchCreatorTokens(creatorId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${creatorId}/created`, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY || '', // Add the API key from env
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch tokens for creator ${creatorId}: ${response.status}`);
      return [];
    }
    const responseData = await response.json();
    return responseData.data || []; // Return the data array or empty array if not found
  } catch (error) {
    console.error('Error fetching creator tokens:', error);
    return []; // Return empty array instead of throwing
  }
}

// Update the fetchBatchTokenData function
const fetchBatchTokenData = async (tokenIds: string[]): Promise<Token[]> => {
  try {
    if (!tokenIds || tokenIds.length === 0) return [];

    const response = await fetch(
      `${API_BASE_URL}/batch-tokens?tokenIds=${JSON.stringify(tokenIds)}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {})
        }
      }
    );

    if (!response.ok) {
      // If the batch endpoint fails, fall back to individual requests
      console.warn('Batch API failed, falling back to individual requests');
      const individualPromises = tokenIds.map(tokenId => 
        fetchWithRetry(`/token/${tokenId}`)
      );
      const results = await Promise.all(individualPromises);
      return results.filter(token => token !== null);
    }

    const data = await response.json();
    return data.filter(token => token !== null);
  } catch (error) {
    console.error('Batch token fetch error:', error);
    return [];
  }
};

// Update the fetchBatchCreatorTokens function to use the correct endpoint
const fetchBatchCreatorTokens = async (creatorIds: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/batch-creators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Batch creator tokens fetch error:', error);
    throw error;
  }
};

const analyzeDevTrading = async (creatorId: string, tokenId: string) => {
  const url = `/user/${creatorId}/activity?page=1&limit=100&sort=time%3Adesc`;
  const data = await fetchWithRetry(url);
  
  if (!data) {
    return {
      hasSoldAndRebought: false,
      devSellCount: 0,
      devBuyCount: 0,
      totalSoldByDev: 0,
      percentageSold: 0,
      initialBalance: 0
    };
  }

  try {
    // Filter transactions for the specific token
    const transactions = data.filter(tx => tx.token.id === tokenId);
    
    let devSellCount = 0;
    let devBuyCount = 0;
    let totalSoldAmount = 0;
    let initialBalance = 0;

    // Get initial balance from first transaction (oldest)
    const firstTx = transactions[transactions.length - 1];
    if (firstTx) {
      initialBalance = Number(firstTx.amount_token);
    }

    // Analyze transactions
    transactions.forEach(tx => {
      if (tx.action === 'SELL') {
        devSellCount++;
        totalSoldAmount += Number(tx.amount_token);
      }
      if (tx.action === 'BUY') {
        devBuyCount++;
      }
    });

    const percentageSold = initialBalance > 0 
      ? (totalSoldAmount / initialBalance) * 100 
      : 0;

    // Flag as dump and rebuy if significant selling occurred
    const hasDumpAndRebuy = devSellCount >= 3 && 
                           devBuyCount > 0 && 
                           percentageSold >= 20;

    return {
      hasSoldAndRebought: hasDumpAndRebuy,
      devSellCount,
      devBuyCount,
      totalSoldByDev: totalSoldAmount,
      percentageSold,
      initialBalance
    };
  } catch (error) {
    console.error('Error analyzing dev trading:', error);
    return {
      hasSoldAndRebought: false,
      devSellCount: 0,
      devBuyCount: 0,
      totalSoldByDev: 0,
      percentageSold: 0,
      initialBalance: 0
    };
  }
};

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'holders_high' | 'holders_low' | 'risk_high' | 'risk_low';
type RiskFilter = 'all' | 'low' | 'guarded' | 'elevated' | 'moderate' | 'high' | 'very_high' | 'extreme';

// First, add the formatPrice function at the top of the file
const formatPrice = (price: number): string => {
  // Convert the API price format to actual USD value
  const actualPrice = price / 1000000;  // Divide by 1M to get the actual USD value
  
  if (actualPrice >= 1000000) {
    return `$${(actualPrice / 1000000).toFixed(2)}M`;
  } else if (actualPrice >= 1000) {
    return `$${(actualPrice / 1000).toFixed(2)}K`;
  } else if (actualPrice >= 1) {
    return `$${actualPrice.toFixed(2)}`;
  } else if (actualPrice >= 0.01) {
    return `$${actualPrice.toFixed(2)}`;
  } else if (actualPrice >= 0.0001) {
    return `$${actualPrice.toFixed(4)}`;
  } else {
    return `$${actualPrice.toFixed(6)}`;
  }
};

// First, add this loading skeleton component near the top of the file
const TokenListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 sm:p-4 bg-blue-900 hover:bg-blue-800 rounded-lg border border-blue-800 animate-pulse">
          <div className="flex items-center gap-3">
            {/* Token image skeleton */}
            <div className="w-12 h-12 rounded-lg bg-blue-800" />
            
            <div className="flex-1">
              {/* Name and risk level skeleton */}
              <div className="flex items-center flex-wrap gap-2">
                <div className="h-5 w-32 bg-blue-800 rounded" />
                <div className="h-4 w-20 bg-blue-800 rounded" />
              </div>
              {/* Stats skeleton */}
              <div className="mt-1 h-3 w-48 bg-blue-800 rounded" />
            </div>
            
            {/* Price and holders skeleton */}
            <div className="text-right">
              <div className="h-5 w-20 bg-blue-800 rounded mb-1" />
              <div className="h-3 w-16 bg-blue-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add this cleanup function
const cleanupRequestQueue = () => {
  requestQueue = [];
  isProcessingQueue = false;
};

// Update the TokenCard component
const TokenCard = ({ token }: { token: Token }) => {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [holders, setHolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch holders data
        const holdersData = await fetchTokenHolders(token.id, token.creator);
        // Extract holders array from the response structure
        const holdersArray = holdersData[token.id]?.holders || [];
        setHolders(holdersArray);

        // Process risk assessment with the correct holder data
        const riskAssessment = await processHolderData(holdersArray, token);
        setRisk(riskAssessment);
      } catch (error) {
        console.error('Error loading token data:', error);
        setRisk({
          level: "ERROR",
          color: "text-red-600",
          message: "Error loading data",
          warning: "Error calculating risk level"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-3 sm:p-4 bg-blue-900 hover:bg-blue-800 rounded-lg border border-blue-800 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-800" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-blue-800 rounded mb-2" />
            <div className="h-4 w-48 bg-blue-800 rounded" />
          </div>
          <div className="text-right">
            <div className="h-5 w-20 bg-blue-800 rounded mb-1" />
            <div className="h-4 w-16 bg-blue-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block p-3 sm:p-4 bg-blue-900 hover:bg-blue-800 rounded-lg border border-blue-800">
      <div className="flex items-center gap-3">
        <Link
          key={token.id}
          href={`/results?search=${token.id}`}
          className="flex-1 flex items-center gap-3"
        >
          <img 
            src={`https://images.odin.fun/token/${token.id}`}
            alt={token.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-medium">
                {token.name} ({token.ticker})
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded ${risk?.color}`}>
                {risk?.level}
              </span>
            </div>
            <p className="text-xs text-blue-300 mt-1">
              {risk?.warning}
            </p>
          </div>
        </Link>
        
        <div className="text-right">
          <p className="font-medium">
            {formatPrice(token.price || 0)}
          </p>
          <p className="text-xs text-blue-300">
            {token.holder_count} holders
          </p>
          <div className="flex items-center gap-2 justify-end mt-1">
            {token.website && (
              <a
                href={token.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-200"
              >
                <Globe className="h-3 w-3" />
              </a>
            )}
            {token.twitter && (
              <a
                href={token.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-200"
              >
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 1200 1227" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-colors hover:text-blue-200"
                >
                  <path 
                    d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
                    fill="currentColor"
                  />
                </svg>
              </a>
            )}
            {token.telegram && (
              <a
                href={token.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-200"
              >
                <Send className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const fetchCreatorBalance = async (creatorId: string) => {
  try {
    const response = await fetchWithRetry(`/user/${creatorId}/balance`);
    return response?.balance || 0;
  } catch (error) {
    console.error('Error fetching creator balance:', error);
    return 0;
  }
};

// Remove the standalone filterAndSortTokens function
export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  // Move filterAndSortTokens inside the component
  const filterAndSortTokens = useCallback(async (tokensToFilter: Token[]) => {
    let result = [...tokensToFilter];

    // Apply search filter first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.ticker.toLowerCase().includes(query) ||
        token.id.toLowerCase().includes(query)
      );
    }

    // Get holders data and creator tokens data for all tokens
    const tokenIds = result.map(t => t.id);
    const holdersMap = await fetchTokenHolders(tokenIds, result[0]?.creator || '');
    
    // Create a map to store creator tokens count
    const creatorTokensMap = new Map();
    
    // Fetch creator tokens data for all unique creators
    const uniqueCreators = [...new Set(result.map(t => t.creator))];
    await Promise.all(uniqueCreators.map(async (creator) => {
      if (!TRUSTED_DEVELOPERS.includes(creator)) {
        const tokens = await fetchCreatorTokens(creator);
        creatorTokensMap.set(creator, tokens.length);
      }
    }));

    // Helper function to determine risk level
    const getRiskLevel = (token: Token): string => {
      // Check for multiple creator tokens first
      if (!TRUSTED_DEVELOPERS.includes(token.creator) && creatorTokensMap.get(token.creator) > 1) {
        return 'extreme';
      }

      // Check for zero holders
      if (token.holder_count === 0) {
        return 'extreme';
      }

      const holders = holdersMap[token.id]?.holders || [];
      
      // Check if dev has sold entire position
      const devHolder = holders.find(h => h.user === token.creator);
      if (!devHolder || Number(devHolder.balance) <= 0) {
        return 'extreme';
      }

      const devHoldings = Number(devHolder.balance);
      const totalSupplyNum = Number(token.total_supply);
      const devPercentage = (devHoldings / totalSupplyNum) * 100;

      const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
      const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance), 0);
      const top5Percentage = (top5Holdings / totalSupplyNum) * 100;

      // Strict risk level checks from lowest to highest
      if (devPercentage < 2 && top5Percentage < 10) {
        return 'low';
      } else if (devPercentage < 5 && top5Percentage < 20) {
        return 'guarded';
      } else if (devPercentage < 10 && top5Percentage < 30) {
        return 'elevated';
      } else if (devPercentage < 20 && top5Percentage < 40) {
        return 'moderate';
      } else if (devPercentage < 30 && top5Percentage < 50) {
        return 'high';
      } else if (devPercentage < 50 && top5Percentage < 70) {
        return 'very_high';
      }
      return 'extreme';
    };

    // Filter based on risk level if not 'all'
    if (riskFilter !== 'all') {
      result = result.filter(token => {
        const tokenRiskLevel = getRiskLevel(token);
        return tokenRiskLevel === riskFilter;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const riskLevels = {
        'low': 0,
        'guarded': 1,
        'elevated': 2,
        'moderate': 3,
        'high': 4,
        'very_high': 5,
        'extreme': 6
      };

      const riskA = getRiskLevel(a);
      const riskB = getRiskLevel(b);

      // Sort by risk level first
      if (riskA !== riskB) {
        return riskLevels[riskA] - riskLevels[riskB];
      }

      // Then apply the selected sort criteria
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'holders_high':
          return (b.holder_count || 0) - (a.holder_count || 0);
        case 'holders_low':
          return (a.holder_count || 0) - (b.holder_count || 0);
        case 'newest':
        default:
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      }
    });

    return result;
  }, [searchQuery, sortBy, riskFilter]);

  useEffect(() => {
    let isMounted = true;

    const loadTokens = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to show cached data immediately
        const cachedData = getCachedTokens();
        if (cachedData) {
          setTokens(cachedData);
          setLoading(false);
        }

        // Then fetch fresh data
        const freshTokens = await getTokens();
        if (freshTokens.length > 0 && isMounted) {
          setTokens(freshTokens);
          
          // Prefetch holders for ALL tokens in a single batch
          const tokenIds = freshTokens.map(t => t.id);
          await fetchTokenHolders(tokenIds, freshTokens[0].creator);
        } else if (!cachedData && isMounted) {
          setError('Unable to fetch tokens. Please try again later.');
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
        if (!tokens.length && isMounted) {
          setError('Failed to load tokens. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTokens();

    const interval = setInterval(loadTokens, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      cleanupRequestQueue();
    };
  }, []);

  // Update filtering effect
  useEffect(() => {
    let isMounted = true;

    const filterTokens = async () => {
      try {
        setLoading(true);
        const filtered = await filterAndSortTokens(tokens);
        if (isMounted) {
          setFilteredTokens(filtered);
        }
      } catch (error) {
        console.error('Error filtering tokens:', error);
        if (isMounted) {
          setFilteredTokens(tokens); // Fallback to unfiltered tokens
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    filterTokens();

    return () => {
      isMounted = false;
    };
  }, [tokens, filterAndSortTokens]);

  return (
    <div className="min-h-screen w-full bg-blue-950">
      <div className="container px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold">Recent Tokens</h1>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/">
                  Analyze Token
                </Link>
              </Button>

              {/* Risk Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none border-blue-800 text-blue-300">
                    <Filter className="h-4 w-4" />
                    {riskFilter === 'all' ? 'All Risks' : `${riskFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Risk`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-blue-900 border border-blue-800">
                  <DropdownMenuItem onClick={() => setRiskFilter('all')} className="hover:bg-blue-800 focus:bg-blue-800">All Risks</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('low')} className="hover:bg-blue-800 focus:bg-blue-800">Low Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('guarded')} className="hover:bg-blue-800 focus:bg-blue-800">Guarded Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('elevated')} className="hover:bg-blue-800 focus:bg-blue-800">Elevated Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('moderate')} className="hover:bg-blue-800 focus:bg-blue-800">Moderate Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('high')} className="hover:bg-blue-800 focus:bg-blue-800">High Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('very_high')} className="hover:bg-blue-800 focus:bg-blue-800">Very High Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRiskFilter('extreme')} className="hover:bg-blue-800 focus:bg-blue-800">Extreme Risk</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none border-blue-800 text-blue-300">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-blue-900 border border-blue-800">
                  <DropdownMenuItem onClick={() => setSortBy('newest')} className="hover:bg-blue-800 focus:bg-blue-800">Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')} className="hover:bg-blue-800 focus:bg-blue-800">Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_high')} className="hover:bg-blue-800 focus:bg-blue-800">Highest Price</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_low')} className="hover:bg-blue-800 focus:bg-blue-800">Lowest Price</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('holders_high')} className="hover:bg-blue-800 focus:bg-blue-800">Most Holders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('holders_low')} className="hover:bg-blue-800 focus:bg-blue-800">Least Holders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('risk_high')} className="hover:bg-blue-800 focus:bg-blue-800">Highest Risk</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('risk_low')} className="hover:bg-blue-800 focus:bg-blue-800">Lowest Risk</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search tokens..."
              className="flex-1 bg-black border-blue-600 focus:border-blue-400 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Token list */}
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <TokenListSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <TokenCard key={token.id} token={token} />
              ))
            ) : (
              <div className="text-center py-8">No tokens found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}