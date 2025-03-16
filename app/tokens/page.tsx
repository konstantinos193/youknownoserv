'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Filter } from "lucide-react"
import { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const API_BASE_URL = 'https://api.odin.fun/v1';

// Centralized fetch utility
const fetchWithRetry = async (url: string) => {
  const maxRetries = 3;
  const backoffDelay = 1000;
  const cacheKey = `api_cache_${url}`;
  const cacheDuration = 5 * 60 * 1000; // 5 minutes

  // Check cache first
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheDuration) {
          return data;
        }
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }

  // API call with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const randomUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
        Math.floor(Math.random() * 20 + 100)
      }.0.0.0 Safari/537.36`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': randomUserAgent
        },
        cache: 'no-store'
      });

      if (response.status === 429 || response.status === 403) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
          continue;
        }
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful response
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

      return data.data;

    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      if (attempt === maxRetries - 1) {
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt)));
    }
  }

  return null;
};

// Helper function to process holder data
function processHolderData(holders: any[], token: Token): RiskAssessment {
  const dangers: string[] = [];
  const totalSupply = Number(token.total_supply);
  
  // Calculate dev holdings
  const devHoldings = holders.find(h => h.address === token.creator)?.balance || 0;
  const devPercentage = (Number(devHoldings) / totalSupply) * 100;

  // Sort holders by balance and calculate top holder percentages
  const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
  const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance), 0);
  const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, h) => sum + Number(h.balance), 0);
  
  const top5Percentage = (top5Holdings / totalSupply) * 100;
  const top10Percentage = (top10Holdings / totalSupply) * 100;

  // Build holder statistics message
  const holderStats = [
    `Developer holds ${devPercentage.toFixed(2)}% of supply`,
    `Top 5 holders control ${top5Percentage.toFixed(2)}% of supply`,
    `Top 10 holders control ${top10Percentage.toFixed(2)}% of supply`
  ].join('\n• ');

  // Determine risk level based on percentages
  if (devPercentage >= 50 || top5Percentage >= 70) {
    return {
      level: 'EXTREME RISK',
      color: 'text-red-600',
      message: 'Extremely high concentration detected',
      warning: `• ${holderStats}`
    };
  } else if (devPercentage >= 30 || top5Percentage >= 50) {
    return {
      level: 'VERY HIGH RISK',
      color: 'text-red-500',
      message: 'Very high concentration detected',
      warning: `• ${holderStats}`
    };
  } else if (devPercentage >= 20 || top5Percentage >= 40) {
    return {
      level: 'HIGH RISK',
      color: 'text-orange-500',
      message: 'High concentration detected',
      warning: `• ${holderStats}`
    };
  } else if (devPercentage >= 10 || top5Percentage >= 30) {
    return {
      level: 'MODERATE RISK',
      color: 'text-yellow-500',
      message: 'Moderate concentration detected',
      warning: `• ${holderStats}`
    };
  } else if (devPercentage >= 5 || top5Percentage >= 20) {
    return {
      level: 'ELEVATED RISK',
      color: 'text-yellow-400',
      message: 'Slightly elevated concentration',
      warning: `• ${holderStats}`
    };
  } else if (devPercentage >= 2 || top5Percentage >= 15) {
    return {
      level: 'GUARDED RISK',
      color: 'text-blue-400',
      message: 'Low centralization risks, but remain vigilant',
      warning: `• ${holderStats}`
    };
  }

  return {
    level: 'LOW RISK',
    color: 'text-green-500',
    message: 'Well distributed token',
    warning: `• ${holderStats}`
  };
}

// Add this function near your other fetch functions
const fetchDevTokenHoldings = async (creatorId: string, tokenId: string) => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/user/${creatorId}/tokens`
    );
    const data = await response.json();
    const tokenHolding = data.data?.find(item => item.token.id === tokenId);
    return tokenHolding?.balance || 0;
  } catch (error) {
    console.error('Error fetching dev holdings:', error);
    return null;
  }
};

// Update calculateRiskLevel to use processHolderData
const calculateRiskLevel = async (token: Token) => {
  const dangers: string[] = [];
  let hasMultipleTokens = false;
  
  // Get holder data
  const holders = await fetchTokenHolders(token.id);
  if (!holders) {
    return {
      level: 'UNKNOWN',
      color: 'text-gray-500',
      message: 'No holder data',
      warning: 'No data available'
    };
  }

  // Calculate percentages
  const totalSupply = Number(token.total_supply);
  
  // Check if dev exists in holders list and get their holdings
  const devHolder = holders.find(h => h.user === token.creator);
  const devHoldings = devHolder ? Number(devHolder.balance) : 0;
  const devPercentage = (devHoldings / totalSupply) * 100;

  // Check if dev has sold position
  if (!devHolder || devHoldings === 0) {
    dangers.push('Developer has sold their entire position');
  }

  // Check for multiple tokens
  if (!TRUSTED_DEVELOPERS.includes(token.creator)) {
    try {
      const creatorTokens = await fetchCreatorTokens(token.creator);
      if (creatorTokens && creatorTokens.length > 1) {
        dangers.push(`Developer has created ${creatorTokens.length} tokens`);
        hasMultipleTokens = true;
      }
    } catch (error) {
      console.error('Error checking creator tokens:', error);
    }
  }

  const sortedHolders = [...holders].sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
  const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance || 0), 0);
  const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, h) => sum + Number(h.balance || 0), 0);
  
  const top5Percentage = (top5Holdings / totalSupply) * 100;
  const top10Percentage = (top10Holdings / totalSupply) * 100;

  const holderStats = `Dev: ${devPercentage.toFixed(0)}% • Top 5: ${top5Percentage.toFixed(0)}% • Top 10: ${top10Percentage.toFixed(0)}%`;
  const warningMessage = `${holderStats}${dangers.length ? ' • ' + dangers.join(' • ') : ''}`;

  // If there are any dangers (dev sold or multiple tokens), return HIGH RISK
  if (dangers.length > 0) {
    return {
      level: 'HIGH RISK',
      color: 'text-orange-500',
      message: 'Multiple high risk factors detected',
      warning: warningMessage
    };
  }

  // Base risk level determination
  if (devPercentage >= 50 || top5Percentage >= 70) {
    return {
      level: 'EXTREME RISK',
      color: 'text-red-600',
      message: 'Extremely high centralization',
      warning: warningMessage
    };
  } else if (devPercentage >= 30 || top5Percentage >= 50) {
    return {
      level: 'VERY HIGH RISK',
      color: 'text-red-500',
      message: 'Very high centralization',
      warning: warningMessage
    };
  } else if (devPercentage >= 20 || top5Percentage >= 40) {
    return {
      level: 'HIGH RISK',
      color: 'text-orange-500',
      message: 'High concentration',
      warning: warningMessage
    };
  } else if (devPercentage >= 10 || top5Percentage >= 30) {
    return {
      level: 'MODERATE RISK',
      color: 'text-yellow-500',
      message: 'Moderate concentration',
      warning: warningMessage
    };
  } else if (devPercentage >= 5 || top5Percentage >= 20) {
    return {
      level: 'ELEVATED RISK',
      color: 'text-yellow-400',
      message: 'Slightly elevated risk',
      warning: warningMessage
    };
  } else if (devPercentage >= 2 || top5Percentage >= 10) {
    return {
      level: 'GUARDED RISK',
      color: 'text-blue-400',
      message: 'Low concentration',
      warning: warningMessage
    };
  }

  return {
    level: 'LOW RISK',
    color: 'text-green-500',
    message: 'Well distributed',
    warning: warningMessage
  };
};

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

// Update getTokens function
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
      const randomUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
        Math.floor(Math.random() * 20 + 100)
      }.0.0.0 Safari/537.36`;

      const response = await fetch(
        'https://api.odin.fun/v1/tokens?sort=created_time:desc&page=1&limit=20',
        {
          headers: {
            ...API_HEADERS,
            'User-Agent': randomUserAgent,
          },
          cache: 'no-store'
        }
      );

      if (response.status === 429 || response.status === 403) {
        console.log(`Rate limited (attempt ${attempt + 1}/${maxRetries}), waiting...`);
        await sleep(backoffDelay * Math.pow(2, attempt));
        continue;
      }

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
        // On last attempt, try to use cached data
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

// Add these helper functions at the top of the file
const CREATOR_TOKENS_CACHE_KEY = (creatorId: string) => `creator_tokens_${creatorId}`;
const CREATOR_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedCreatorTokens = (creatorId: string) => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(CREATOR_TOKENS_CACHE_KEY(creatorId));
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CREATOR_CACHE_DURATION) {
    localStorage.removeItem(CREATOR_TOKENS_CACHE_KEY(creatorId));
    return null;
  }
  return data;
};

const setCachedCreatorTokens = (creatorId: string, tokens: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CREATOR_TOKENS_CACHE_KEY(creatorId), JSON.stringify({
    data: tokens,
    timestamp: Date.now()
  }));
};

// Update the fetchCreatorTokens function
const fetchCreatorTokens = async (creatorId: string) => {
  const url = `${API_BASE_URL}/user/${creatorId}/created?sort=last_action_time%3Adesc&page=1&limit=999999`;
  const tokens = await fetchWithRetry(url);
  return tokens || [];
};

const fetchTokenHolders = async (tokenId: string) => {
  const url = `${API_BASE_URL}/token/${tokenId}/owners`;
  const holders = await fetchWithRetry(url);
  return holders || [];
};

const analyzeDevTrading = async (creatorId: string, tokenId: string) => {
  const url = `${API_BASE_URL}/user/${creatorId}/activity?page=1&limit=100&sort=time%3Adesc`;
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

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'holders_high' | 'holders_low';
type RiskFilter = 'all' | 'low' | 'moderate' | 'high' | 'extreme';

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
        <div key={i} className="p-3 sm:p-4 bg-card hover:bg-card/80 rounded-lg border border-border animate-pulse">
          <div className="flex items-center gap-3">
            {/* Token image skeleton */}
            <div className="w-12 h-12 rounded-lg bg-gray-700" />
            
            <div className="flex-1">
              {/* Name and risk level skeleton */}
              <div className="flex items-center flex-wrap gap-2">
                <div className="h-5 w-32 bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-700 rounded" />
              </div>
              {/* Stats skeleton */}
              <div className="mt-1 h-3 w-48 bg-gray-700 rounded" />
            </div>
            
            {/* Price and holders skeleton */}
            <div className="text-right">
              <div className="h-5 w-20 bg-gray-700 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        if (freshTokens.length > 0) {
          setTokens(freshTokens);
        } else if (!cachedData) {
          setError('Unable to fetch tokens. Please try again later.');
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
        if (!tokens.length) {
          setError('Failed to load tokens. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // Set up periodic refresh
    const interval = setInterval(loadTokens, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter and sort tokens
  const filterAndSortTokens = (tokensToFilter: Token[]) => {
    let result = [...tokensToFilter];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply risk filter
    if (riskFilter !== 'all') {
      result = result.filter(token => {
        const risk = calculateRiskLevel(token);
        switch (riskFilter) {
          case 'low':
            return risk.level === "LOW RISK" || risk.level === "GUARDED RISK";
          case 'moderate':
            return risk.level === "MODERATE RISK" || risk.level === "ELEVATED RISK";
          case 'high':
            return risk.level === "HIGH RISK" || risk.level === "VERY HIGH RISK";
          case 'extreme':
            return risk.level === "EXTREME RISK";
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
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
        default: // newest
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      }
    });

    return result;
  };

  // Get filtered and sorted tokens
  const filteredTokens = filterAndSortTokens(tokens);

  return (
    <div className="container px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Recent Tokens</h1>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/" className="bg-primary hover:bg-primary/90">
                Analyze Token
              </Link>
            </Button>

            {/* Risk Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                  <Filter className="h-4 w-4" />
                  {riskFilter === 'all' ? 'All Risks' : `${riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)} Risk`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRiskFilter('all')}>All Risks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRiskFilter('low')}>Low Risk</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRiskFilter('moderate')}>Moderate Risk</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRiskFilter('high')}>High Risk</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRiskFilter('extreme')}>Extreme Risk</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_high')}>Highest Price</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price_low')}>Lowest Price</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('holders_high')}>Most Holders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('holders_low')}>Least Holders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search tokens..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Token list */}
        <div className="space-y-3 sm:space-y-4">
          {loading && !tokens.length ? (
            <TokenListSkeleton />
          ) : error && !tokens.length ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredTokens.length > 0 ? (
            filteredTokens.map(async (token) => {
              const risk = await calculateRiskLevel(token);
              
              return (
                <Link
                  key={token.id}
                  href={`/results?search=${token.id}`}
                  className="block p-3 sm:p-4 bg-card hover:bg-card/80 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
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
                        <span className={`text-xs px-2 py-0.5 rounded ${risk.color}`}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {risk.warning}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(token.price || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {token.holder_count} holders
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-8">No tokens found</div>
          )}
        </div>
      </div>

      {/* Donation message */}
      <div className="fixed bottom-4 right-4 z-10">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg w-[360px]">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Support ODINSMASH ❤️ - Help keep our tools running
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-primary font-mono">
                bc1q3p7dpmu0s3mmcfj83jf072gjdcf6sqcdf3uk52
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}