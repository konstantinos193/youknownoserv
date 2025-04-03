'use client';

import Link from "next/link"
import Image from "next/image"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Search, Filter, ArrowUpDown, Menu } from "lucide-react"
import { AnalysisHistory } from "@/components/AnalysisHistory"
import { useState, useEffect, useRef } from 'react';

interface TokenData {
  id: string
  name: string
  ticker: string
  price: number
  marketcap: number
  holder_count: number
  volume: number
  price_1h: number
  btc_liquidity: number
  token_liquidity: number
  total_supply: string
  creator_balance?: string
}

async function getRecentTokens(): Promise<TokenData[]> {
  try {
    const tokens = ['2ait'] // Changed to use 2ait as example
    const tokenData = await Promise.all(
      tokens.map(async (id) => {
        try {
          const res = await fetch(`https://api.odin.fun/v1/token/${id}?timestamp=${Date.now()}`, { 
            next: { revalidate: 60 } 
          })
          if (!res.ok) return null
          return res.json()
        } catch (error) {
          console.error(`Failed to fetch token ${id}:`, error)
          return null
        }
      })
    )
    return tokenData.filter(Boolean) // Remove any null results
  } catch (error) {
    console.error('Error fetching token data:', error)
    return []
  }
}

// Add filter types
type SortOption = 'newest' | 'mcap' | 'holders' | 'price';
type RiskFilter = 'all' | 'low' | 'high';

// Add these helper functions at the top of the file
interface RiskLevel {
  level: string;
  color: string;
  message: string;
  warning?: string;
}

const calculateRiskLevel = (token: TokenData): RiskLevel => {
  // Special case for platform token (2ait)
  if (token.id === '2ait') {
    return {
      level: "LOW RISK",
      color: "text-green-500",
      message: "Platform token with verified distribution.",
      warning: "VERIFIED: Official platform token"
    };
  }

  // Check for critical issues first
  if (token.btc_liquidity === 0 || token.token_liquidity === 0) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "No liquidity available - High manipulation risk",
      warning: "DANGER: No liquidity"
    };
  }

  if (token.holder_count < 10) {
    return {
      level: "VERY HIGH RISK",
      color: "text-red-500",
      message: "Very low holder count - Major price manipulation risk",
      warning: "WARNING: Few holders"
    };
  }

  // Calculate dev percentage if we have the data
  const totalSupplyNum = Number(token.total_supply);
  let devPercentage = 0;
  
  if (token.creator_balance && totalSupplyNum) {
    devPercentage = (Number(token.creator_balance) / totalSupplyNum) * 100;
    
    // Match the risk levels from results/page.tsx
    if (devPercentage >= 50) {
      return {
        level: "EXTREME RISK",
        color: "text-red-600",
        message: "Extremely high centralization. High probability of price manipulation.",
        warning: "DANGER: Developer holds majority"
      };
    } else if (devPercentage >= 30) {
      return {
        level: "VERY HIGH RISK",
        color: "text-red-500",
        message: "Very high centralization detected. Major price manipulation risk.",
        warning: "WARNING: High dev holdings"
      };
    } else if (devPercentage >= 20) {
      return {
        level: "HIGH RISK",
        color: "text-orange-500",
        message: "High holder concentration. Exercise extreme caution.",
        warning: "CAUTION: Significant dev holdings"
      };
    } else if (devPercentage >= 10) {
      return {
        level: "MODERATE RISK",
        color: "text-yellow-500",
        message: "Moderate centralization risks present. Trade carefully.",
        warning: "NOTICE: Moderate dev holdings"
      };
    } else if (devPercentage >= 5) {
      return {
        level: "ELEVATED RISK",
        color: "text-yellow-400",
        message: "Slightly elevated concentration risks. Monitor closely.",
        warning: "INFO: Elevated dev holdings"
      };
    } else if (devPercentage >= 2) {
      return {
        level: "GUARDED RISK",
        color: "text-blue-400",
        message: "Low centralization risks, but remain vigilant.",
        warning: "SAFE: Limited dev holdings"
      };
    }
  }

  // Default case for well-distributed tokens
  return {
    level: "LOW RISK",
    color: "text-green-500",
    message: "Healthy token distribution detected.",
    warning: "GOOD: Well distributed"
  };
};

export default function Home() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch("/tokens.json");
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      }
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-blue-950 overflow-hidden">
      <header className="border-b border-blue-800 w-full relative bg-blue-900">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Image 
                src="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png"
                alt="Token Detective Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              Token Detective
            </Link>
          </div>
        
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <nav className={`hidden md:flex items-center space-x-4 text-sm`}>
            <Link href="/" className="text-blue-300 hover:text-blue-100">HOME</Link>
            <Link href="/tokens" className="text-blue-400/80 hover:text-blue-200">TOKENS</Link>
            <div className="relative">
              <span className="text-blue-400/50 cursor-not-allowed">WHALE ACTIVITY</span>
              <div className="absolute -top-3 -right-8 bg-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                Soon
              </div>
            </div>
          </nav>
          <button 
  onClick={() => window.location.href = "https://odin.fun/token/2e7t"}
  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700"
>
  Buy Token Detective
</button>

        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`fixed inset-0 bg-blue-950 bg-opacity-75 transition-opacity z-50 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <nav ref={menuRef} className="fixed right-0 top-0 w-64 h-full bg-blue-900 p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-xl z-60" style={{ transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
              <div>
                <Link href="/" className="block text-blue-300 hover:text-blue-100 mb-2">HOME</Link>
                <Link href="/tokens" className="block text-blue-400/80 hover:text-blue-200 mb-2">TOKENS</Link>
                <div className="relative inline-block text-blue-400/50 cursor-not-allowed mb-2">
                  WHALE ACTIVITY
                  <div className="absolute -top-3 -right-8 bg-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                    Soon
                  </div>
                </div>
              </div>
              <button disabled className="bg-blue-600/50 text-blue-200/70 px-3 py-1 rounded-md text-sm font-semibold cursor-not-allowed mb-4 w-full text-center">
                Buy Token Detective
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="container px-4 py-8 flex-1 flex flex-col items-center max-w-full w-full">
        <div className="max-w-[489px] w-full space-y-4 sm:space-y-8">
          <div className="space-y-1 sm:space-y-2 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">Token Analysis</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter an Odin.fun token URL to analyze its risk profile
            </p>
          </div>
          <div className="bg-black p-4 rounded-md border border-blue-800 w-full">
            <form 
              action="/results" 
              method="get"
              className="space-y-2 sm:space-y-4"
            >
              <div className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Enter token URL or ID (e.g. 2jjj)"
                  className="flex-1 bg-black border-blue-600 focus:border-blue-400 font-mono text-sm sm:text-base text-white"
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

