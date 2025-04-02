'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Filter, Bell, Settings, Info } from "lucide-react"
import TransactionFeed from "@/components/transaction-feed"
import { ActivityChart } from '@/components/charts/ActivityChart';
import { useEffect, useState } from 'react';
import { WhaleDistribution } from '@/components/WhaleDistribution';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import Image from "next/image"

interface WhaleActivity {
  buyVsSell: {
    buys: number;
    sells: number;
    totalVolume: number;
  };
  holdingsDistribution: {
    labels: string[];
    values: number[];
  };
  recentTrades: Array<{
    type: string;
    amount: number;
    price: number;
    time: string;
    user: string;
  }>;
}

interface DevActivity {
  devCommits: {
    labels: string[];
    values: number[];
  };
  recentTransfers: Array<{
    type: string;
    amount: number;
    time: string;
  }>;
}

interface Token {
  id: string;
  name: string;
  ticker: string;
  price_change_24h: number;
  volume_24h: number;
  trade_count_24h: number;
}

// Add interface for volume metrics
interface VolumeMetrics {
  volume24h: number;
  volume24hUSD: number;
  tradeCount24h: number;
  buySellRatio: number;
  buyVolume24h: number;
  sellVolume24h: number;
  buyVolumeUSD: number;
  sellVolumeUSD: number;
}

interface TokenWithVolume extends Token {
  // Keep empty for now since we have all fields in base Token interface
}

// Add interface for token price data
interface TokenPrice {
  btcPrice: number;
  tokenPrice: number;
  usdPrice: string;
}

interface TokenPrices {
  [tokenId: string]: TokenPrice;
}

// Helper functions (move to top, before any component code)
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0.0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(1);
};

const calculatePriceChange = (currentPrice: number, oldPrice: number): number => {
  if (!oldPrice || oldPrice === 0) return 0;
  const change = ((currentPrice - oldPrice) / oldPrice) * 100;
  return Math.round(change * 10) / 10;
};

// Add a constant for whale threshold (e.g., holders with > 1% of supply)
const WHALE_THRESHOLD_PERCENTAGE = 1; // 1% of total supply

interface Holder {
  user: string;
  user_username?: string;
  balance: string | number;
}

// Update the processHoldingsData function with debug logs
const processHoldingsData = (holders: Holder[], tokenPrice: number) => {
  console.log('Processing holdings data:', { holders, tokenPrice });
  
  if (!holders || holders.length === 0) {
    console.log('No holders data available');
    return { labels: [], values: [] };
  }

  const whaleHolders = holders
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 5);
    
  console.log('Top 5 whale holders:', whaleHolders);

  const result = {
    labels: whaleHolders.map(holder => holder.user_username || holder.user.slice(0, 8) + '...'),
    values: whaleHolders.map(holder => {
      const tokenAmount = Number(holder.balance) / 1e11;
      const btcValue = tokenAmount * tokenPrice;
      console.log('Processed holder:', {
        holder: holder.user_username || holder.user.slice(0, 8),
        rawBalance: holder.balance,
        tokenAmount,
        btcValue
      });
      return btcValue;
    })
  };

  console.log('Final holdings distribution:', result);
  return result;
};

// Add these new interfaces
interface DashboardData {
  tokens: TokenWithVolume[];
  prices: TokenPrices;
  whaleActivity: WhaleActivity;
  metrics: VolumeMetrics;
}

// Update the useDashboardData hook with better caching and query handling
const useDashboardData = (selectedToken: string | null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['dashboard', selectedToken],
    queryFn: async () => {
      if (!selectedToken) {
        return null;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${selectedToken}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    enabled: !!selectedToken,
    staleTime: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Add WebSocket hook
const useWebSocket = (tokenId: string | null) => {
  const queryClient = useQueryClient();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Disable WebSocket for now until endpoint is ready
    return;

    // Original WebSocket code commented out
    /*
    if (!tokenId) return;

    const connectWebSocket = async () => {
      try {
        const response = await fetch('/api/ws');
        const { wsUrl } = await response.json();
        
        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
          websocket.send(JSON.stringify({ 
            type: 'subscribe', 
            tokenId 
          }));
        };

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          queryClient.setQueryData(['dashboardData', tokenId], data);
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        setWs(websocket);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
    */
  }, [tokenId]);

  return ws;
};

// Add loading states for different sections
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-secondary/20 rounded" />
    <div className="h-48 bg-secondary/20 rounded" />
    <div className="h-96 bg-secondary/20 rounded" />
  </div>
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black backdrop-blur-3xl opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <Image 
            src="https://i.postimg.cc/L6vqgjNK/Chat-GPT-Image-Apr-2-2025-03-53-46-AM-removebg-preview.png"
            alt="OdinSniffer Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
          
          <h1 className="text-4xl font-bold text-white">
            Whale Activity
          </h1>
          
          <div className="relative inline-block">
            <span className="text-xl text-gray-300">
              Coming Soon
            </span>
            <div className="absolute -top-3 -right-8 bg-primary px-2 py-1 rounded-full text-xs font-medium">
              Soon
            </div>
          </div>
          
          <p className="text-gray-400 max-w-md mx-auto">
            Track large token movements and whale wallet activities across the Odin.fun ecosystem.
          </p>
          
          <Link 
            href="/"
            className="inline-block mt-8 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Add this new hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

