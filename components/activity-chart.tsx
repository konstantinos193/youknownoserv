"use client"

import { useEffect, useRef, useState } from "react"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface ActivityChartProps {
  type: "buyVsSell" | "holdingsDistribution" | "cumulativeActivity" | "devCommits" | "contractDeployments"
  data: any
}

const HOLDER_COLORS = [
  '#FF6B6B',  // Red
  '#4ECDC4',  // Teal
  '#45B7D1',  // Blue
  '#96CEB4',  // Green
  '#6C757D'   // Gray (for Others)
];

export default function ActivityChart({ type, data }: ActivityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw chart based on type
    switch (type) {
      case "buyVsSell":
        drawBuyVsSellChart(ctx, canvas.width, canvas.height, data)
        break
      case "holdingsDistribution":
        drawHoldingsDistributionChart(ctx, canvas.width, canvas.height, data)
        break
      case "cumulativeActivity":
        drawCumulativeActivityChart(ctx, canvas.width, canvas.height, data)
        break
      case "devCommits":
        drawDevCommitsChart(ctx, canvas.width, canvas.height, data)
        break
      case "contractDeployments":
        drawContractDeploymentsChart(ctx, canvas.width, canvas.height, data)
        break
    }
  }, [type, data])

  // Buy vs Sell Donut Chart
  const drawBuyVsSellChart = (ctx: CanvasRenderingContext2D, width: number, height: number, data: any) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20
    const innerRadius = radius * 0.6

    // Draw buy portion (green)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * (data.buys / 100))
    ctx.lineTo(centerX, centerY)
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)"
    ctx.fill()
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw sell portion (red)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, Math.PI * 2 * (data.buys / 100), Math.PI * 2)
    ctx.lineTo(centerX, centerY)
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    ctx.fillStyle = "#111"
    ctx.fill()

    // Draw text
    ctx.fillStyle = "#fff"
    ctx.font = "bold 16px IBM Plex Mono"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${data.buys}%`, centerX, centerY - 10)
    ctx.font = "12px IBM Plex Mono"
    ctx.fillText("Buys", centerX, centerY + 10)

    // Draw volume
    ctx.font = "10px IBM Plex Mono"
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.fillText(`Total Volume: ${data.totalVolume}`, centerX, height - 10)

    // Draw legend
    const legendY = height - 40

    // Buy legend
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)"
    ctx.fillRect(20, legendY, 12, 12)
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
    ctx.lineWidth = 1
    ctx.strokeRect(20, legendY, 12, 12)
    ctx.fillStyle = "#fff"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "left"
    ctx.fillText("Buys", 40, legendY + 6)

    // Sell legend
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
    ctx.fillRect(80, legendY, 12, 12)
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
    ctx.lineWidth = 1
    ctx.strokeRect(80, legendY, 12, 12)
    ctx.fillStyle = "#fff"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "left"
    ctx.fillText("Sells", 100, legendY + 6)
  }

  // Holdings Distribution Pie Chart
  const drawHoldingsDistributionChart = (ctx: CanvasRenderingContext2D, width: number, height: number, data: any) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20

    let startAngle = 0
    const colors = [
      "rgba(184, 134, 11, 0.7)",
      "rgba(0, 255, 0, 0.7)",
      "rgba(255, 0, 0, 0.7)",
      "rgba(0, 100, 255, 0.7)",
      "rgba(150, 150, 150, 0.7)",
    ]

    // Draw pie slices
    data.values.forEach((value: number, index: number) => {
      const sliceAngle = Math.PI * 2 * (value / 100)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.lineTo(centerX, centerY)
      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw label if slice is big enough
      if (value > 5) {
        const labelAngle = startAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

        ctx.fillStyle = "#fff"
        ctx.font = "bold 10px IBM Plex Mono"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${value}%`, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // Draw legend
    const legendY = height - 80
    data.labels.forEach((label: string, index: number) => {
      const rowY = legendY + index * 15

      ctx.fillStyle = colors[index % colors.length]
      ctx.fillRect(20, rowY, 12, 12)
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.strokeRect(20, rowY, 12, 12)

      ctx.fillStyle = "#fff"
      ctx.font = "10px IBM Plex Mono"
      ctx.textAlign = "left"
      ctx.fillText(`${label} (${data.values[index]}%)`, 40, rowY + 6)
    })
  }

  // Cumulative Activity Line Chart
  const drawCumulativeActivityChart = (ctx: CanvasRenderingContext2D, width: number, height: number, data: any) => {
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw x-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "center"

    const xStep = chartWidth / (data.labels.length - 1)
    data.labels.forEach((label: string, index: number) => {
      const x = padding.left + index * xStep
      ctx.fillText(label, x, height - padding.bottom + 15)
    })

    // Draw y-axis labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const maxValue = Math.max(...data.buys, ...data.sells) * 1.2
    const yStep = chartHeight / 4

    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      const value = ((maxValue * i) / 4).toFixed(1)
      ctx.fillText(`${value}M`, padding.left - 5, y)
    }

    // Draw grid lines
    ctx.beginPath()
    for (let i = 1; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw buy line
    ctx.beginPath()
    data.buys.forEach((value: number, index: number) => {
      const x = padding.left + index * xStep
      const y = height - padding.bottom - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area under buy line
    ctx.lineTo(padding.left + (data.buys.length - 1) * xStep, height - padding.bottom)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.fillStyle = "rgba(0, 255, 0, 0.1)"
    ctx.fill()

    // Draw sell line
    ctx.beginPath()
    data.sells.forEach((value: number, index: number) => {
      const x = padding.left + index * xStep
      const y = height - padding.bottom - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Fill area under sell line
    ctx.lineTo(padding.left + (data.sells.length - 1) * xStep, height - padding.bottom)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)"
    ctx.fill()

    // Draw legend
    const legendY = padding.top + 10

    // Buy legend
    ctx.beginPath()
    ctx.moveTo(padding.left + 20, legendY)
    ctx.lineTo(padding.left + 40, legendY)
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = "#fff"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "left"
    ctx.fillText("Buys", padding.left + 45, legendY)

    // Sell legend
    ctx.beginPath()
    ctx.moveTo(padding.left + 80, legendY)
    ctx.lineTo(padding.left + 100, legendY)
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = "#fff"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "left"
    ctx.fillText("Sells", padding.left + 105, legendY)
  }

  // Dev Commits Bar Chart
  const drawDevCommitsChart = (ctx: CanvasRenderingContext2D, width: number, height: number, data: any) => {
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Find max value for scaling
    const maxValue = Math.max(...data.values) * 1.2

    // Draw y-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const yStep = chartHeight / 4
    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      const value = Math.round((maxValue * i) / 4)
      ctx.fillText(value.toString(), padding.left - 5, y)
    }

    // Draw grid lines
    ctx.beginPath()
    for (let i = 1; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw bars
    const barWidth = chartWidth / data.values.length
    const barPadding = barWidth * 0.2

    data.values.forEach((value: number, index: number) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding.left + index * barWidth + barPadding
      const y = height - padding.bottom - barHeight

      // Draw bar
      ctx.fillStyle = "rgba(184, 134, 11, 0.7)"
      ctx.fillRect(x, y, barWidth - barPadding * 2, barHeight)

      // Draw bar border
      ctx.strokeStyle = "rgba(184, 134, 11, 1)"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth - barPadding * 2, barHeight)

      // Draw value if bar is tall enough
      if (barHeight > 20) {
        ctx.fillStyle = "#fff"
        ctx.font = "10px IBM Plex Mono"
        ctx.textAlign = "center"
        ctx.fillText(value.toString(), x + (barWidth - barPadding * 2) / 2, y + 10)
      }
    })

    // Draw x-axis labels (only show some to avoid crowding)
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    const labelStep = Math.ceil(data.labels.length / 5)
    data.labels.forEach((label: number, index: number) => {
      if (index % labelStep === 0 || index === data.labels.length - 1) {
        const x = padding.left + index * barWidth + barWidth / 2
        ctx.fillText(label.toString(), x, height - padding.bottom + 5)
      }
    })

    // Draw title
    ctx.fillStyle = "#fff"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "center"
    ctx.fillText("Daily Commits (Last 30 Days)", width / 2, padding.top / 2)
  }

  // Contract Deployments Bar Chart
  const drawContractDeploymentsChart = (ctx: CanvasRenderingContext2D, width: number, height: number, data: any) => {
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Find max value for scaling
    const maxValue = Math.max(...data.values) * 1.2

    // Draw y-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const yStep = chartHeight / 4
    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      const value = Math.round((maxValue * i) / 4)
      ctx.fillText(value.toString(), padding.left - 5, y)
    }

    // Draw grid lines
    ctx.beginPath()
    for (let i = 1; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw bars
    const barWidth = chartWidth / data.values.length
    const barPadding = barWidth * 0.2

    data.values.forEach((value: number, index: number) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding.left + index * barWidth + barPadding
      const y = height - padding.bottom - barHeight

      // Draw gradient bar
      const gradient = ctx.createLinearGradient(x, y, x, height - padding.bottom)
      gradient.addColorStop(0, "rgba(0, 255, 0, 0.7)")
      gradient.addColorStop(1, "rgba(0, 255, 0, 0.3)")
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - barPadding * 2, barHeight)

      // Draw bar border
      ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth - barPadding * 2, barHeight)

      // Draw value
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px IBM Plex Mono"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + (barWidth - barPadding * 2) / 2, y - 10)
    })

    // Draw x-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "10px IBM Plex Mono"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    data.labels.forEach((label: string, index: number) => {
      const x = padding.left + index * barWidth + barWidth / 2
      ctx.fillText(label, x, height - padding.bottom + 5)
    })
  }

  if (!isClient) {
    return <div className="relative h-[200px] bg-secondary/20 animate-pulse rounded-md"></div>;
  }

  if (type === 'holdingsDistribution' && data?.labels?.length > 0) {
    return (
      <div className="relative h-[200px]">
        <Pie
          data={{
            labels: data.labels.map(label => `${label} (${((data.values[data.labels.indexOf(label)] / data.values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`),
            datasets: [{
              data: data.values,
              backgroundColor: [
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96CEB4',
                '#EEEEEE'
              ],
              borderWidth: 0
            }]
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 8,
                  padding: 8,
                  font: {
                    size: 10
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    return `${value.toFixed(2)} BTC`;
                  }
                }
              }
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

