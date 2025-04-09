import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { tokenId: string } }) {
  try {
    const response = await fetch(`${process.env.API_URL}/api/token/${params.tokenId}`, {
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