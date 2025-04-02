import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params;

    // Fetch from our backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/${tokenId}/owners`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holders: ${response.status}`);
    }

    const data = await response.json();
    
    // Get total supply and calculate total held balance
    const totalSupply = Number(data.total_supply) || 0;
    const sortedHolders = (data.data || [])
      .sort((a: any, b: any) => Number(b.balance) - Number(a.balance));

    const topHolders = sortedHolders.slice(0, 4).map(holder => ({
      user: holder.user,
      user_username: holder.user_username || holder.user.slice(0, 8) + '...',
      balance: Number(holder.balance),
      percentage: (Number(holder.balance) / totalSupply) * 100
    }));

    // Calculate others
    const othersBalance = sortedHolders
      .slice(4)
      .reduce((sum: number, holder: any) => sum + Number(holder.balance), 0);

    const processedHolders = [
      ...topHolders,
      ...(othersBalance > 0 ? [{
        user: 'Others',
        user_username: 'Others',
        balance: othersBalance,
        percentage: (othersBalance / totalSupply) * 100
      }] : [])
    ];

    return NextResponse.json({
      holders: processedHolders,
      total_supply: totalSupply
    });
  } catch (error) {
    console.error('Error fetching holders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch holders data',
        holders: [],
        total_supply: 0 
      }, 
      { status: 500 }
    );
  }
} 