import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TestEntry, CategoryFilter } from '../../types';
import { filterTests, sortTestsByDate, getSubjectPercentage } from '../../utils/calculations';
import { TrendingUp, Percent, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  tests: TestEntry[];
  selectedCategory: CategoryFilter;
}

export const SubjectTrendChart: React.FC<Props> = ({ tests, selectedCategory }) => {
  const [metric, setMetric] = useState<'marks' | 'percentage'>('percentage');

  const filtered = filterTests(tests, selectedCategory);
  const sorted = sortTestsByDate(filtered, true);

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
        <p className="font-medium text-slate-700">No test data available for this category</p>
        <p className="text-xs text-slate-400 mt-1">Add tests or select another category to view subject progression</p>
      </div>
    );
  }

  const labels = sorted.map(t => {
    const d = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${t.name} (${d})`;
  });

  const physicsData = sorted.map(t => 
    metric === 'percentage' ? getSubjectPercentage(t.physics) : Number(t.physics.obtained)
  );

  const chemistryData = sorted.map(t => 
    metric === 'percentage' ? getSubjectPercentage(t.chemistry) : Number(t.chemistry.obtained)
  );

  const mathsData = sorted.map(t => 
    metric === 'percentage' ? getSubjectPercentage(t.maths) : Number(t.maths.obtained)
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Physics',
        data: physicsData,
        borderColor: '#4f46e5', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderWidth: 2.5,
        tension: 0.3,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Chemistry',
        data: chemistryData,
        borderColor: '#059669', // emerald-600
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        borderWidth: 2.5,
        tension: 0.3,
        pointBackgroundColor: '#059669',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Mathematics',
        data: mathsData,
        borderColor: '#e11d48', // rose-600
        backgroundColor: 'rgba(225, 29, 72, 0.08)',
        borderWidth: 2.5,
        tension: 0.3,
        pointBackgroundColor: '#e11d48',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            weight: 600,
            size: 12,
          },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          weight: 'bold' as const,
          size: 13,
        },
        bodyFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 12,
        },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const index = context.dataIndex;
            const test = sorted[index];
            const datasetIndex = context.datasetIndex;
            let subject = 'Physics';
            let score = test.physics;
            if (datasetIndex === 1) {
              subject = 'Chemistry';
              score = test.chemistry;
            } else if (datasetIndex === 2) {
              subject = 'Mathematics';
              score = test.maths;
            }

            const pct = getSubjectPercentage(score);
            return ` ${subject}: ${score.obtained}/${score.total} marks (${pct}%)`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748b',
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        max: metric === 'percentage' ? 100 : undefined,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748b',
          callback: (value: string | number) => metric === 'percentage' ? `${value}%` : `${value}m`,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Subject-wise Marks Progression
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Physics, Chemistry & Maths progression across {sorted.length} {sorted.length === 1 ? 'test' : 'tests'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMetric('percentage')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              metric === 'percentage'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Percentage (%)
          </button>
          <button
            type="button"
            onClick={() => setMetric('marks')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              metric === 'marks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Raw Marks
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
