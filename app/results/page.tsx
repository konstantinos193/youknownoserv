'use client';

// Client component
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from Next.js
import Link from "next/link"; // Ensure this is only declared once
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Globe, X, Send } from "lucide-react";
import { formatSupply } from '../../utils/formatSupply';
import { Market } from '@/types/market';
import { calculateRiskLevel } from '@/utils/calculateRiskLevel';
import { supabase } from '@/lib/supabase';

// Add constants at the top of the file
const TRUSTED_DEVELOPERS = [
  'vv5jb-7sm7u-vn3nq-6nflf-dghis-fd7ji-cx764-xunni-zosog-eqvpw-oae'
];

// Add this helper function
const formatUSDValue = (value: number | undefined | null): string => {
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

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Update the API_URL constant to use environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Update the fetchWithRetry function to include CORS headers
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
          'x-api-key': API_KEY || '',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        mode: 'cors',
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

// Update the fetch functions to include the API key header
const fetchWithAuth = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY || '',
      }
    });
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Update fetchCreatorTokens
const fetchCreatorTokens = async (creatorId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/user/${creatorId}/created`);
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
    const response = await fetch(`${API_URL}/api/user/${creatorId}/tokens`);
    const data = await response.json();
    const tokenHolding = data.data.find(item => item.token.id === tokenId);
    return tokenHolding?.balance || 0;
  } catch (error) {
    console.error('Error fetching dev holdings:', error);
    return 0;
  }
};

// Update analyzeDevTrading
const analyzeDevTrading = async (creatorId: string, tokenId: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/token/${tokenId}/history?user=${creatorId}`
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

// Update calculate24hVolumeSpike
const calculate24hVolumeSpike = async (tokenId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/token/${tokenId}/trades`);
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

// Add this helper function near the top with other helpers
const calculateVolumeSpike = (trades: any[]) => {
  const now = new Date();
  const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  // Calculate 24h volume
  const trades24h = trades.filter(tx => new Date(tx.time) > last24h);
  const volume24h = trades24h.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);

  // Calculate previous 6 days volume (excluding last 24h)
  const trades7d = trades.filter(tx => {
    const txTime = new Date(tx.time);
    return txTime > last7d && txTime <= last24h;
  });

  // Calculate average daily volume from previous 6 days
  const volume7d = trades7d.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);
  const averageDailyVolume = volume7d / 6;

  return averageDailyVolume > 0 ? volume24h / averageDailyVolume : 1;
};

// Update the calculateOverallRisk function
const calculateOverallRisk = async (
  holders: any[],
  totalSupply: string,
  creatorId: string,
  totalHolders: number,
  tokenId: string,
  tokenData: any,
  combinedData: any // Add combinedData parameter
) => {
  const dangers = [];
  
  // Use trades from combined data
  const trades = combinedData.trades.data || [];
  const creatorTokens = combinedData.creator?.created || [];

  // Calculate volume metrics
  const volumeMetrics = calculateVolumeMetrics(trades);
  
  // ... rest of risk calculation logic ...

  return {
    dangers,
    volumeMetrics,
    // ... other analysis results ...
  };
};

// Separate volume metrics calculation
const calculateVolumeMetrics = (trades: any[]) => {
  const now = new Date();
  const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const last7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const trades24h = trades.filter(tx => new Date(tx.time) > last24h);
  
  // Calculate total 24h volume
  const volume24h = trades24h.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);

  // Calculate buy and sell volumes
  const buyVolume24h = trades24h
    .filter(tx => tx.buy)
    .reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);
  
  const sellVolume24h = trades24h
    .filter(tx => !tx.buy)
    .reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);

  // Calculate buy/sell ratio (avoid division by zero)
  const buySellRatio = sellVolume24h > 0 ? buyVolume24h / sellVolume24h : 1;

  // Calculate 7d metrics
  const trades7d = trades.filter(tx => {
    const txTime = new Date(tx.time);
    return txTime > last7d && txTime <= last24h;
  });
  const volume7d = trades7d.reduce((sum, tx) => sum + (Number(tx.amount_btc) / 1e11), 0);
  const averageDailyVolume = volume7d / 6;

  return {
    spikeRatio: averageDailyVolume > 0 ? volume24h / averageDailyVolume : 1,
    volume24h,
    averageDailyVolume,
    volumeChange: averageDailyVolume > 0 
      ? ((volume24h - averageDailyVolume) / averageDailyVolume * 100).toFixed(2)
      : '0.00',
    tradeCount24h: trades24h.length,
    buyVolume24h,
    sellVolume24h,
    buySellRatio
  };
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

  useEffect(() => {
    const updateRiskAnalysis = async () => {
      try {
        // Check for zero holders first
        if (totalHolders === 0) {
          const rugRisk = {
            level: "RUGGED",
            color: "text-red-600",
            message: "Token has been rugged - All holders have sold",
            warning: "DANGER: Token has 0 holders"
          };
          setRisk(rugRisk);
          if (onRiskUpdate) onRiskUpdate(rugRisk);
          return;
        }

        // Check if we have valid holders data
        if (!holders || holders.length === 0) {
          setRisk({
            level: "ERROR",
            color: "text-red-600",
            message: "No holder data available",
            warning: "Error calculating risk level"
          });
          return;
        }

        // Find developer's holdings
        const devHolder = holders.find(h => h.user === creatorId);
        const devHoldings = devHolder ? Number(devHolder.balance) / 1e11 : 0;
        const totalSupplyNum = Number(totalSupply) / 1e11;
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

        // Check for multiple tokens by developer
        if (!TRUSTED_DEVELOPERS.includes(creatorId)) {
          const creatorTokens = await fetchCreatorTokens(creatorId);
          if (creatorTokens && creatorTokens.length > 1) {
            warnings.push(`Developer has created ${creatorTokens.length} tokens`);
            isExtremeRisk = true;
          }
        }

        let riskAssessment;

        // If either extreme risk condition is met, show combined warnings
        if (isExtremeRisk) {
          riskAssessment = {
            level: "EXTREME RISK",
            color: "text-red-600",
            message: "Multiple high-risk factors detected - Extreme risk of abandonment",
            warning: `DANGER: ${warnings.join(" & ")}`,
            stats: {
              devPercentage,
              top5Percentage,
              top10Percentage
            }
          };
        }
        // Regular risk level checks
        else if (devPercentage >= 50 || top5Percentage >= 70) {
          riskAssessment = {
            level: "EXTREME RISK",
            color: "text-red-600",
            message: "Extremely high centralization. High probability of price manipulation.",
            warning: holderStats,
            stats: { devPercentage, top5Percentage, top10Percentage }
          };
        } else if (devPercentage >= 30 || top5Percentage >= 50) {
          riskAssessment = {
            level: "VERY HIGH RISK",
            color: "text-red-500",
            message: "Very high centralization detected. Major price manipulation risk.",
            warning: holderStats,
            stats: { devPercentage, top5Percentage, top10Percentage }
          };
        } else if (devPercentage >= 20 || top5Percentage >= 40) {
          riskAssessment = {
            level: "HIGH RISK",
            color: "text-orange-500",
            message: "High holder concentration. Exercise extreme caution.",
            warning: holderStats,
            stats: { devPercentage, top5Percentage, top10Percentage }
          };
        } else if (devPercentage >= 10 || top5Percentage >= 30) {
          riskAssessment = {
            level: "MODERATE RISK",
            color: "text-yellow-500",
            message: "Standard market risks apply. Trade carefully.",
            warning: holderStats,
            stats: { devPercentage, top5Percentage, top10Percentage }
          };
        } else {
          riskAssessment = {
            level: "LOW RISK",
            color: "text-green-500",
            message: "Well distributed token supply",
            warning: holderStats,
            stats: { devPercentage, top5Percentage, top10Percentage }
          };
        }

        setRisk(riskAssessment);
        if (onRiskUpdate) onRiskUpdate(riskAssessment);

      } catch (err) {
        console.error('Error in risk analysis:', err);
        setRisk({
          level: "ERROR",
          color: "text-red-600",
          message: "Error calculating risk level",
          warning: "Error in risk analysis"
        });
      }
    };

    updateRiskAnalysis();
  }, [holders, totalSupply, creatorId, tokenId, onRiskUpdate, totalHolders]);

  if (!risk) {
    return <div className="text-gray-400">Calculating risk...</div>;
  }

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

      {risk.stats && (
        <div className="mt-4 text-sm text-gray-400 space-y-1">
          <p>• Developer holds {risk.stats.devPercentage.toFixed(2)}% of supply</p>
          <p>• Top 5 holders control {risk.stats.top5Percentage.toFixed(2)}% of supply</p>
          <p>• Top 10 holders control {risk.stats.top10Percentage.toFixed(2)}% of supply</p>
        </div>
      )}
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
  console.log('Received volumeMetrics:', volumeMetrics);

  // Create a safe metrics object with fallback values
  const metrics = {
    volume24hUSD: volumeMetrics?.volume24hUSD ?? 0,
    averageDailyVolumeUSD: volumeMetrics?.averageDailyVolumeUSD ?? 0,
    tradeCount24h: volumeMetrics?.tradeCount24h ?? 0,
    buyVolumeUSD: volumeMetrics?.buyVolumeUSD ?? 0,
    sellVolumeUSD: volumeMetrics?.sellVolumeUSD ?? 0,
    buySellRatio: volumeMetrics?.buySellRatio ?? 1,
    spikeRatio: volumeMetrics?.spikeRatio ?? 1
  };

  console.log('Processed metrics:', metrics);

  return (
    <div className="terminal-card p-4">
      <h2 className="mb-4 text-sm font-medium">Volume Analysis</h2>
      <div className="space-y-2 text-sm">
        <div className="data-row">
          <span className="data-label">24h Volume</span>
          <span>{formatUSDValue(metrics.volume24hUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Avg Daily Volume</span>
          <span>{formatUSDValue(metrics.averageDailyVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">24h Trades</span>
          <span>{metrics.tradeCount24h}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Buy Volume</span>
          <span>{formatUSDValue(metrics.buyVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Sell Volume</span>
          <span>{formatUSDValue(metrics.sellVolumeUSD)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Buy/Sell Ratio</span>
          <span>{metrics.buySellRatio.toFixed(2)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Volume Trend</span>
          <span>{metrics.spikeRatio.toFixed(2)}x average</span>
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
          <Link href="/extension" className="text-muted-foreground hover:text-foreground">
            EXTENSION
          </Link>
          <Link href="/docs" className="text-muted-foreground hover:text-foreground">
            DOCS
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

// Add new interfaces for holder tracking
interface HolderPeriodData {
  period_start: string;
  period_end: string;
  total_holders: number;
  new_holders: number;
  holder_addresses: string[];
}

interface HolderGrowthMetrics {
  dailyGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    newHolders: number;
  };
  weeklyGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    newHolders: number;
  };
  retentionRate: number;
}

const saveHolderData = async (
  tokenId: string,
  data: {
    holder_count: number;
    new_holders: number;
    growth_rate: number;
    holder_addresses: string[];
  }
) => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    console.log('Saving holder data:', {
      tokenId,
      holderCount: data.holder_count,
      currentHolders: data.holder_addresses.length // Debug log
    });

    // Verify we're using the correct holder count
    const actualHolderCount = data.holder_addresses.length;
    if (actualHolderCount !== data.holder_count) {
      console.warn('Holder count mismatch:', {
        provided: data.holder_count,
        actual: actualHolderCount
      });
    }

    const { error } = await supabase
      .from('holder_history')
      .insert({
        token_id: tokenId,
        holder_count: actualHolderCount, // Use the actual count from addresses
        new_holders: data.new_holders,
        growth_rate: data.growth_rate,
        holder_addresses: data.holder_addresses,
        created_at: now.toISOString()
      });

    if (error) {
      console.error('Error saving holder data:', error);
      throw error;
    }

    console.log('Successfully saved holder data with count:', actualHolderCount);
  } catch (error) {
    console.error('Error in saveHolderData:', error);
  }
};

// Update the calculateNewHolderGrowth function to pass holder addresses
const calculateNewHolderGrowth = async (
  tokenId: string,
  currentHolders: any[]
): Promise<HolderGrowthMetrics> => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    // Get total holder count from the API response
    const totalHolderCount = currentHolders[0]?.count || currentHolders.length;
    const currentAddresses = currentHolders.map(h => h.user);

    console.log('Debug - Current holders:', {
      totalCount: totalHolderCount,
      availableAddresses: currentAddresses.length,
      addresses: currentAddresses
    });

    // Get data from 24h ago
    const { data: previousData } = await supabase
      .from('holder_history')
      .select('*')
      .eq('token_id', tokenId)
      .lte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    // If no previous data exists, use 0 as previous count
    const previousHolderCount = previousData?.[0]?.holder_count || 0;
    
    // Calculate growth using the total holder count
    const netChange = totalHolderCount - previousHolderCount;
    const growthRate = previousHolderCount > 0
      ? (netChange / previousHolderCount) * 100
      : 100;

    // Save current data with total holder count
    await saveHolderData(tokenId, {
      holder_count: totalHolderCount,
      new_holders: netChange,
      growth_rate: growthRate,
      holder_addresses: currentAddresses // Save available addresses
    });

    console.log('Debug - Growth metrics:', {
      current: totalHolderCount,
      previous: previousHolderCount,
      netChange,
      growthRate,
      availableAddresses: currentAddresses.length
    });

        return {
      dailyGrowth: {
        current: totalHolderCount,
        previous: previousHolderCount,
        growthRate: growthRate,
        newHolders: netChange
      },
      weeklyGrowth: {
        current: totalHolderCount,
        previous: previousHolderCount,
        growthRate: growthRate,
        newHolders: netChange
      },
      retentionRate: 100
    };

  } catch (error) {
    console.error('Error calculating holder growth:', error);
    return {
      dailyGrowth: { current: 0, previous: 0, growthRate: 0, newHolders: 0 },
      weeklyGrowth: { current: 0, previous: 0, growthRate: 0, newHolders: 0 },
      retentionRate: 0
    };
  }
};

// Update the HolderAnalysisComponent to show more detailed information
const HolderAnalysisComponent = ({ holderAnalysis }: { holderAnalysis: HolderGrowthMetrics }) => {
  if (!holderAnalysis) return null;

  const { dailyGrowth } = holderAnalysis;
  const isPositiveGrowth = dailyGrowth.newHolders > 0;
  const growthColor = isPositiveGrowth ? 'text-green-500' : dailyGrowth.newHolders < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="terminal-card p-4">
      <h2 className="mb-4 text-sm font-medium">Holder Analysis</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">24h Growth</h3>
          <div className="data-row">
            <span className="data-label">New Holders</span>
            <span className={growthColor}>
              {dailyGrowth.newHolders > 0 ? '+' : ''}{dailyGrowth.newHolders}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Growth Rate</span>
            <span className={growthColor}>
              {dailyGrowth.growthRate.toFixed(2)}%
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Total Holders</span>
            <span>
              {dailyGrowth.previous} → {dailyGrowth.current}
              {dailyGrowth.previous !== dailyGrowth.current && (
                <span className={`ml-2 ${growthColor}`}>
                  ({isPositiveGrowth ? '↑' : '↓'})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplify the fetchAllHoldersWithPagination function
const fetchAllHoldersWithPagination = async (tokenId: string, totalHolders: number) => {
  try {
    const response = await fetch(
      `${API_URL}/api/token/${tokenId}/owners?limit=10000000`,
      {
        headers: {
          'x-api-key': API_KEY || '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch holders:', response.status);
      return [];
    }

    const data = await response.json();
    console.log(`Fetched ${data.data?.length || 0} holders out of ${data.count}`);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching holders:', error);
    return [];
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
  const [holderAnalysis, setHolderAnalysis] = useState<HolderGrowthMetrics | null>(null);

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
      const response = await fetch(`${API_URL}/api/user/${creatorId}`, {
        headers: {
          'x-api-key': API_KEY || '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check for username in the correct path of the response
        return data.data?.username || data.username || creatorId;
      }

      return creatorId;

    } catch (error) {
      console.error('Error fetching creator data:', error);
      return creatorId;
    }
  };

  // First useEffect for fetching token data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tokenId) {
          setError('No token ID provided');
          setLoading(false);
          return;
        }

        // First get basic token data
        const response = await fetch(`${API_URL}/api/token-data/${tokenId}`, {
          headers: {
            'x-api-key': API_KEY || '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        
        // Fetch all holders in a single request
        const allHolders = await fetchAllHoldersWithPagination(tokenId, data.token.holder_count);
        
        // Update states with complete data
        setTokenData({
          ...data.token,
          volumeMetrics: data.volumeMetrics
        });
        
        setHolders(allHolders);
        setCachedHolders(allHolders);
        setBtcUsdPrice(data.btcUsdPrice);
        
        setPrice({
          btcPrice: data.price.btcPrice,
          tokenPrice: data.price.tokenPrice,
          usdPrice: data.price.usdPrice
        });
        
        setLastFetchedPrice({
          btcPrice: data.price.btcPrice,
          tokenPrice: data.price.tokenPrice,
          usdPrice: data.price.usdPrice
        });
        
        if (data.token?.creator) {
          const creatorHolder = allHolders.find(h => h.user === data.token.creator);
          if (creatorHolder?.user_username) {
            setCreatorUsername(creatorHolder.user_username);
          } else {
            const username = await fetchCreatorUsername(data.token.creator);
            setCreatorUsername(username);
          }
        } else {
          setCreatorUsername('Unknown');
        }
        
        // Calculate holder analysis with complete holder list
        const analysis = await calculateNewHolderGrowth(tokenId, allHolders);
        setHolderAnalysis(analysis);

        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [tokenId]);

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
            {tokenData.holder_count === 0 ? (
              <div>
                <div className="text-xl font-bold mb-2 text-red-600">
                  RUGGED
                </div>
                <div className="text-sm font-medium mb-2 text-red-600">
                  DANGER: Token has 0 holders
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Token has been rugged - All holders have sold
                </p>
              </div>
            ) : holders.length > 0 ? (
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
                  <span>
                    ${price?.usdPrice || '0.00000000'}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-label">Supply</span>
                  <span>
                    {formatSupply('short')} {tokenData?.ticker || ''}
                  </span>
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
            <VolumeAnalysis 
              volumeMetrics={tokenData?.volumeMetrics || {
                volume24h: 0,
                averageDailyVolume: 0,
                tradeCount24h: 0,
                buyVolume24h: 0,
                sellVolume24h: 0,
                buySellRatio: 1,
                spikeRatio: 1
              }}
              btcUsdPrice={btcUsdPrice || 0}
            />
            
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
                      // Fix balance calculation to match server
                      const adjustedBalance = Number(holder.balance) / 1e11;
                      const totalSupply = Number(tokenData.total_supply) / 1e11; // Match the same divisor
                      const percentage = (adjustedBalance / totalSupply * 100).toFixed(2);
                      
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