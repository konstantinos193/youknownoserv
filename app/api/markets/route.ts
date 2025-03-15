import { NextResponse } from 'next/server';
import { Market } from '@/types/market';

// This is a mock database - replace with your actual database
let markets: { [tokenId: string]: Market[] } = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  return NextResponse.json(markets[tokenId] || []);
}

export async function POST(request: Request) {
  const { tokenId, market } = await request.json();

  if (!tokenId || !market) {
    return NextResponse.json({ error: 'Token ID and market data are required' }, { status: 400 });
  }

  if (!markets[tokenId]) {
    markets[tokenId] = [];
  }

  markets[tokenId].push(market);
  return NextResponse.json(markets[tokenId]);
} 