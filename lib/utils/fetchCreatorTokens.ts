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

// Mock API for demonstration purposes
export async function fetchCreatorTokens(creatorId: string): Promise<Token[]> {
  // In a real app, this would be an API call
  // For demo, we'll return mock data
  return [
    {
      id: "token1",
      name: "Token 1",
      ticker: "TKN1",
      price: 0.0001,
      marketcap: 10000,
      volume: 5000,
      holder_count: 100,
      created_time: "2023-01-01T00:00:00Z",
      creator: creatorId,
      total_supply: "100000000000",
      btc_liquidity: 0.5,
      token_liquidity: 50000,
    },
    {
      id: "token2",
      name: "Token 2",
      ticker: "TKN2",
      price: 0.0002,
      marketcap: 20000,
      volume: 10000,
      holder_count: 200,
      created_time: "2023-01-02T00:00:00Z",
      creator: creatorId,
      total_supply: "200000000000",
      btc_liquidity: 1.0,
      token_liquidity: 100000,
    },
  ]
}
