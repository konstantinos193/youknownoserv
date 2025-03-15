'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminMarketsPage() {
  const [tokenId, setTokenId] = useState('');
  const [newMarket, setNewMarket] = useState({
    name: '',
    icon: '',
    pair: '',
    liquidity: 0,
    hasLiquidity: false
  });
  const [markets, setMarkets] = useState([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          market: newMarket
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add market');
      }

      // Reset form
      setNewMarket({
        name: '',
        icon: '',
        pair: '',
        liquidity: 0,
        hasLiquidity: false
      });

      // Refresh markets list
      fetchMarkets(tokenId);
    } catch (error) {
      console.error('Error adding market:', error);
    }
  };

  const fetchMarkets = async (id: string) => {
    try {
      const response = await fetch(`/api/markets?tokenId=${id}`);
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Market Management</h1>
      
      <div className="grid gap-6">
        <div className="terminal-card p-4">
          <h2 className="text-lg font-medium mb-4">Add New Market</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Token ID</label>
              <Input
                type="text"
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value);
                  fetchMarkets(e.target.value);
                }}
                placeholder="Enter token ID"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Market Name</label>
              <Input
                type="text"
                value={newMarket.name}
                onChange={(e) => setNewMarket({...newMarket, name: e.target.value})}
                placeholder="e.g., ODIN.FUN"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Icon URL</label>
              <Input
                type="text"
                value={newMarket.icon}
                onChange={(e) => setNewMarket({...newMarket, icon: e.target.value})}
                placeholder="https://example.com/favicon.ico"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Pair</label>
              <Input
                type="text"
                value={newMarket.pair}
                onChange={(e) => setNewMarket({...newMarket, pair: e.target.value})}
                placeholder="TOKEN/BTC"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Liquidity (in satoshis)</label>
              <Input
                type="number"
                value={newMarket.liquidity}
                onChange={(e) => setNewMarket({...newMarket, liquidity: Number(e.target.value)})}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMarket.hasLiquidity}
                onChange={(e) => setNewMarket({...newMarket, hasLiquidity: e.target.checked})}
              />
              <label>Has Liquidity</label>
            </div>

            <Button type="submit">Add Market</Button>
          </form>
        </div>

        <div className="terminal-card p-4">
          <h2 className="text-lg font-medium mb-4">Existing Markets</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2">Market</th>
                  <th className="text-left p-2">Pair</th>
                  <th className="text-left p-2">Liquidity</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
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
                    <td className="p-2">{market.liquidity}</td>
                    <td className="p-2">
                      <Button 
                        variant="destructive"
                        onClick={() => {/* Add delete functionality */}}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 