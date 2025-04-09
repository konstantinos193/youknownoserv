import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { tokenId: string } }
) {
  const tokenId = context.params.tokenId;
  
  try {
    const response = await fetch(`${process.env.API_URL}/api/token/${tokenId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    );
  }
} 