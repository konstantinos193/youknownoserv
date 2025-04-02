'use client';

import { ActivityChart } from './charts/ActivityChart';

interface WhaleDistributionProps {
  isLoading: boolean;
  whaleActivity: any;
  formatUsdValue: (value: number) => string;
}

export function WhaleDistribution({ isLoading, whaleActivity, formatUsdValue }: WhaleDistributionProps) {
  return (
    <div className="bg-black/80 backdrop-blur-sm border border-border rounded-sm p-4">
      <h3 className="text-sm font-medium mb-3">Whale Holdings Distribution</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-secondary/20" />
            <div className="mt-4 w-32 h-4 bg-secondary/20 rounded" />
          </div>
        </div>
      ) : whaleActivity?.holdingsDistribution ? (
        <ActivityChart
          type="pie"
          data={{
            labels: whaleActivity.holdingsDistribution.labels,
            values: whaleActivity.holdingsDistribution.values
          }}
          formatValue={formatUsdValue}
        />
      ) : (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No whale data available
        </div>
      )}
    </div>
  );
} 