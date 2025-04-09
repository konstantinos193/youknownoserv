// Use proxy route to avoid mixed content issues
export const API_BASE_URL = '/api/proxy?path=';

export const API_ENDPOINTS = {
  // Token endpoints
  token: (tokenId: string) => `${API_BASE_URL}/api/token/${tokenId}`,
  tokenOwners: (tokenId: string) => `${API_BASE_URL}/api/token/${tokenId}/owners`,
  tokenTrades: (tokenId: string) => `${API_BASE_URL}/api/token/${tokenId}/trades`,
  tokenData: (tokenId: string) => `${API_BASE_URL}/api/token-data/${tokenId}`,
  tokenMetrics: (tokenId: string) => `${API_BASE_URL}/api/token-metrics/${tokenId}`,
  
  // Price endpoints
  price: (tokenId: string) => `${API_BASE_URL}/api/price?tokenId=${tokenId}`,
  btcPrice: `${API_BASE_URL}/btc-price`,
  
  // User endpoints
  user: (userId: string) => `${API_BASE_URL}/api/user/${userId}`,
  userCreated: (userId: string) => `${API_BASE_URL}/api/user/${userId}/created`,
  userTokens: (userId: string) => `${API_BASE_URL}/api/user/${userId}/tokens`,
  
  // Activity endpoints
  whaleActivity: (tokenId: string) => `${API_BASE_URL}/api/whale-activity/${tokenId}`,
  
  // List endpoints
  trending: `${API_BASE_URL}/tokens/trending`,
  allTokens: `${API_BASE_URL}/api/all-tokens`,
  dashboard: (tokenId: string) => `${API_BASE_URL}/api/dashboard/${tokenId}`,
}; 