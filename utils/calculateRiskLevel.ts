export const calculateRiskLevel = (token: any): RiskAssessment => {
    // Calculate percentages
    const devHolder = token.holders?.data?.find(h => h.user === token.creator);
    const devHoldings = devHolder ? Number(devHolder.balance) : 0;
    const totalSupply = Number(token.total_supply);
    
    console.log('Dev Holdings:', devHoldings);
    
    const devPercentage = (devHoldings / totalSupply) * 100;
    console.log('Dev Percentage:', devPercentage);
  
    const sortedHolders = [...(token.holders?.data || [])]
      .sort((a, b) => Number(b.balance) - Number(a.balance));
  
    const top5Holdings = sortedHolders
      .slice(0, 5)
      .reduce((sum, h) => sum + Number(h.balance), 0);
    
    const top10Holdings = sortedHolders
      .slice(0, 10)
      .reduce((sum, h) => sum + Number(h.balance), 0);
  
    const top5Percentage = (top5Holdings / totalSupply) * 100;
    const top10Percentage = (top10Holdings / totalSupply) * 100;
  
    // Determine risk level
    if (devPercentage >= 50 || top5Percentage >= 70) {
      return {
        level: "EXTREME RISK",
        color: "text-red-600",
        message: "Extremely high centralization. High probability of price manipulation.",
        warning: `Dev: ${devPercentage.toFixed(2)}% | Top 5: ${top5Percentage.toFixed(2)}%`,
        dangers: [`Developer holds ${devPercentage.toFixed(2)}% of supply`]
      };
    }
  
    if (devPercentage >= 30 || top5Percentage >= 50) {
      return {
        level: "VERY HIGH RISK",
        color: "text-red-500",
        message: "Very high centralization detected. Major price manipulation risk.",
        warning: `Dev: ${devPercentage.toFixed(2)}% | Top 5: ${top5Percentage.toFixed(2)}%`,
        dangers: [`Developer holds ${devPercentage.toFixed(2)}% of supply`]
      };
    }
  
    if (devPercentage >= 20 || top5Percentage >= 40) {
      return {
        level: "HIGH RISK",
        color: "text-orange-500",
        message: "High holder concentration. Exercise extreme caution.",
        warning: `Dev: ${devPercentage.toFixed(2)}% | Top 5: ${top5Percentage.toFixed(2)}%`,
        dangers: []
      };
    }
  
    if (devPercentage >= 10 || top5Percentage >= 30) {
      return {
        level: "MODERATE RISK",
        color: "text-yellow-500",
        message: "Moderate centralization risks present. Trade carefully.",
        warning: `Dev: ${devPercentage.toFixed(2)}% | Top 5: ${top5Percentage.toFixed(2)}%`,
        dangers: []
      };
    }
  
    return {
      level: "LOW RISK",
      color: "text-green-500",
      message: "Healthy token distribution detected.",
      warning: `Dev: ${devPercentage.toFixed(2)}% | Top 5: ${top5Percentage.toFixed(2)}%`,
      dangers: []
    };
  };
  
  interface RiskAssessment {
    level: string;
    color: string;
    message: string;
    warning: string;
    dangers: string[];
  }