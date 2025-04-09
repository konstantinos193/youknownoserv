import type { Holder } from "./api";

interface Token {
  id: string;
  name: string;
  ticker: string;
  price: number;
  marketcap: number;
  volume: number;
  holder_count: number;
  created_time: string;
  creator: string;
  total_supply: string;
  creator_balance?: string;
  creator_tokens_count?: number;
}

interface RiskAssessment {
  level: string;
  color: string;
  message: string;
  warning: string;
  stats?: {
    devPercentage: number;
    top5Percentage: number;
    top10Percentage: number;
  };
}

// List of trusted developers that get special risk assessment
const TRUSTED_DEVELOPERS = [
  'vv5jb-7sm7u-vn3nq-6nflf-dghis-fd7ji-cx764-xunni-zosog-eqvpw-oae'
];

export const calculateRiskLevel = (
  token: Token,
  holders?: Holder[],
  validatedHolderCount?: number
): RiskAssessment => {
  // Special case for platform token
  if (token.id === "2ait") {
    return {
      level: "LOW RISK",
      color: "text-green-500",
      message: "Platform token with verified distribution.",
      warning: "VERIFIED: Official platform token",
    };
  }

  // Use validated holder count if provided, otherwise use token's holder_count
  const holderCount = validatedHolderCount ?? token.holder_count;

  // Check for zero holders first
  if (holderCount === 0) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Token appears to be abandoned",
      warning: "DANGER: No active holders found",
    };
  }

  // Check for multiple tokens by creator (if not trusted)
  if (!TRUSTED_DEVELOPERS.includes(token.creator) && token.creator_tokens_count && token.creator_tokens_count > 1) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "High risk of abandonment - Developer creates multiple tokens",
      warning: `DANGER: Developer has created ${token.creator_tokens_count} tokens`,
    };
  }

  // Calculate percentages if we have holder data
  const totalSupplyNum = Number(token.total_supply);
  let devPercentage = 0;
  let top5Percentage = 0;
  let top10Percentage = 0;

  // Check if developer has sold their position
  const devHolder = holders?.find(h => h.user === token.creator);
  const devBalance = devHolder ? Number(devHolder.balance) : Number(token.creator_balance || '0');
  
  if (devBalance === 0) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Developer has abandoned the token",
      warning: `DANGER: Developer has sold their entire position (${holderCount} holders)`,
      stats: { devPercentage: 0, top5Percentage, top10Percentage }
    };
  }

  // Calculate holder percentages
  if (holders && holders.length > 0 && totalSupplyNum) {
    const sortedHolders = [...holders].sort((a, b) => Number(b.balance) - Number(a.balance));
    
    // Calculate dev percentage
    devPercentage = (devBalance / totalSupplyNum) * 100;

    // Calculate top holder percentages
    const top5Holdings = sortedHolders.slice(0, 5).reduce((sum, h) => sum + Number(h.balance), 0);
    const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, h) => sum + Number(h.balance), 0);
    
    top5Percentage = (top5Holdings / totalSupplyNum) * 100;
    top10Percentage = (top10Holdings / totalSupplyNum) * 100;
  }

  // Risk assessment based on holder concentration
  if (devPercentage >= 50 || top5Percentage >= 70) {
    return {
      level: "EXTREME RISK",
      color: "text-red-600",
      message: "Extremely high centralization",
      warning: `DANGER: High concentration (Dev: ${devPercentage.toFixed(1)}% | Top 5: ${top5Percentage.toFixed(1)}%)`,
      stats: { devPercentage, top5Percentage, top10Percentage }
    };
  }

  if (devPercentage >= 30 || top5Percentage >= 50) {
    return {
      level: "VERY HIGH RISK",
      color: "text-red-500",
      message: "Very high centralization",
      warning: `WARNING: High concentration (Dev: ${devPercentage.toFixed(1)}% | Top 5: ${top5Percentage.toFixed(1)}%)`,
      stats: { devPercentage, top5Percentage, top10Percentage }
    };
  }

  if (devPercentage >= 20 || top5Percentage >= 40) {
    return {
      level: "HIGH RISK",
      color: "text-orange-500",
      message: "High holder concentration",
      warning: `CAUTION: Notable concentration (Dev: ${devPercentage.toFixed(1)}% | Top 5: ${top5Percentage.toFixed(1)}%)`,
      stats: { devPercentage, top5Percentage, top10Percentage }
    };
  }

  // Risk based on holder count
  if (holderCount < 3) {
    return {
      level: "VERY HIGH RISK",
      color: "text-red-500",
      message: "Very low holder count",
      warning: `WARNING: Only ${holderCount} holders`,
      stats: { devPercentage, top5Percentage, top10Percentage }
    };
  }

  if (holderCount < 5) {
    return {
      level: "HIGH RISK",
      color: "text-orange-500",
      message: "Low holder count",
      warning: `CAUTION: Only ${holderCount} holders`,
      stats: { devPercentage, top5Percentage, top10Percentage }
    };
  }

  // Default case for well-distributed tokens
  return {
    level: "LOW RISK",
    color: "text-green-500",
    message: "Healthy token distribution",
    warning: `GOOD: Well distributed (${holderCount} holders)`,
    stats: { devPercentage, top5Percentage, top10Percentage }
  };
}; 