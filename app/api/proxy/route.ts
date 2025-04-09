import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://deape.ddns.net:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    // Get all search params except 'path'
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        queryParams.append(key, value);
      }
    });

    // Construct the full URL
    const queryString = queryParams.toString();
    const fullUrl = `${API_BASE}${path}${queryString ? (path.includes('?') ? '&' : '?') + queryString : ''}`;

    console.log('Proxying request to:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://odinscan.fun',
        'Referer': 'https://odinscan.fun/'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `API request failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If the response indicates an error, maintain the error structure
    if (data && data.error) {
      return NextResponse.json(data, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 