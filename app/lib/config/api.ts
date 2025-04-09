// API Configuration
export const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL || 'https://odin.fun';

export interface APIEndpoints {
  token: (id: string) => string;
  tokenOwners: (id: string) => string;
  tokenTrades: (id: string) => string;
  tokenData: (id: string) => string;
  tokenMetrics: (id: string) => string;
  holdersPnL: (id: string) => string;
  price: (id: string) => string;
  whaleActivity: (id: string) => string;
  tokenAnalysis: (id: string) => string;
  allTokens: () => string;
  trending: () => string;
  btcPrice: () => string;
  user: (id: string) => string;
  userTokens: (id: string) => string;
  userActivity: (id: string) => string;
  dashboard: (id: string) => string;
}

// Create the endpoints object
const endpoints: APIEndpoints = {
  // Base endpoints
  token: (id: string) => `/api/token/${id}`,
  tokenOwners: (id: string) => `/api/token/${id}/owners`,
  tokenTrades: (id: string) => `/api/token/${id}/trades`,
  tokenData: (id: string) => `/api/token-data/${id}`,
  tokenMetrics: (id: string) => `/api/token-metrics/${id}`,
  holdersPnL: (id: string) => `/api/token/${id}/holders-pnl`,
  price: (id: string) => `/api/price?tokenId=${id}`,
  whaleActivity: (id: string) => `/api/whale-activity/${id}`,
  tokenAnalysis: (id: string) => `/api/token-analysis/${id}`,
  allTokens: () => `/api/all-tokens`,
  trending: () => `/api/tokens/trending`,
  btcPrice: () => `/api/btc-price`,
  user: (id: string) => `/api/user/${id}`,
  userTokens: (id: string) => `/api/user/${id}/tokens`,
  userActivity: (id: string) => `/api/user/${id}/activity`,
  dashboard: (id: string) => `/api/dashboard/${id}`
};

// Export the endpoints object
export const API_ENDPOINTS = endpoints;

// Export buy URL helper
export const buyUrl = (id: string): string => `${BUY_URL}/token/${id}`; 