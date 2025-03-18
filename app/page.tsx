import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { AnalysisHistory } from "@/components/AnalysisHistory"
import { useState } from 'react';
import Image from "next/image"
import AdContainer from "@/components/ad-container"

interface TokenData {
  id: string
  name: string
  ticker: string
  price: number
  marketcap: number
  holder_count: number
  volume: number
  price_1h: number
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

export default async function Home() {
  const recentTokens = await getRecentTokens()

  return (
    <div className="min-h-screen font-mono flex flex-col items-center" style={{ backgroundColor: '#000000' }}>
      <header className="border-b border-border w-full relative" style={{ backgroundColor: '#000000' }}>
        <div className="container flex h-14 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 text-base sm:text-lg font-semibold">
              <Image 
                src="/Logo.png"
                alt="Odinsmash Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              ODINSMASH
            </Link>
            <nav className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
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
          <Link 
            href="https://odin.fun/token/2ait"
            className="bg-yellow-500 text-black px-3 py-1 rounded-md animate-pulse hover:bg-yellow-600 text-xs sm:text-sm font-semibold"
          >
            Buy ODINSMASH
          </Link>
        </div>
      </header>
      <main className="container px-2 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col items-center" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-[489px] w-full space-y-4 sm:space-y-8">
          <div className="space-y-1 sm:space-y-2 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">Token Analysis</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter an Odin.fun token URL to analyze its risk profile
            </p>
          </div>
          <div className="terminal-card p-3 sm:p-6 space-y-4 sm:space-y-6 backdrop-blur-sm bg-card/80 w-full">
            <form 
              action="/results" 
              method="get"
              className="space-y-2 sm:space-y-4"
            >
              <div className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Enter token URL or ID (e.g. 2ait)"
                  className="flex-1 bg-secondary border-border font-mono text-sm sm:text-base"
                  required
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-32 w-full max-w-[489px] flex justify-center">
          <AdContainer />
        </div>
      </main>
    </div>
  )
}

