import React, { useState } from 'react';
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
import { TestEntry } from '../../types';
import { getCategorySummaries, filterTests } from '../../utils/calculations';
import { Layers } from 'lucide-react';

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
}

export const CategoryComparisonChart: React.FC<Props> = ({ tests }) => {
  const [viewMode, setViewMode] = useState<'avg_pct' | 'avg_marks' | 'total_marks'>('avg_pct');

  if (tests.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
        <Layers className="w-10 h-10 text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">Category-wise Subject Breakdown</p>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Once you log your test marks, this graph will compare Physics, Chemistry, and Mathematics performance across Milestone Main/Adv and AITS Main/Adv.
        </p>
      </div>
    );
  }

  const summaries = getCategorySummaries(tests);

  // Calculate cumulative total marks scored in each subject for each category
  const categoryStats = summaries.map(cat => {
    const catTests = filterTests(tests, cat.key);
    let totalP = 0;
    let totalC = 0;
    let totalM = 0;
    let totalOverall = 0;
    let maxOverall = 0;

    catTests.forEach(t => {
      totalP += Number(t.physics.obtained) || 0;
      totalC += Number(t.chemistry.obtained) || 0;
      totalM += Number(t.maths.obtained) || 0;
      totalOverall += (Number(t.physics.obtained) || 0) + (Number(t.chemistry.obtained) || 0) + (Number(t.maths.obtained) || 0);
      maxOverall += (Number(t.physics.total) || 0) + (Number(t.chemistry.total) || 0) + (Number(t.maths.total) || 0);
    });

    return {
      ...cat,
      cumPhysics: Math.round(totalP * 10) / 10,
      cumChemistry: Math.round(totalC * 10) / 10,
      cumMaths: Math.round(totalM * 10) / 10,
      cumOverall: Math.round(totalOverall * 10) / 10,
      cumMax: Math.round(maxOverall * 10) / 10,
    };
  });

  const labels = categoryStats.map(c => `${c.label} (${c.testCount})`);

  let physicsValues: number[] = [];
  let chemistryValues: number[] = [];
  let mathsValues: number[] = [];

  if (viewMode === 'avg_pct') {
    physicsValues = categoryStats.map(c => c.physicsAvgPct);
    chemistryValues = categoryStats.map(c => c.chemistryAvgPct);
    mathsValues = categoryStats.map(c => c.mathsAvgPct);
  } else if (viewMode === 'avg_marks') {
    physicsValues = categoryStats.map(c => c.physicsAvgMarks);
    chemistryValues = categoryStats.map(c => c.chemistryAvgMarks);
    mathsValues = categoryStats.map(c => c.mathsAvgMarks);
  } else {
    physicsValues = categoryStats.map(c => c.cumPhysics);
    chemistryValues = categoryStats.map(c => c.cumChemistry);
    mathsValues = categoryStats.map(c => c.cumMaths);
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Physics',
        data: physicsValues,
        backgroundColor: '#4f46e5', // indigo-600
        borderRadius: 4,
        barPercentage: 0.7,
      },
      {
        label: 'Chemistry',
        data: chemistryValues,
        backgroundColor: '#059669', // emerald-600
        borderRadius: 4,
        barPercentage: 0.7,
      },
      {
        label: 'Mathematics',
        data: mathsValues,
        backgroundColor: '#e11d48', // rose-600
        borderRadius: 4,
        barPercentage: 0.7,
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
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const val = context.raw as number;
            const subject = context.dataset.label;
            if (viewMode === 'avg_pct') {
              return ` ${subject} Average: ${val}%`;
            } else if (viewMode === 'avg_marks') {
              return ` ${subject} Avg Marks: ${val}`;
            } else {
              return ` ${subject} Total Cumulative Marks: ${val}`;
            }
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
        },
      },
      y: {
        beginAtZero: true,
        max: viewMode === 'avg_pct' ? 100 : undefined,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748b',
          callback: (value: string | number) => 
            viewMode === 'avg_pct' ? `${value}%` : `${value}m`,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Category-wise Subject Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparison across Milestone (Main/Adv) and AITS (Main/Adv)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setViewMode('avg_pct')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'avg_pct'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avg %
          </button>
          <button
            type="button"
            onClick={() => setViewMode('avg_marks')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'avg_marks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avg Marks
          </button>
          <button
            type="button"
            onClick={() => setViewMode('total_marks')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              viewMode === 'total_marks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Marks
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <Bar data={data} options={options} />
      </div>

      {/* Breakdown stat pills for each category */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
        {categoryStats.map(cat => (
          <div key={cat.key} className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800">{cat.label}</span>
              <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded font-mono">
                {cat.testCount} tests
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="font-medium text-[11px]">Phy:</span>
                <span className="font-semibold font-mono text-[11px]">{cat.physicsAvgPct}% ({cat.physicsAvgMarks}m)</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-medium text-[11px]">Chem:</span>
                <span className="font-semibold font-mono text-[11px]">{cat.chemistryAvgPct}% ({cat.chemistryAvgMarks}m)</span>
              </div>
              <div className="flex items-center justify-between text-rose-700">
                <span className="font-medium text-[11px]">Math:</span>
                <span className="font-semibold font-mono text-[11px]">{cat.mathsAvgPct}% ({cat.mathsAvgMarks}m)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/80 font-bold">
                <span className="text-[11px]">Total:</span>
                <span className="font-mono text-[11px]">{cat.avgTotalMarks} / {cat.avgTotalMax}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
