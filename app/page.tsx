"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Menu, Shield, Activity, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MobileNav from "@/components/mobile-nav"
import { useMediaQuery } from "@/hooks/use-media-query"
import { API_ENDPOINTS } from "@/lib/config/api"

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

export default function Home() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true)
        const [tokensResponse, trendingResponse, btcPriceResponse] = await Promise.all([
          fetch(API_ENDPOINTS.allTokens),
          fetch(API_ENDPOINTS.trendingTokens),
          fetch(API_ENDPOINTS.btcPrice)
        ]);

        const [tokensData, trendingData, btcPriceData] = await Promise.all([
          tokensResponse.json(),
          trendingResponse.json(),
          btcPriceResponse.json()
        ]);

        if (tokensData && tokensData.data) {
          setTokens(tokensData.data);
        }
      } catch (error) {
        console.error("Error fetching tokens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      window.location.href = `/results?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="w-full py-3 sm:py-4 bg-black border-b border-cyan-600/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="mr-2 sm:mr-3">
                <Image
                  src="https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png"
                  alt="ODINSCAN Logo"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-300">ODINSCAN</h1>
                <div className="text-[10px] sm:text-xs text-cyan-400">Token Explorer</div>
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-900 border border-cyan-600/30"
                title="Home"
              >
                <Shield className="h-4 w-4 text-cyan-400" />
              </Link>
              <Link
                href="/tokens"
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-900 border border-cyan-600/30"
                title="Tokens"
              >
                <Activity className="h-4 w-4 text-cyan-400" />
              </Link>
              <div
                className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-900 border border-cyan-600/10 cursor-not-allowed"
                title="Whale Activity (Coming Soon)"
              >
                <Waves className="h-4 w-4 text-cyan-400/40" />
                <div className="absolute -top-1 -right-1 bg-yellow-300 text-black px-1 py-0.5 rounded-full text-[8px] font-bold">
                  SOON
                </div>
              </div>
              <Link
                href={process.env.NEXT_PUBLIC_BUY_URL || "https://odin.fun"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-8 sm:h-9 px-2 sm:px-3 rounded-full bg-cyan-500 text-black font-medium text-xs"
              >
                BUY
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden text-cyan-500"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12 md:py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-cyan-950/30 to-gray-900 z-0"></div>

        {/* Animated Norse runes - hidden on mobile */}
        <div className="absolute top-20 left-1/4 w-8 h-8 text-cyan-400/20 animate-pulse z-0 hidden sm:block">ᚨ</div>
        <div
          className="absolute top-40 right-1/3 w-8 h-8 text-yellow-300/20 animate-pulse z-0 hidden sm:block"
          style={{ animationDelay: "1s" }}
        >
          ᚱ
        </div>
        <div
          className="absolute bottom-1/3 left-1/5 w-8 h-8 text-cyan-400/20 animate-pulse z-0 hidden sm:block"
          style={{ animationDelay: "1.5s" }}
        >
          ᚦ
        </div>
        <div
          className="absolute bottom-40 right-1/4 w-8 h-8 text-yellow-300/20 animate-pulse z-0 hidden sm:block"
          style={{ animationDelay: "0.5s" }}
        >
          ᚷ
        </div>

        {/* Decorative light beams */}
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-cyan-400/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-64 bg-yellow-300/5 blur-3xl rounded-full"></div>

        {/* Animated particles - reduced on mobile */}
        <div
          className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-cyan-400/40 animate-ping hidden sm:block"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-yellow-300/40 animate-ping hidden sm:block"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-2/3 w-2 h-2 rounded-full bg-cyan-400/40 animate-ping hidden sm:block"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>

        {/* Norse-inspired decorative lines */}
        <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
        <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent"></div>

        <div className="max-w-3xl w-full space-y-6 sm:space-y-8 md:space-y-12 relative z-10 px-3 sm:px-0">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="inline-block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-yellow-300/20 rounded-lg blur"></div>
              <h1 className="relative text-2xl sm:text-3xl md:text-5xl font-bold text-yellow-300 px-3 sm:px-4 py-2">
                Odin Token Analysis
              </h1>
            </div>
            <p className="text-base sm:text-lg text-cyan-400/80 max-w-xl mx-auto">
              Analyze any Odin.fun token for risk assessment and detailed metrics
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-cyan-600/30 shadow-lg shadow-cyan-500/10 max-w-xl mx-auto w-full relative overflow-hidden group">
            {/* Animated border effect on hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 rounded-xl transition-all duration-500"></div>

            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t border-l border-cyan-400/30 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t border-r border-cyan-400/30 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b border-l border-cyan-400/30 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b border-r border-cyan-400/30 rounded-br-lg"></div>

            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4 relative">
              <h2 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-1 sm:mb-2 flex items-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cyan-400" />
                Token Analysis
              </h2>
              <p className="text-xs sm:text-sm text-cyan-400/70 mb-2 sm:mb-4">
                Enter an Odin.fun token URL or ID to analyze its risk profile
              </p>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter token URL or ID (e.g. 2jjj)"
                  className="flex-1 bg-black/50 border-cyan-600/30 focus:border-cyan-500 font-mono text-yellow-200 text-sm"
                  required
                />
                <Button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-yellow-300/0 group-hover:bg-yellow-300/20 transition-all duration-300"></div>
                  <Search className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Analyze</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-12">
            <FeatureCard
              title="Risk Assessment"
              description="Get detailed risk analysis of any token with our proprietary algorithm"
              icon={<Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />}
            />
            <FeatureCard
              title="Token Metrics"
              description="View comprehensive metrics including liquidity, holders, and market cap"
              icon={<Activity className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />}
            />
            <FeatureCard
              title="Whale Tracking"
              description="Coming soon: Monitor large transactions and whale activity"
              icon={<Waves className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400/40" />}
              soon={true}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-600/20 py-4 sm:py-6 bg-black">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="flex justify-center items-center mb-3 sm:mb-4">
            <Image
              src="https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png"
              alt="ODINSCAN Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <span className="ml-2 text-yellow-300 font-semibold">ODINSCAN</span>
          </div>
          <p className="text-cyan-400/60 text-xs sm:text-sm">© 2023 ODINSCAN. All rights reserved.</p>
          <p className="mt-1 sm:mt-2 text-cyan-400/60 text-xs sm:text-sm">
            ODINSCAN is not financial advice. Always do your own research.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
  soon = false,
}: {
  title: string
  description: string
  icon: React.ReactNode
  soon?: boolean
}) {
  return (
    <div className="bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-cyan-600/20 hover:border-cyan-600/40 transition-all relative group overflow-hidden">
      {/* Animated highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-yellow-300/0 group-hover:from-cyan-400/10 group-hover:to-yellow-300/10 transition-all duration-500"></div>

      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

      <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg bg-black/50 border border-cyan-600/20 group-hover:border-cyan-400/40 transition-colors relative overflow-hidden">
        {/* Icon glow effect on hover */}
        <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-all duration-300 rounded-lg"></div>
        {icon}
      </div>

      <div className="relative">
        <h3 className="text-base sm:text-lg font-semibold text-yellow-300 mb-1 sm:mb-2">{title}</h3>
        {soon && (
          <div className="absolute -top-3 -right-3 bg-yellow-300 text-black px-1.5 py-0.5 rounded-full text-[10px] font-medium">
            Soon
          </div>
        )}
      </div>
      <p className="text-cyan-400/70 text-xs sm:text-sm">{description}</p>
    </div>
  )
}
