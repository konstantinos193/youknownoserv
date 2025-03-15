import { NextResponse } from 'next/server';

const formatPrice = (price: number): string => {
  if (price >= 1) {
    return price.toFixed(4);
  } else if (price >= 0.0001) {
    return price.toFixed(6);
  } else if (price >= 0.00000001) {
    return price.toFixed(8);
  } else {
    return price.toExponential(8);
  }
};

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://api.odin.fun/',
  'Origin': 'https://api.odin.fun',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  try {
    // Fetch BTC price
    console.log('Fetching BTC price...');
    const btcResponse = await fetch('https://mempool.space/api/v1/prices');
    if (!btcResponse.ok) {
      throw new Error(`BTC price fetch failed: ${btcResponse.status}`);
    }
    const btcData = await btcResponse.json();
    const btcPrice = btcData.USD;
    console.log('BTC price:', btcPrice);

    // Fetch token data from ODIN API with headers
    console.log('Fetching token data for:', tokenId);
    const tokenResponse = await fetch(`https://api.odin.fun/v1/token/${tokenId}`, {
      headers: headers
    });
    if (!tokenResponse.ok) {
      throw new Error(`Token data fetch failed: ${tokenResponse.status}`);
    }
    const tokenData = await tokenResponse.json();
    console.log('Token price:', tokenData.price);
    
    // Calculate USD price
    const usdPrice = (tokenData.price / 1000000000000) * btcPrice;
    console.log('Calculated USD price:', usdPrice);

    return NextResponse.json({
      btcPrice,
      tokenPrice: tokenData.price,
      usdPrice: formatPrice(usdPrice)
    });
  } catch (error) {
    console.error('Price webhook detailed error:', {
      message: error.message,
      stack: error.stack,
      tokenId
    });
    return NextResponse.json({ 
      error: 'Failed to fetch price data',
      details: error.message 
    }, { status: 500 });
  }
} 