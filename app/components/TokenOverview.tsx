'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TokenOverviewProps {
  tokenId: string;
}

export default function TokenOverview({ tokenId }: TokenOverviewProps) {
  const [overview, setOverview] = useState({
    supply: '21M',
    marketCap: '$0.0K',
    holders: 0,
    price: '$0.000000',
    volume: '$0.0K',
    hasLiquidity: false
  });

  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    if (!tokenId) return;

    async function refreshData() {
      try {
        const timestamp = Date.now();
        
        // Fetch token data
        const tokenResponse = await fetch(`https://api.odin.fun/v1/token/${tokenId}?timestamp=${timestamp}`);
        const data = await tokenResponse.json();
        setTokenData(data);

        // Update overview data
        setOverview({
          supply: formatSupply(data.total_supply),
          marketCap: formatMarketCap(data.marketcap),
          holders: data.holder_count,
          price: formatPrice(data.price),
          volume: formatVolume(data.volume),
          hasLiquidity: data.token_liquidity > 0
        });
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
    <div className="space-y-2">
      <div className="data-row">
        <span className="data-label">Price</span>
        <span>{overview.price}</span>
      </div>
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
        <span className="data-label">LP</span>
        <span>{overview.hasLiquidity ? "Available" : "Not Available"}</span>
      </div>
    </div>
  );
} 