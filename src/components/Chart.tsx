'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartOptions,
} from 'chart.js';
import { Doughnut, Radar, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface MetricsData {
  commitFrequency: number;
  codeQuality: number;
  projectDiversity: number;
  contributionImpact: number;
}

interface ChartProps {
  metrics: MetricsData;
  chartType?: 'doughnut' | 'radar' | 'bar';
  height?: number;
  width?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showTitle?: boolean;
  title?: string;
  customColors?: string[];
  animationDuration?: number;
}

export default function Chart({
  metrics,
  chartType = 'radar',
  height,
  width,
  className = '',
  showLegend = true,
  showTooltip = true,
  showTitle = false,
  title = 'GitHub Metrics Analysis',
  customColors,
  animationDuration = 1000,
}: ChartProps) {
  const chartRef = useRef<ChartJS>(null);
  
  const defaultColors = [
    'rgba(59, 130, 246, 0.8)', // Blue
    'rgba(139, 92, 246, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(249, 115, 22, 0.8)',  // Orange
  ];
  
  const colors = customColors || defaultColors;
  
  const labels = [
    'Commit Frequency',
    'Code Quality',
    'Project Diversity',
    'Contribution Impact'
  ];
  
  const values = [
    metrics.commitFrequency * 100,
    metrics.codeQuality * 100,
    metrics.projectDiversity * 100,
    metrics.contributionImpact * 100
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Score',
        data: values,
        backgroundColor: chartType === 'radar' 
          ? colors[0].replace('0.8', '0.2')
          : colors,
        borderColor: chartType === 'radar' ? colors[0] : colors,
        borderWidth: 2,
        pointBackgroundColor: colors[0],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[0],
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'doughnut' | 'radar' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          font: {
            family: 'var(--font-geist-sans)',
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'var(--font-geist-sans)',
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: 'var(--font-geist-sans)',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        caretSize: 6,
      },
      title: {
        display: showTitle,
        text: title,
        font: {
          family: 'var(--font-geist-sans)',
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    animation: {
      duration: animationDuration,
      easing: 'easeOutQuart',
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
    } : undefined,
  };

  if (chartType === 'radar') {
    options.scales = {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(128, 128, 128, 0.2)',
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.2)',
        },
        pointLabels: {
          font: {
            family: 'var(--font-geist-sans)',
            size: 12,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
      },
    };
  }

  useEffect(() => {
    // Apply animations or other effects when chart mounts
    return () => {
      // Cleanup if needed
    };
  }, []);

  const renderChart = () => {
    switch (chartType) {
      case 'doughnut':
        return <Doughnut data={data} options={options} height={height} width={width} />
      case 'bar':
        return <Bar data={data} options={options} height={height} width={width} />
      case 'radar':
      default:
        return <Radar data={data} options={options} height={height} width={width} />
    }
  };

  return (
    <div className={`chart-container ${className}`} style={{ height: height || '100%', width: width || '100%' }}>
      {renderChart()}
    </div>
  );
}