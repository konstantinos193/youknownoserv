'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface ActivityChartProps {
  type: 'pie' | 'bar'; // Add more types as needed
  data: {
    labels: string[];
    values: number[];
  };
  formatValue: (value: number) => string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ type, data, formatValue }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156 163 175)',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return ` ${context.label}: ${formatValue(value)}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[300px] flex items-center justify-center">
      {type === 'pie' ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div>Other chart types can be implemented here.</div>
      )}
    </div>
  );
};

export default ActivityChart; 