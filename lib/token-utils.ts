export interface TokenData {
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

export interface RiskLevel {
  level: string
  color: string
  message: string
  warning?: string
}

export const calculateRiskLevel = (token: TokenData): RiskLevel => {
  // Special case for platform token (2ait)
  if (token.id === "2ait") {
    return {
      level: "LOW RISK",
      color: "text-green-500",
      message: "Platform token with verified distribution.",
      warning: "VERIFIED: Official platform token",
    }
  }

  // Check for critical issues first
  if (token.btc_liquidity === 0 || token.token_liquidity === 0) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "No liquidity available - High manipulation risk",
      warning: "DANGER: No liquidity",
    }
  }

  if (token.holder_count < 10) {
    return {
      level: "VERY HIGH RISK",
      color: "text-red-500",
      message: "Very low holder count - Major price manipulation risk",
      warning: "WARNING: Few holders",
    }
  }

  // Calculate dev percentage if we have the data
  const totalSupplyNum = Number(token.total_supply)
  let devPercentage = 0

  if (token.creator_balance && totalSupplyNum) {
    devPercentage = (Number(token.creator_balance) / totalSupplyNum) * 100

    if (devPercentage >= 50) {
      return {
        level: "EXTREME RISK",
        color: "text-red-600",
        message: "Extremely high centralization. High probability of price manipulation.",
        warning: "DANGER: Developer holds majority",
      }
    } else if (devPercentage >= 30) {
      return {
        level: "VERY HIGH RISK",
        color: "text-red-500",
        message: "Very high centralization detected. Major price manipulation risk.",
        warning: "WARNING: High dev holdings",
      }
    } else if (devPercentage >= 20) {
      return {
        level: "HIGH RISK",
        color: "text-orange-500",
        message: "High holder concentration. Exercise extreme caution.",
        warning: "CAUTION: Significant dev holdings",
      }
    } else if (devPercentage >= 10) {
      return {
        level: "MODERATE RISK",
        color: "text-yellow-500",
        message: "Moderate centralization risks present. Trade carefully.",
        warning: "NOTICE: Moderate dev holdings",
      }
    } else if (devPercentage >= 5) {
      return {
        level: "ELEVATED RISK",
        color: "text-yellow-400",
        message: "Slightly elevated concentration risks. Monitor closely.",
        warning: "INFO: Elevated dev holdings",
      }
    } else if (devPercentage >= 2) {
      return {
        level: "GUARDED RISK",
        color: "text-blue-400",
        message: "Low centralization risks, but remain vigilant.",
        warning: "SAFE: Limited dev holdings",
      }
    }
  }

  // Default case for well-distributed tokens
  return {
    level: "LOW RISK",
    color: "text-green-500",
    message: "Healthy token distribution detected.",
    warning: "GOOD: Well distributed",
  }
}

export async function getRecentTokens(): Promise<TokenData[]> {
  try {
    const tokens = ["2ait"] // Changed to use 2ait as example
    const tokenData = await Promise.all(
      tokens.map(async (id) => {
        try {
          const res = await fetch(`https://api.odin.fun/v1/token/${id}?timestamp=${Date.now()}`, {
            next: { revalidate: 60 },
          })
          if (!res.ok) return null
          return res.json()
        } catch (error) {
          console.error(`Failed to fetch token ${id}:`, error)
          return null
        }
      }),
    )
    return tokenData.filter(Boolean) // Remove any null results
  } catch (error) {
    console.error("Error fetching token data:", error)
    return []
  }
}
