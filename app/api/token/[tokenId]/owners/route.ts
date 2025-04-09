import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    tokenId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const tokenId = params.tokenId;
  
  try {
    const response = await fetch(`${process.env.API_URL}/api/token/${tokenId}/owners`, {
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
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners data' },
      { status: 500 }
    );
  }
} 