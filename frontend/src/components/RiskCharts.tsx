'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface RiskChartsProps {
  chartData: {
    age_impact: number;
    bp_impact: number;
    sugar_impact: number;
    hr_impact: number;
  };
  riskScore: number;
}

export default function RiskCharts({ chartData, riskScore }: RiskChartsProps) {
  const pieData = {
    labels: ['Age', 'Heart Rate', 'Systolic BP', 'Blood Sugar'],
    datasets: [
      {
        data: [
          chartData.age_impact,
          chartData.hr_impact,
          chartData.bp_impact,
          chartData.sugar_impact,
        ],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#fbbf24'],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div>
      <div className="h-48">
        <Pie data={pieData} options={pieOptions} />
      </div>
      <div className="flex flex-wrap gap-4 mt-5 justify-center text-xs text-slate-500">
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
          Age: {chartData.age_impact}%
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
          Heart Rate: {chartData.hr_impact}%
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
          Systolic BP: {chartData.bp_impact}%
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
          Blood Sugar: {chartData.sugar_impact}%
        </div>
      </div>
    </div>
  );
}

