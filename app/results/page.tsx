'use client';

// Client component
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from Next.js
import Link from "next/link"; // Ensure this is only declared once
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Globe, X, Send } from "lucide-react";
import { formatSupply } from '../../utils/formatSupply';
import { Market } from '@/types/market';

// Add constants at the top of the file
const TRUSTED_DEVELOPERS = [
  'vv5jb-7sm7u-vn3nq-6nflf-dghis-fd7ji-cx764-xunni-zosog-eqvpw-oae'
];

// Add this helper function
const formatUSDValue = (value: number): string => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

// Add this helper function at the top with other helpers
const calculateDevRisk = (holders: any[], totalSupply: string, creatorId: string) => {
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
};

const formatMarketCap = (marketcap: number): string => {
  // First divide by 1e9 to get the actual value in thousands
  const actualValue = marketcap / 1e9;
  
  if (actualValue >= 1000) {
    return `$${(actualValue / 1000).toFixed(2)}M`;
  } else {
    return `$${actualValue.toFixed(2)}K`;
  }
};

// Add these helper functions at the top
interface RiskThresholds {
  high: number;
  medium: number;
  low: number;
}

const calculateDynamicRiskThresholds = (totalHolders: number): RiskThresholds => {
  return {
    high: 100 / totalHolders * 5,    // High risk threshold
    medium: 100 / totalHolders * 3,   // Medium risk threshold
    low: 100 / totalHolders * 1.5     // Low risk threshold
  };
};

const calculateDistributionRisk = (holders: any[], totalSupply: string, totalHolders: number) => {
  if (!holders || holders.length === 0) return [];
  
  const totalSupplyNum = Number(totalSupply);
  const warnings = [];
  const thresholds = calculateDynamicRiskThresholds(totalHolders);
  
  // Helper to calculate percentage for a holder group
  const calculateGroupPercentage = (count: number) => {
    const groupHoldings = holders
      .slice(0, Math.min(count, holders.length))
      .reduce((sum, holder) => sum + Number(holder.balance), 0);
    return (groupHoldings / totalSupplyNum) * 100;
  };

  // Check different holder groups
  const holderGroups = [5, 10, 30, 50, 100];
  
  holderGroups.forEach(groupSize => {
    if (holders.length >= groupSize) {
      const percentage = calculateGroupPercentage(groupSize);
      
      if (percentage >= thresholds.high) {
        warnings.push({
          level: "HIGH",
          message: `Top ${groupSize} holders control ${percentage.toFixed(2)}% of supply - High centralization risk`
        });
      } else if (percentage >= thresholds.medium) {
        warnings.push({
          level: "WARNING",
          message: `Top ${groupSize} holders control ${percentage.toFixed(2)}% of supply - Medium risk`
        });
      } else if (percentage >= thresholds.low) {
        warnings.push({
          level: "CAUTION",
          message: `Top ${groupSize} holders control ${percentage.toFixed(2)}% of supply - Low risk`
        });
      }
    }
  });

  // If no warnings were generated, add a GOOD status
  if (warnings.length === 0) {
    warnings.push({
      level: "GOOD",
      message: "Token distribution appears healthy"
    });
  }

  return warnings;
};

// Add headers constant
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

const fetchWithRetry = async (url: string, options = {}) => {
  const maxRetries = 3;
  const backoffDelay = 1000;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const randomUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
        Math.floor(Math.random() * 20 + 100)
      }.0.0.0 Safari/537.36`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_HEADERS,
          'User-Agent': randomUserAgent,
        },
        cache: 'no-store'
      });

      if (response.status === 429 || response.status === 403) {
        console.log(`Rate limited (attempt ${attempt + 1}/${maxRetries}), waiting...`);
        await sleep(backoffDelay * Math.pow(2, attempt));
        continue;
      }

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await sleep(backoffDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
};

// Update fetchCreatorTokens
const fetchCreatorTokens = async (creatorId: string) => {
  try {
    const response = await fetchWithRetry(
      `https://api.odin.fun/v1/user/${creatorId}/created?sort=last_action_time%3Adesc&page=1&limit=30`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching creator tokens:', error);
    return [];
  }
};

// Update fetchDevTokenHoldings
const fetchDevTokenHoldings = async (creatorId: string, tokenId: string) => {
  try {
    const response = await fetchWithRetry(
      `https://api.odin.fun/v1/user/${creatorId}/tokens`
    );
    const data = await response.json();
    const tokenHolding = data.data.find(item => item.token.id === tokenId);
    return tokenHolding?.balance || 0;
  } catch (error) {
    console.error('Error fetching dev holdings:', error);
    return 0;
  }
};

// Update the analyzeDevTrading function
const analyzeDevTrading = async (creatorId: string, tokenId: string) => {
  try {
    // Get specific token's trading history for the dev
    const response = await fetch(
      `https://api.odin.fun/v1/token/${tokenId}/history?user=${creatorId}&sort=created_time:desc&page=1&limit=100`,
      { headers: API_HEADERS }
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    const transactions = data.data || [];
    let devSellCount = 0;
    let devBuyCount = 0;
    let totalSoldAmount = 0;
    let initialBalance = 0;

    // Get initial balance from first transaction (should be the mint/creation)
    const firstTx = transactions[transactions.length - 1];
    if (firstTx) {
      initialBalance = Number(firstTx.amount);
    }

    // Analyze only this token's transactions
    transactions.forEach(tx => {
      if (tx.type === 'sell') {
        devSellCount++;
        totalSoldAmount += Number(tx.amount);
      }
      if (tx.type === 'buy') {
        devBuyCount++;
      }
    });

    const percentageSold = initialBalance > 0 
      ? (totalSoldAmount / initialBalance) * 100 
      : 0;

    // Only flag as dump and rebuy if significant selling occurred
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
    return null;
  }
};

// Update the calculate24hVolumeSpike function
const calculate24hVolumeSpike = async (tokenId: string) => {
  try {
    // Fetch trades for the last 7 days
    const response = await fetchWithRetry(
      `https://api.odin.fun/v1/token/${tokenId}/trades?page=1&limit=9999`
    );
    const data = await response.json();
    const trades = data.data || [];

    const now = new Date();
    const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Calculate 24h volume - FIXED: divide by 1e11 instead of 1e8
    const trades24h = trades.filter(tx => new Date(tx.time) > last24h);
    const volume24h = trades24h.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);

    // Calculate previous 6 days volume (excluding last 24h)
    const trades7d = trades.filter(tx => {
      const txTime = new Date(tx.time);
      return txTime > last7d && txTime <= last24h;
    });

    // Calculate average daily volume from previous 6 days - FIXED: divide by 1e11
    const volume7d = trades7d.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);
    const averageDailyVolume = volume7d / 6;

    // Calculate buy/sell volume for 24h - FIXED: divide by 1e11
    const buyVolume24h = trades24h
      .filter(tx => tx.buy)
      .reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);
    
    const sellVolume24h = trades24h
      .filter(tx => !tx.buy)
      .reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);

    // Calculate metrics
    const spikeRatio = averageDailyVolume > 0 ? volume24h / averageDailyVolume : 1;
    const volumeChange = averageDailyVolume > 0 
      ? ((volume24h - averageDailyVolume) / averageDailyVolume * 100)
      : 0;

    return {
      spikeRatio,
      volume24h,
      averageDailyVolume,
      volumeChange: volumeChange.toFixed(2),
      tradeCount24h: trades24h.length,
      buyVolume24h,
      sellVolume24h,
      buySellRatio: buyVolume24h / (sellVolume24h || 1)
    };
  } catch (error) {
    console.error('Error calculating volume spike:', error);
    return {
      spikeRatio: 1,
      volume24h: 0,
      averageDailyVolume: 0,
      volumeChange: '0.00',
      tradeCount24h: 0,
      buyVolume24h: 0,
      sellVolume24h: 0,
      buySellRatio: 1
    };
  }
};

// Update the calculateOverallRisk function
const calculateOverallRisk = async (holders: any[], totalSupply: string, creatorId: string, totalHolders: number, tokenId: string, tokenData: any) => {
  const dangers = [];
  
  // Add volume spike analysis
  const volumeMetrics = await calculate24hVolumeSpike(tokenId);
  if (volumeMetrics.spikeRatio > 3) {
    dangers.push({
      warning: "Unusual Volume Activity",
      message: `24h volume is ${volumeMetrics.spikeRatio.toFixed(1)}x higher than 7-day average`
    });
  }
  
  if (!TRUSTED_DEVELOPERS.includes(creatorId)) {
    // Check for multiple tokens
    const creatorTokens = await fetchCreatorTokens(creatorId);
    if (creatorTokens.length > 1) {
      const uniqueTickers = [...new Set(creatorTokens.map(t => t.ticker))];
      const displayTickers = uniqueTickers.slice(0, 5);
      const remainingCount = uniqueTickers.length - 5;
      const tickerDisplay = remainingCount > 0 
        ? `${displayTickers.join(', ')} and ${remainingCount} more`
        : displayTickers.join(', ');
      
      dangers.push({
        warning: "Multiple tokens by creator",
        message: `Developer has created ${uniqueTickers.length} tokens (${tickerDisplay})`
      });
    }

    // Check for dev selling everything
    const devHoldings = await fetchDevTokenHoldings(creatorId, tokenId);
    if (devHoldings === 0) {
      dangers.push({
        warning: "Developer has no holdings",
        message: "Developer has sold their entire position"
      });
    }

    // Check for dump and rebuy with more detailed message
    const tradingAnalysis = await analyzeDevTrading(creatorId, tokenId);
    if (tradingAnalysis?.hasSoldAndRebought) {
      dangers.push({
        warning: "Developer dump and rebuy detected",
        message: `Developer has sold ${tradingAnalysis.percentageSold.toFixed(2)}% of their initial holdings (${tradingAnalysis.devSellCount} sells, ${tradingAnalysis.devBuyCount} buys)`
      });
    }
  }

  // Calculate percentages
  const devHolder = holders.find(holder => holder.user === creatorId);
  const devPercentage = devHolder 
    ? (Number(devHolder.balance) / Number(totalSupply)) * 100 
    : 0;

  const top5Holdings = holders
    .slice(0, 5)
    .reduce((sum, holder) => sum + Number(holder.balance), 0);
  const top5Percentage = (top5Holdings / Number(totalSupply)) * 100;

  const top10Holdings = holders
    .slice(0, 10)
    .reduce((sum, holder) => sum + Number(holder.balance), 0);
  const top10Percentage = (top10Holdings / Number(totalSupply)) * 100;

  // Determine base risk level
  let riskLevel;
  if (devPercentage >= 50 || top5Percentage >= 70) {
    riskLevel = {
      level: "EXTREME RISK",
      message: "Extremely high centralization. High probability of price manipulation.",
      color: "text-red-600",
      warning: "DANGER: Highly centralized token distribution"
    };
    dangers.push({
      warning: "Highly centralized distribution",
      message: `Dev holds ${devPercentage.toFixed(2)}%, Top 5 hold ${top5Percentage.toFixed(2)}%`
    });
  } else if (devPercentage >= 30 || top5Percentage >= 50) {
    riskLevel = {
      level: "VERY HIGH RISK",
      message: "Very high centralization detected. Major price manipulation risk.",
      color: "text-red-500",
      warning: "WARNING: Significant whale concentration"
    };
  } else if (devPercentage >= 20 || top5Percentage >= 40) {
    riskLevel = {
      level: "HIGH RISK",
      message: "High holder concentration. Exercise extreme caution.",
      color: "text-orange-500",
      warning: "CAUTION: High holder concentration"
    };
  } else if (devPercentage >= 10 || top5Percentage >= 30) {
    riskLevel = {
      level: "MODERATE RISK",
      message: "Moderate centralization risks present. Trade carefully.",
      color: "text-yellow-500",
      warning: "NOTICE: Moderate centralization"
    };
  } else if (devPercentage >= 5 || top5Percentage >= 20) {
    riskLevel = {
      level: "ELEVATED RISK",
      message: "Slightly elevated concentration risks. Monitor closely.",
      color: "text-yellow-400",
      warning: "INFO: Elevated concentration"
    };
  } else if (devPercentage >= 2 || top5Percentage >= 10) {
    riskLevel = {
      level: "GUARDED RISK",
      message: "Low centralization risks, but remain vigilant.",
      color: "text-blue-400",
      warning: "SAFE: Limited concentration"
    };
  } else {
    riskLevel = {
      level: "LOW RISK",
      message: "Healthy token distribution detected.",
      color: "text-green-500",
      warning: "GOOD: Well distributed"
    };
  }

  // If there are any dangers, override with HIGH RISK
  if (dangers.length > 0) {
    return {
      level: "HIGH RISK",
      message: "Multiple high risk factors detected. Exercise extreme caution.",
      color: "text-red-500",
      warning: "DANGER: Multiple risk factors",
      dangers: dangers,
      volumeMetrics
    };
  }

  // Update the return object to include volume metrics
  const riskAssessment = {
    ...riskLevel,
    volumeMetrics,
    dangers
  };

  return riskAssessment;
};

// Add this loading skeleton for the risk analysis section
const RiskAnalysisSkeleton = () => (
  <div className="animate-pulse">
    {/* Risk Level Skeleton */}
    <div className="text-xl font-bold mb-2">
      <div className="h-7 w-40 bg-gray-700/50 rounded" />
    </div>
    
    {/* Warning Skeleton */}
    <div className="text-sm font-medium mb-2">
      <div className="h-5 w-64 bg-gray-700/50 rounded" />
    </div>
    
    {/* Message Skeleton */}
    <div className="text-sm text-gray-400 mb-4">
      <div className="h-4 w-full bg-gray-700/50 rounded" />
    </div>
    
    {/* Stats Skeleton */}
    <div className="mt-4 text-sm text-gray-400 space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 w-72 bg-gray-700/50 rounded" />
      ))}
    </div>
  </div>
);

// Update the AsyncRiskAnalysis component
const AsyncRiskAnalysis = ({ 
  holders, 
  totalSupply, 
  creatorId, 
  totalHolders, 
  tokenId, 
  onRiskUpdate,
  tokenData
}) => {
  const [risk, setRisk] = useState(null);

  // Calculate percentages
  const devHolder = holders.find(h => h.user === creatorId);
  const devHoldings = devHolder ? Number(devHolder.balance) : 0;
  const devPercentage = (devHoldings / Number(totalSupply)) * 100;

  const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
  const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance), 0);
  const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, h) => sum + Number(h.balance), 0);
  
  const top5Percentage = (top5Holdings / Number(totalSupply)) * 100;
  const top10Percentage = (top10Holdings / Number(totalSupply)) * 100;

  useEffect(() => {
    const updateRiskAnalysis = async () => {
      const riskData = await calculateOverallRisk(
        holders,
        totalSupply,
        creatorId,
        totalHolders,
        tokenId,
        tokenData
      );
      
      // Only update if data has changed
      if (JSON.stringify(riskData) !== JSON.stringify(risk)) {
        setRisk(riskData);
        onRiskUpdate(riskData); // Call the callback with new risk data
      }
    };

    // Initial load
    updateRiskAnalysis();

    // Silent real-time updates
    const interval = setInterval(updateRiskAnalysis, 5000);
    return () => clearInterval(interval);
  }, [holders, totalSupply, creatorId, totalHolders, tokenId, tokenData]);

  if (!risk) return null;

  return (
    <div>
      <div className={`text-xl font-bold mb-2 ${risk.color}`}>
        {risk.level}
      </div>
      <div className={`text-sm font-medium mb-2 ${risk.color}`}>
        {risk.warning}
      </div>
      <p className="text-sm text-gray-400 mb-4">
        {risk.message}
      </p>

      {/* Existing holder metrics */}
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>• Developer holds {devPercentage.toFixed(2)}% of supply</p>
        <p>• Top 5 holders control {top5Percentage.toFixed(2)}% of supply</p>
        <p>• Top 10 holders control {top10Percentage.toFixed(2)}% of supply</p>
      </div>
    </div>
  );
};

// First, add the BTCPrice interface at the top with other interfaces
interface BTCPrice {
  USD: number;
  time: number;
}

// Then update the VolumeAnalysis component
const VolumeAnalysis = ({ volumeMetrics, btcUsdPrice }: { volumeMetrics: any, btcUsdPrice: number }) => {
  if (!volumeMetrics || !btcUsdPrice) return null;

  // Convert BTC volumes to USD
  const volume24hUSD = volumeMetrics.volume24h * btcUsdPrice;
  const avgDailyVolumeUSD = volumeMetrics.averageDailyVolume * btcUsdPrice;
  const buyVolumeUSD = volumeMetrics.buyVolume24h * btcUsdPrice;
  const sellVolumeUSD = volumeMetrics.sellVolume24h * btcUsdPrice;

  return (
    <div className="terminal-card p-4">
      <h2 className="mb-4 text-sm font-medium">Volume Analysis</h2>
      <div className="space-y-2 text-sm">
        <div className="data-row">
          <span className="data-label">24h Volume</span>
          <span>{formatUSDValue(volume24hUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Avg Daily Volume</span>
          <span>{formatUSDValue(avgDailyVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">24h Trades</span>
          <span>{volumeMetrics.tradeCount24h}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Buy Volume</span>
          <span>{formatUSDValue(buyVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Sell Volume</span>
          <span>{formatUSDValue(sellVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Buy/Sell Ratio</span>
          <span>{volumeMetrics.buySellRatio.toFixed(2)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Volume Trend</span>
          <span>{volumeMetrics.spikeRatio.toFixed(2)}x average</span>
        </div>
      </div>
    </div>
  );
};

// Update the header section in both the loading state and main render
const Header = () => (
  <header className="border-b border-border">
    <div className="container flex h-14 items-center px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <img 
            src="/Logo.png" 
            alt="ODINSMASH Logo" 
            className="h-6 w-6"
          />
          ODINSMASH
        </Link>
        <nav className="flex items-center space-x-4 text-sm">
          <Link href="/" className="text-primary hover:text-primary/80">
            HOME
          </Link>
          <Link href="/tokens" className="text-muted-foreground hover:text-foreground">
            TOKENS
          </Link>
        </nav>
      </div>
    </div>
  </header>
);

// Update the SocialLinks component
const SocialLinks = ({ twitter, website, telegram }: { twitter?: string, website?: string, telegram?: string }) => {
  if (!twitter && !website && !telegram) return null;
  
  return (
    <div className="flex items-center gap-3 mt-2">
      {website && (
        <Link 
          href={website}
          target="_blank"
          className="text-muted-foreground hover:text-primary transition-colors"
          title="Website"
        >
          <Globe className="h-4 w-4" />
        </Link>
      )}
      {twitter && (
        <Link 
          href={twitter}
          target="_blank"
          className="text-muted-foreground hover:text-primary transition-colors group"
          title="X (formerly Twitter)"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 1200 1227" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-colors group-hover:text-primary"
          >
            <path 
              d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
              fill="currentColor"
            />
          </svg>
        </Link>
      )}
      {telegram && (
        <Link 
          href={telegram}
          target="_blank"
          className="text-muted-foreground hover:text-primary transition-colors"
          title="Telegram"
        >
          <Send className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

// Update the LoadingHeader component
const LoadingHeader = () => (
  <div className="mb-6 flex items-center gap-3">
    {/* Token image skeleton */}
    <div className="h-[60px] w-[60px] lg:h-[110px] lg:w-[110px] bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-lg" />
    
    <div className="flex flex-col gap-2 flex-1">
      {/* Token name skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
      </div>
      {/* Description skeleton - multiple lines */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
      </div>
      {/* Social links skeleton */}
      <div className="flex items-center gap-3 mt-2">
        <div className="h-4 w-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded-full" />
      </div>
    </div>
  </div>
);

// Update the LoadingRiskAnalysis component
const LoadingRiskAnalysis = () => (
  <div className="terminal-card p-4">
    <h2 className="mb-4 text-sm font-medium">Risk Analysis</h2>
    <div className="space-y-4">
      {/* Risk level skeleton */}
      <div className="h-7 w-40 bg-gradient-to-r from-red-700/50 to-red-600/50 animate-pulse rounded" />
      {/* Warning message skeleton */}
      <div className="h-5 w-64 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
      {/* Description skeleton */}
      <div className="h-4 w-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
      {/* Stats skeleton */}
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Update the LoadingTokenOverview component
const LoadingTokenOverview = () => (
  <div className="terminal-card p-4">
    <h2 className="mb-4 text-sm font-medium">Token Overview</h2>
    <div className="space-y-3">
      {/* Token info skeleton */}
      {['Price', 'Supply', 'Creator', 'Market Cap', 'Holders', 'LP'].map((label, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="h-4 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
        </div>
      ))}
      {/* Trade button skeleton */}
      <div className="pt-4 border-t border-border">
        <div className="h-9 w-full bg-gradient-to-r from-primary/50 to-primary/30 animate-pulse rounded" />
      </div>
    </div>
  </div>
);

// Update the LoadingMarkets component
const LoadingMarkets = () => (
  <div className="terminal-card p-4 md:col-span-2">
    <h2 className="mb-4 text-sm font-medium">Markets</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {['Market', 'Pair', 'Liquidity', 'LP'].map((header) => (
              <th key={header} className="text-left p-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
                  <div className="h-4 w-20 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
                </div>
              </td>
              <td className="p-2">
                <div className="h-4 w-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
              <td className="p-2">
                <div className="h-4 w-28 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
              <td className="p-2">
                <div className="h-4 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Update the LoadingHolders component
const LoadingHolders = () => (
  <div className="terminal-card p-4 md:col-span-2">
    <h2 className="mb-4 text-sm font-medium">Top Holders</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {['Holder', 'Amount', 'Percentage'].map((header) => (
              <th key={header} className="text-left p-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td className="p-2">
                <div className="h-4 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
              <td className="p-2">
                <div className="h-4 w-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
              <td className="p-2">
                <div className="h-4 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 animate-pulse rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Add new interface for holder analysis
interface HolderAnalysis {
  newHolderGrowthRate: number;
  top10AccumulationTrend: number;
  holderCount: number;
  whaleActivity: {
    accumulation: number;
    distribution: number;
  };
}

const TOTAL_SUPPLY = 21_000_000; // Add this constant at the top with other constants

const calculateHolderAnalysis = async (tokenId: string, holders: any[]): Promise<HolderAnalysis> => {
  try {
    console.log('Starting holder analysis calculation for:', tokenId);
    console.log('Current holders:', holders.length);

    if (!holders || holders.length === 0) {
      throw new Error('No holders data');
    }

    // Use constant total supply instead of trying to get it from holders
    const totalSupply = TOTAL_SUPPLY;
    console.log('Using total supply:', totalSupply);

    // Calculate top 10 holdings
    const top10Holdings = holders
      .slice(0, 10)
      .reduce((sum, h) => sum + Number(h.balance) / 1e11, 0); // Divide by 1e11 to get actual balance
    
    console.log('Top 10 holdings:', top10Holdings);
    
    // Calculate whale metrics (holders with >1% supply)
    const whaleThreshold = totalSupply * 0.01;
    const whales = holders.filter(h => (Number(h.balance) / 1e11) >= whaleThreshold);
    
    // Calculate accumulation/distribution
    const whaleAccumulation = whales.length;
    const whaleDistribution = 0; // We can't determine distribution without historical data

    // Calculate top 10 accumulation trend
    const top10Percentage = (top10Holdings / totalSupply) * 100;
    
    const analysis = {
      newHolderGrowthRate: 0,
      top10AccumulationTrend: Number.isFinite(top10Percentage) ? top10Percentage : 0,
      holderCount: holders.length,
      whaleActivity: {
        accumulation: whaleAccumulation,
        distribution: whaleDistribution
      }
    };

    console.log('Final holder analysis:', analysis);
    return analysis;

  } catch (error) {
    console.error('Error in calculateHolderAnalysis:', error);
    return {
      newHolderGrowthRate: 0,
      top10AccumulationTrend: 0,
      holderCount: holders.length || 0,
      whaleActivity: {
        accumulation: 0,
        distribution: 0
      }
    };
  }
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const searchUrl = searchParams.get('search');
  const tokenId = searchUrl ? searchUrl.split('/').pop() : '';

  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [creatorUsername, setCreatorUsername] = useState<string>('');
  const [holders, setHolders] = useState<any[]>([]);
  const [price, setPrice] = useState<{
    btcPrice: number;
    tokenPrice: number;
    usdPrice: string;
  } | null>(null);
  const [lastFetchedPrice, setLastFetchedPrice] = useState<{
    btcPrice: number;
    tokenPrice: number;
    usdPrice: string;
  } | null>(null);
  const [cachedHolders, setCachedHolders] = useState<any[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [btcUsdPrice, setBtcUsdPrice] = useState(0);
  const [holderAnalysis, setHolderAnalysis] = useState<HolderAnalysis | null>(null);

  const fetchMarkets = async () => {
    try {
      const response = await fetch(`/api/markets?tokenId=${tokenId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      const data = await response.json();
      console.log('Markets API response:', data); // Debug log

      // Keep existing markets if we get empty data or invalid response
      if (!Array.isArray(data)) {
        return;
      }

      // Only update if we have markets data
      if (data.length > 0) {
        setMarkets(data);
      } else if (markets.length > 0) {
        // Keep existing markets if we have them
        return;
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
      // Keep existing markets on error
    }
  };

  const fetchCreatorUsername = async (creatorId: string) => {
    try {
      const response = await fetch(`https://api.odin.fun/v1/user/${creatorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch creator data');
      }
      const data = await response.json();
      setCreatorUsername(data.username);
    } catch (error) {
      console.error('Error fetching creator username:', error);
      setCreatorUsername('Unknown');
    }
  };

  const fetchHolders = async () => {
    try {
      console.log('Starting to fetch holders for token:', tokenId);
      let allHolders = [];
      let currentPage = 1;
      const limit = 20;
      let hasMorePages = true;

      // Try to get from cache first
      if (cachedHolders.length > 0) {
        console.log('Using cached holders:', cachedHolders.length);
        setHolders(cachedHolders);
      }

      // Fetch all pages
      while (hasMorePages) {
        console.log(`Fetching holders page ${currentPage}`);
        const response = await fetchWithRetry(
          `https://api.odin.fun/v1/token/${tokenId}/owners?page=${currentPage}&limit=${limit}`
        );
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          hasMorePages = false;
          break;
        }

        allHolders = [...allHolders, ...data.data];
        
        // Check if we've reached the last page
        if (data.data.length < limit || allHolders.length >= data.count) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      console.log(`Total holders fetched: ${allHolders.length}`);

      // Only update if we got new data
      if (allHolders.length > 0) {
        setHolders(allHolders);
        setCachedHolders(allHolders); // Cache the successful response
      } else if (cachedHolders.length === 0) {
        // If no cached data and no new data, try direct API call
        console.log('Attempting direct API call');
        const directResponse = await fetch(
          `https://api.odin.fun/v1/token/${tokenId}/owners?page=1&limit=100`,
          { 
            headers: {
              ...API_HEADERS,
              'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
                Math.floor(Math.random() * 20 + 100)
              }.0.0.0 Safari/537.36`,
            },
            cache: 'no-store'
          }
        );

        if (directResponse.ok) {
          const directData = await directResponse.json();
          const directHolders = directData.data || [];
          setHolders(directHolders);
          setCachedHolders(directHolders);
        }
      }
    } catch (error) {
      console.error('Error fetching holders:', error);
      // Use cached data if available
      if (cachedHolders.length > 0) {
        console.log('Using cached holders after error');
        setHolders(cachedHolders);
      }
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch(`/api/priceWebhook?tokenId=${tokenId}`);
      
      if (!response.ok) {
        console.warn('Price API error, using last known price');
        if (lastFetchedPrice) {
          setPrice(lastFetchedPrice);
          return;
        }
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      setPrice(data);
      setLastFetchedPrice(data); // Save the successfully fetched price
    } catch (error) {
      console.error('Error fetching price:', error);
      
      // If we have a last known price, use it
      if (lastFetchedPrice) {
        setPrice(lastFetchedPrice);
        return;
      }

      // If no last price available, try to calculate from token data
      if (tokenData) {
        const fallbackPrice = {
          btcPrice: tokenData.btc_price || 0,
          tokenPrice: tokenData.price || 0,
          usdPrice: tokenData.price?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          }) || '0.00'
        };
        setPrice(fallbackPrice);
        setLastFetchedPrice(fallbackPrice);
      }
    }
  };

  const fetchBTCPrice = async () => {
    try {
      const response = await fetch('https://mempool.space/api/v1/prices');
      const data = await response.json();
      setBtcUsdPrice(data.USD);
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }
  };

  // Update the fetchTokenData function
  const fetchTokenData = async () => {
    try {
      console.log('Fetching token data for:', tokenId);
      const response = await fetchWithRetry(`https://api.odin.fun/v1/token/${tokenId}`);
      const data = await response.json();
      console.log('Token data response:', data);
      setTokenData(data);
      
      // Fetch creator username when we get token data
      if (data?.creator) {
        await fetchCreatorUsername(data.creator);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Update the useEffect to include all required functions
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tokenId) {
          setError('No token ID provided');
          setLoading(false);
          return;
        }

        // First fetch token data
        await fetchTokenData();
        
        // Then fetch holders
        await fetchHolders();
        
        // Other fetches can happen in parallel
        await Promise.all([
          fetchMarkets(),
          fetchPrice(),
          fetchBTCPrice()
        ]);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenId]); // tokenId is now properly in scope

  // Add a separate useEffect for holder analysis
  useEffect(() => {
    const updateAnalysis = async () => {
      if (holders.length > 0) {
        console.log('Calculating holder analysis with:', holders.length, 'holders');
        const analysis = await calculateHolderAnalysis(tokenId, holders);
        setHolderAnalysis(analysis);
      }
    };

    updateAnalysis();
  }, [holders, tokenId]);

  // Add new component for Holder Analysis
  const HolderAnalysisComponent = ({ holderAnalysis }: { holderAnalysis: HolderAnalysis }) => {
    if (!holderAnalysis) return null;
    
    return (
      <div className="terminal-card p-4">
        <h2 className="mb-4 text-sm font-medium">Holder Analysis</h2>
        <div className="space-y-2 text-sm">
          <div className="data-row">
            <span className="data-label">New Holder Growth</span>
            <span>{holderAnalysis.newHolderGrowthRate.toFixed(2)}%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Top 10 Accumulation</span>
            <span>{holderAnalysis.top10AccumulationTrend.toFixed(2)}%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Whale Distribution</span>
            <span>
              {holderAnalysis.whaleActivity.accumulation} Active / 
              {holderAnalysis.whaleActivity.distribution} Inactive
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Add new component for Holder Stats
  const HolderStats = ({ holderAnalysis }: { holderAnalysis: HolderAnalysis }) => {
    if (!holderAnalysis) return null;
    
    return (
      <div className="terminal-card p-4">
        <h2 className="mb-4 text-sm font-medium">Holder Stats</h2>
        <div className="space-y-2 text-sm">
          <div className="data-row">
            <span className="data-label">New Holders (24h)</span>
            <span>{holderAnalysis.newHolderGrowthRate.toFixed(2)}%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Top 10 Accumulation</span>
            <span>{holderAnalysis.top10AccumulationTrend.toFixed(2)}%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Total Holders</span>
            <span>{holderAnalysis.holderCount}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Whale Activity</span>
            <span>
              {holderAnalysis.whaleActivity.accumulation} 🟢 / 
              {holderAnalysis.whaleActivity.distribution} 🔴
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-mono">
        <Header />
        <main className="container px-4 py-8">
          <LoadingHeader />
          <div className="grid gap-6 md:grid-cols-2">
            <LoadingRiskAnalysis />
            <LoadingTokenOverview />
            <LoadingMarkets />
            <LoadingHolders />
          </div>
        </main>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (!tokenData) return <div>No token data available.</div>;

  const imageUrl = `https://images.odin.fun/token/${tokenId}`;

  return (
    <div className="min-h-screen bg-background font-mono">
      <Header />
      <main className="container px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <img 
            src={imageUrl} 
            alt={tokenData.name} 
            className="object-cover h-[60px] w-[60px] rounded-lg lg:h-[110px] lg:w-[110px]" 
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <strong>{tokenData.name}</strong>
              <Link 
                href={`https://odin.fun/token/${tokenId}`}
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <p className="line-clamp-4 text-sm text-muted-foreground">
              {tokenData.description}
            </p>
            <SocialLinks 
              twitter={tokenData.twitter}
              website={tokenData.website}
              telegram={tokenData.telegram}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="terminal-card p-4">
            <h2 className="mb-4 text-sm font-medium">Risk Analysis</h2>
            {holders.length > 0 ? (
              <AsyncRiskAnalysis 
                holders={holders}
                totalSupply={tokenData.total_supply}
                creatorId={tokenData.creator}
                totalHolders={tokenData.holder_count}
                tokenId={tokenId}
                onRiskUpdate={setRiskAnalysis}
                tokenData={tokenData}
              />
            ) : (
              <div className="text-gray-400">LOADING</div>
            )}
          </div>

          <div className="terminal-card p-4">
            <h2 className="mb-4 text-sm font-medium">Token Overview</h2>
            <div className="space-y-4">
              {/* Token info */}
              <div className="space-y-2">
                <div className="data-row">
                  <span className="data-label">Price</span>
                  <span>${price?.usdPrice || '0.00'}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Supply</span>
                  <span>{formatSupply(tokenData.total_supply, 18)} {tokenData.ticker}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Creator</span>
                  <span>
                    {creatorUsername ? (
                      <Link 
                        href={`https://odin.fun/user/${tokenData.creator}`}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {creatorUsername}
                      </Link>
                    ) : 'Loading...'}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-label">Market Cap</span>
                  <span>{formatMarketCap(tokenData.marketcap)}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Holders</span>
                  <span>{tokenData.holder_count ? tokenData.holder_count.toLocaleString() : 'N/A'}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">LP</span>
                  <span>{tokenData.token_liquidity > 0 ? "Available" : "Not Available"}</span>
                </div>
              </div>

              {/* Trade Button */}
              <div className="pt-4 border-t border-border">
                <Link 
                  href={`https://odin.fun/token/${tokenId}`}
                  target="_blank"
                  className="w-full"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Trade on Odin.fun
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Volume and Holder Analysis Grid */}
          <div className="grid gap-6 md:grid-cols-2 md:col-span-2">
            {/* Volume Analysis */}
            {riskAnalysis?.volumeMetrics && btcUsdPrice > 0 && (
              <VolumeAnalysis 
                volumeMetrics={riskAnalysis.volumeMetrics} 
                btcUsdPrice={btcUsdPrice}
              />
            )}
            
            {/* Holder Analysis */}
            {holderAnalysis ? (
              <HolderAnalysisComponent holderAnalysis={holderAnalysis} />
            ) : (
              <div className="terminal-card p-4">
                <h2 className="mb-4 text-sm font-medium">Holder Analysis</h2>
                <div className="text-sm text-gray-400">Loading analysis data...</div>
              </div>
            )}
          </div>

          {/* Markets */}
          <div className="terminal-card p-4 md:col-span-2">
            <h2 className="mb-4 text-sm font-medium">Markets</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2">Market</th>
                    <th className="text-left p-2">Pair</th>
                    <th className="text-left p-2">Liquidity</th>
                    <th className="text-left p-2">LP</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ODIN.FUN market using token data directly */}
                  <tr>
                    <td className="flex items-center gap-2 p-2">
                      <img 
                        src="https://odin.fun/favicon.ico"
                        alt="ODIN.FUN"
                        className="w-4 h-4"
                      />
                      ODIN.FUN
                    </td>
                    <td className="p-2">{tokenData.ticker}/BTC</td>
                    <td className="p-2">
                      {tokenData.btc_liquidity > 0 && price?.btcPrice
                        ? formatUSDValue((tokenData.btc_liquidity / 1e11) * price.btcPrice)
                        : "-"
                      }
                    </td>
                    <td className="p-2">{tokenData.token_liquidity > 0 ? "Available" : "Not Available"}</td>
                  </tr>
                  {/* Additional markets from the API */}
                  {markets.map((market, index) => (
                    <tr key={index}>
                      <td className="flex items-center gap-2 p-2">
                        <img 
                          src={market.icon}
                          alt={market.name}
                          className="w-4 h-4"
                        />
                        {market.name}
                      </td>
                      <td className="p-2">{market.pair}</td>
                      <td className="p-2">
                        {market.liquidity > 0 && price?.btcPrice
                          ? formatUSDValue((market.liquidity / 1e11) * price.btcPrice)
                          : "-"
                        }
                      </td>
                      <td className="p-2">{market.hasLiquidity ? "Available" : "Not Available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Holders */}
          <div className="terminal-card p-4 md:col-span-2">
            <h2 className="mb-4 text-sm font-medium">Top Holders</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2">Holder</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.length > 0 ? (
                    holders.slice(0, 5).map((holder, index) => {
                      const adjustedBalance = Number(holder.balance) / 1e11;
                      const totalSupply = Number(tokenData.total_supply) / Math.pow(10, 18);
                      const percentage = ((Number(holder.balance) / Number(tokenData.total_supply)) * 100).toFixed(2);
                      
                      return (
                        <tr key={index}>
                          <td className="p-2">
                            <Link 
                              href={`https://odin.fun/user/${holder.user}`}
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              {holder.user_username}
                            </Link>
                            {holder.user === tokenData.creator && <span className="text-white"> (dev)</span>}
                          </td>
                          <td className="p-2">
                            {adjustedBalance >= 1e6 
                              ? `${(adjustedBalance / 1e6).toFixed(2)}M`
                              : adjustedBalance >= 1e3 
                                ? `${(adjustedBalance / 1e3).toFixed(2)}K`
                                : adjustedBalance.toFixed(2)
                            }
                          </td>
                          <td className="p-2">{percentage}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center p-2">No holder data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
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