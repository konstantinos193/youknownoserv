import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/btc-price`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch BTC price: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/btc-price:', error);
    return NextResponse.json({ error: 'Failed to fetch BTC price' }, { status: 500 });
  }
} 