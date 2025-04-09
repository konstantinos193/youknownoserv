import { useState } from "react"
import Link from "next/link"

interface Holder {
  user: string
  user_username?: string
  balance: string
  pnl?: number
}

interface Token {
  id: string
  creator: string
  total_supply: string
}

// Helper function to format PnL values
const formatPnL = (value: number): string => {
  // For values under $10,000, show exact amount
  if (Math.abs(value) < 10000) {
    return `$${value.toFixed(2)}`;
  }
  // For larger values, use K/M formatting
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(2)}K`;
}

interface TopHoldersProps {
  holders: Holder[]
  tokenData: Token
  loading?: boolean
}

export const TopHolders = ({ holders, tokenData, loading = false }: TopHoldersProps) => {
  return (
    <div className="bg-gray-900/50 border border-cyan-600/20 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-yellow-300 mb-4">Top Holders</h2>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        </div>
      ) : holders.length > 0 ? (
        <div className="space-y-3">
          {holders.slice(0, 5).map((holder, index) => {
            // Calculate percentage of total supply
            const totalSupply = Number(tokenData.total_supply)
            const holderBalance = Number(holder.balance)
            const percentage = totalSupply > 0 ? ((holderBalance / totalSupply) * 100).toFixed(2) : "0.00"
            const isDeveloper = holder.user === tokenData.creator

            return (
              <div
                key={holder.user}
                className="flex justify-between items-center py-2 border-b border-cyan-600/10"
              >
                <div className="flex items-center">
                  <span className="text-cyan-400/80 mr-2">{index + 1}.</span>
                  <Link
                    href={`https://odin.fun/user/${holder.user}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    {holder.user_username || holder.user.substring(0, 8)}
                    {isDeveloper && <span className="ml-2 text-red-500 text-xs">(Dev)</span>}
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400">{percentage}%</span>
                  <span className={typeof holder.pnl === 'number' ? (holder.pnl >= 0 ? "text-green-500" : "text-red-500") : "text-gray-500"}>
                    {typeof holder.pnl === 'number' ? (holder.pnl >= 0 ? "+" : "") + formatPnL(holder.pnl) : "N/A"}
                  </span>
                </div>
              </div>
            )
          })}

          <div className="mt-4 text-xs text-cyan-400/70 italic">
            Showing top 5 holders with their percentage of total supply and profit/loss.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-gray-900/80 border border-cyan-600/20">
          <p className="text-cyan-400/80">No holder data available.</p>
        </div>
      )}
    </div>
  )
}

export default TopHolders 