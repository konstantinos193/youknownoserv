import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;
  
  try {
    const response = await fetch(`${process.env.API_URL}/api/token/${tokenId}/trades`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trades data' },
      { status: 500 }
    );
  }
} 