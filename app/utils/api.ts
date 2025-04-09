// API endpoints
export const API_BASE_URL = 'http://deape.ddns.net:3001';

export interface Holder {
  user: string;
  user_username?: string;
  balance: string;
  percentage?: number;
}

interface HoldersResponse {
  [tokenId: string]: {
    holders: Holder[];
    totalHolders?: number;
    activeHolders?: number;
  };
}

export const fetchTokenHolders = async (tokenId: string, creatorId: string): Promise<HoldersResponse> => {
  try {
    // Convert tokenId to array and encode for URL
    const tokenIds = encodeURIComponent(JSON.stringify([tokenId]));
    
    const response = await fetch(`${API_BASE_URL}/api/batch-holders?tokenIds=${tokenIds}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holders: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching holders:', error);
    // Return empty holders array with proper typing
    return {
      [tokenId]: {
        holders: [],
        totalHolders: 0,
        activeHolders: 0
      }
    };
  }
}; 