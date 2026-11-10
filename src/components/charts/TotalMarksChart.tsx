import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TestEntry, CategoryFilter } from '../../types';
import { filterTests, sortTestsByDate, getTestTotal } from '../../utils/calculations';
import { Target } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  tests: TestEntry[];
  selectedCategory: CategoryFilter;
}

export const TotalMarksChart: React.FC<Props> = ({ tests, selectedCategory }) => {
  const filtered = filterTests(tests, selectedCategory);
  const sorted = sortTestsByDate(filtered, true);

  if (sorted.length === 0) {
    return null;
  }

  const labels = sorted.map(t => {
    const d = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${t.name} (${d})`;
  });

  const obtainedData = sorted.map(t => getTestTotal(t).obtained);
  const totalMaxData = sorted.map(t => getTestTotal(t).total);

  const data = {
    labels,
    datasets: [
      {
        label: 'Marks Obtained',
        data: obtainedData,
        backgroundColor: '#6366f1', // indigo-500
        borderRadius: 6,
        barPercentage: 0.55,
      },
      {
        label: 'Max Possible Marks',
        data: totalMaxData,
        backgroundColor: '#e2e8f0', // slate-200
        borderRadius: 6,
        barPercentage: 0.55,
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
          label: function(context: TooltipItem<'bar'>) {
            const index = context.dataIndex;
            const test = sorted[index];
            const tot = getTestTotal(test);
            if (context.datasetIndex === 0) {
              return ` Score: ${tot.obtained} / ${tot.total} marks (${tot.percentage}%)`;
            }
            return ` Maximum Marks: ${tot.total}`;
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
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748b',
          callback: (value: string | number) => `${value}m`,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Total Marks Progression
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test score vs maximum paper marks
          </p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
