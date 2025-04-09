export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  token: (tokenId: string) => `${API_BASE_URL}/api/token/${tokenId}`,
  tokenData: (tokenId: string) => `${API_BASE_URL}/api/token-data/${tokenId}`,
  tokenMetrics: (tokenId: string) => `${API_BASE_URL}/api/token-metrics/${tokenId}`,
  allTokens: `${API_BASE_URL}/api/all-tokens`,
  trendingTokens: `${API_BASE_URL}/tokens/trending`,
  btcPrice: `${API_BASE_URL}/btc-price`,
  whaleActivity: (tokenId: string) => `${API_BASE_URL}/api/whale-activity/${tokenId}`,
  dashboard: (tokenId: string) => `${API_BASE_URL}/api/dashboard/${tokenId}`,
}; 