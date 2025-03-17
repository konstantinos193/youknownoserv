import { fetchWithRetry } from './fetchWithRetry';

export const fetchCreatorTokens = async (creatorId: string) => {
  try {
    // Use the local API endpoint from .env
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user/${creatorId}/created`;
    const response = await fetchWithRetry(url);
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching creator tokens:', error);
    return [];
  }
};