// pages/api/tokenWebhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'; // Ensure you install axios

let tokenDataCache: Record<string, any> = {}; // In-memory cache for token data

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://api.odin.fun/',
  'Origin': 'https://api.odin.fun',
};

const fetchTokenData = async (tokenId: string, retries: number = 3) => {
  const timestamp = Date.now();
  const url = `https://api.odin.fun/v1/token/${tokenId}?timestamp=${timestamp}`;

  try {
    const response = await axios.get(url, {
      headers,
    });
    return response.data; // Return the data directly
  } catch (error) {
    if (retries > 0) {
      return fetchTokenData(tokenId, retries - 1); // Retry fetching data
    }
    throw new Error('Failed to fetch token data');
  }
};

const updateTokenData = async (tokenId: string) => {
  try {
    const data = await fetchTokenData(tokenId); // Fetch data
    tokenDataCache[tokenId] = data; // Update cache only if fetch is successful
  } catch (error) {
  }
};

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tokenId } = req.query; // Get tokenId from query parameters

    if (Array.isArray(tokenId)) {
      // If multiple token IDs are provided
      await Promise.all(tokenId.map(id => updateTokenData(id))); // Update data for all token IDs
    } else {
      // If a single token ID is provided
      await updateTokenData(tokenId);
    }

    // Respond with the cached token data
    res.status(200).json(tokenDataCache);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}