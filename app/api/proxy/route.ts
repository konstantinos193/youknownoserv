import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://deape.ddns.net:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://odinscan.fun',
        'Referer': 'https://odinscan.fun/'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 