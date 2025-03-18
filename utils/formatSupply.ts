export const formatSupply = (format: 'full' | 'short' = 'short'): string => {
  return format === 'full' ? '21,000,000' : '21M';
};