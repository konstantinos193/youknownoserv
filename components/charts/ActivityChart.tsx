'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, ChartData, ChartOptions } from 'chart.js/auto';

export interface ActivityData {
  type: string;
  value: number;
  label: string;
}

interface ActivityChartProps {
  type: 'buyVsSell' | 'cumulativeActivity' | 'devCommits' | 'walletActivity';
  data: {
    buys?: number[];
    sells?: number[];
    labels?: string[];
    values?: number[];
    totalVolume?: number;
  };
}

export function ActivityChart({ type, data }: ActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    let chartConfig: ChartConfiguration;

    switch (type) {
      case 'buyVsSell':
        chartConfig = {
          type: 'doughnut',
          data: {
            labels: ['Buys', 'Sells'],
            datasets: [{
              data: [data.buys?.[0] || 0, data.sells?.[0] || 0],
              backgroundColor: ['#22c55e', '#ef4444'],
              borderColor: ['#16a34a', '#dc2626'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#e5e7eb'
                }
              }
            }
          }
        };
        break;

      case 'cumulativeActivity':
        chartConfig = {
          type: 'line',
          data: {
            labels: data.labels || [],
            datasets: [
              {
                label: 'Buys',
                data: data.buys || [],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true
              },
              {
                label: 'Sells',
                data: data.sells || [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(229, 231, 235, 0.1)'
                },
                ticks: {
                  color: '#e5e7eb'
                }
              },
              x: {
                grid: {
                  color: 'rgba(229, 231, 235, 0.1)'
                },
                ticks: {
                  color: '#e5e7eb'
                }
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#e5e7eb'
                }
              }
            }
          }
        };
        break;

      case 'devCommits':
      case 'walletActivity':
        chartConfig = {
          type: 'bar',
          data: {
            labels: data.labels || [],
            datasets: [{
              label: type === 'devCommits' ? 'Commits' : 'Transfers',
              data: data.values || [],
              backgroundColor: '#3b82f6',
              borderColor: '#2563eb',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(229, 231, 235, 0.1)'
                },
                ticks: {
                  color: '#e5e7eb'
                }
              },
              x: {
                grid: {
                  color: 'rgba(229, 231, 235, 0.1)'
                },
                ticks: {
                  color: '#e5e7eb'
                }
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#e5e7eb'
                }
              }
            }
          }
        };
        break;
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, chartConfig);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);

  return (
    <div className="w-full h-full min-h-[200px] relative">
      <canvas ref={chartRef} />
    </div>
  );
} 