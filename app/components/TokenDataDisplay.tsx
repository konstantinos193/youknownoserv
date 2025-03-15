'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState, useEffect } from 'react';

interface TokenDataDisplayProps {
  tokenId: string;
}

export default function TokenDataDisplay({ tokenId }: TokenDataDisplayProps) {
  const [overview, setOverview] = useState({
    supply: '21M',
    marketCap: '$0.0K',
    holders: 0,
    price: '$0.000000',
    volume: '$0.0K'
  });

  const [holders, setHolders] = useState<any[]>([]);
  const [totalPercentage, setTotalPercentage] = useState('0.00');
  const [creatorRisk, setCreatorRisk] = useState({ isRisky: false, tokenCount: 0 });

  useEffect(() => {
    if (!tokenId) return;

    async function refreshData() {
      try {
        const timestamp = Date.now();
        
        // Fetch token data
        const tokenResponse = await fetch(`https://api.odin.fun/v1/token/${tokenId}?timestamp=${timestamp}`);
        const tokenData = await tokenResponse.json();

        // Update overview data
        setOverview({
          supply: formatSupply(tokenData.total_supply),
          marketCap: formatMarketCap(tokenData.marketcap),
          holders: tokenData.holder_count,
          price: formatPrice(tokenData.price),
          volume: formatVolume(tokenData.volume)
        });

        // Fetch and update holders data
        const holdersResponse = await fetch(`https://api.odin.fun/v1/token/${tokenId}/owners?timestamp=${timestamp}`);
        const holdersData = await holdersResponse.json();
        
        if (Array.isArray(holdersData)) {
          const processedData = calculateHolderInfo(holdersData);
          setHolders(processedData.holders);
          setTotalPercentage(processedData.totalPercentage);
        }

        // Check creator risk
        if (tokenData.creator) {
          const creatorResponse = await fetch(`https://api.odin.fun/v1/user/${tokenData.creator}/created?timestamp=${timestamp}`);
          const creatorData = await creatorResponse.json();
          setCreatorRisk({
            isRisky: creatorData.count > 1,
            tokenCount: creatorData.count
          });
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }

    // Initial load
    refreshData();

    // Set up interval for refreshing
    const interval = setInterval(refreshData, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [tokenId]);

  return (
    <div className="min-h-screen bg-background font-mono">
      <main className="container px-4 py-8">
        <div className="space-y-4">
          {/* Token Overview section */}
          <div className="terminal-card p-4">
            <h2 className="mb-4 text-sm font-medium">Token Overview</h2>
            <div className="space-y-2">
              <div className="data-row">
                <span className="data-label">Supply</span>
                <span>{overview.supply}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Market Cap</span>
                <span>{overview.marketCap}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Holders</span>
                <span>{overview.holders.toLocaleString()}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Price</span>
                <span>{overview.price}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Volume</span>
                <span>{overview.volume}</span>
              </div>
            </div>
          </div>

          {/* Top Holders section */}
          <div className="terminal-card p-4 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium">Top Holders</h2>
              <span className="font-mono">{totalPercentage}%</span>
            </div>
            <table className="w-full">
              {/* ... table content ... */}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 