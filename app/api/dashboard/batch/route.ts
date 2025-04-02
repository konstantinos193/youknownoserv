import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get tokenIds from URL
    const { searchParams } = new URL(request.url);
    const tokenIds = JSON.parse(searchParams.get('tokenIds') || '[]');

    if (!tokenIds.length) {
      return NextResponse.json({ error: 'No token IDs provided' }, { status: 400 });
    }

    // Fetch data for each token in parallel
    const tokenPromises = tokenIds.map(async (tokenId: string) => {
      const [tokenData, tokenMetrics, holders] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/${tokenId}`).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/${tokenId}/metrics`).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/${tokenId}/owners`).then(res => res.json())
      ]);

      // Process whale activity
      const whaleActivity = {
        buyVsSell: {
          buys: tokenMetrics.buyVolume24h || 0,
          sells: tokenMetrics.sellVolume24h || 0,
          totalVolume: tokenMetrics.volume24h || 0,
        },
        holdingsDistribution: {
          labels: holders.data.slice(0, 5).map((h: any) => h.user_username || h.user.slice(0, 8) + '...'),
          values: holders.data.slice(0, 5).map((h: any) => Number(h.balance) || 0),
        },
        recentTrades: tokenData.trades?.slice(0, 10).map((t: any) => ({
          type: t.buy ? 'buy' : 'sell',
          amount: Number(t.amount_btc) / 1e11,
          price: Number(t.price_btc) / 1e11,
          time: t.time,
          user: t.user_username || t.user.slice(0, 8) + '...',
        })) || [],
      };

      return {
        id: tokenId,
        name: tokenData.name,
        ticker: tokenData.ticker,
        price_change_24h: tokenData.price_change_24h || 0,
        volume_24h: tokenMetrics.volume24h || 0,
        volumeMetrics: tokenMetrics,
        whaleActivity,
      };
    });

    const tokens = await Promise.all(tokenPromises);

    return NextResponse.json({
      tokens,
      whaleActivity: tokens[0]?.whaleActivity || null,
      prices: tokens.reduce((acc, token) => ({
        ...acc,
        [token.id]: {
          btcPrice: token.volumeMetrics.price || 0,
          tokenPrice: token.volumeMetrics.price || 0,
          usdPrice: (token.volumeMetrics.price * (token.volumeMetrics.btcUsdPrice || 0)).toFixed(2),
        },
      }), {}),
    });
  } catch (error) {
    console.error('Error in dashboard batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}