import { NextResponse } from 'next/server';

interface TokenResponse {
  id: string;
  name: string;
  ticker: string;
  price_change_24h?: number;
  volume?: number;
  trade_count_24h?: number;
}

export async function GET() {
  try {
    // Use our local server API endpoint from .env
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tokens/trending`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // Validate that we received an array
    if (!Array.isArray(rawData)) {
      console.error('Invalid API response format:', rawData);
      throw new Error('Invalid API response format');
    }

    // Transform and validate each token
    const transformedData = {
      data: rawData.map((token: TokenResponse) => ({
        id: token.id || 'unknown',
        name: token.name || 'Unknown Token',
        ticker: token.ticker || 'N/A',
        price_change_24h: typeof token.price_change_24h === 'number' ? token.price_change_24h : 0,
        volume_24h: typeof token.volume === 'number' ? token.volume : 0,
        volumeMetrics: {
          tradeCount24h: typeof token.trade_count_24h === 'number' ? token.trade_count_24h : 0
        }
      }))
      .filter(token => token.id !== 'unknown') // Remove invalid tokens
    };

    console.log('API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      dataLength: transformedData.data.length,
      sampleToken: transformedData.data[0]
    });

    return NextResponse.json(transformedData);
  } catch (error: unknown) {
    console.error('Error in /api/tokens:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to fetch tokens', 
        message: errorMessage,
        data: { data: [] } // Return empty data array on error
      },
      { status: 500 }
    );
  }
} 