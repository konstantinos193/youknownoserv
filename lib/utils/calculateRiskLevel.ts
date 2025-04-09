interface Token {
  id: string
  name: string
  ticker: string
  price: number
  marketcap: number
  volume: number
  holder_count: number
  created_time: string
  creator: string
  total_supply: string
  btc_liquidity: number
  token_liquidity: number
  creator_balance?: string
}

interface RiskAssessment {
  level: string
  color: string
  message: string
  warning: string
}

export const calculateRiskLevel = (token: Token): RiskAssessment => {
  // Special case for platform token
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

  // Check if developer has sold position
  if (token.creator_balance === "0") {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Developer has sold their entire position",
      warning: "DANGER: Developer has sold their entire position",
    }
  }

  // Default case for well-distributed tokens
  return {
    level: "SAFE",
    color: "text-green-500",
    message: "Healthy token distribution detected.",
    warning: "GOOD: Well distributed",
  }
}
