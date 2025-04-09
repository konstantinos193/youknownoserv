import { API_ENDPOINTS } from "@/lib/config/api";

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
    totalHolders: number;
    activeHolders: number;
  };
}

export const fetchTokenHolders = async (tokenId: string, creatorId: string): Promise<HoldersResponse> => {
  try {
    // Convert tokenId to array and encode for URL
    const tokenIds = encodeURIComponent(JSON.stringify([tokenId]));
    
    console.log('Fetching holders for token:', tokenId);
    
    const response = await fetch(`/api/proxy?path=/api/batch-holders?tokenIds=${tokenIds}`, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://odinscan.fun',
        'Referer': 'https://odinscan.fun/'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holders: ${response.status}`);
    }

    const data = await response.json();
    
    // If we got an error response from the proxy
    if (data.error) {
      throw new Error(data.error);
    }

    // Log the number of holders received
    if (data[tokenId]) {
      console.log(`Received ${data[tokenId].holders.length} holders for token ${tokenId}`);
      console.log(`Total holders: ${data[tokenId].totalHolders}, Active holders: ${data[tokenId].activeHolders}`);
    }
    
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