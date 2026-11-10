import React from 'react';
import { TestEntry } from '../../types';
import { getTestTotal } from '../../utils/calculations';
import { FileText, Percent, Award, BookmarkCheck } from 'lucide-react';

interface Props {
  tests: TestEntry[];
}

export const QuickStats: React.FC<Props> = ({ tests }) => {
  const milestoneCount = tests.filter(t => t.series === 'milestone').length;
  const aitsCount = tests.filter(t => t.series === 'aits').length;

  let totalObtained = 0;
  let totalMax = 0;
  let bestTest: { name: string; score: string; pct: number } | null = null;
  let highestPct = -1;

  for (const t of tests) {
    const tot = getTestTotal(t);
    totalObtained += tot.obtained;
    totalMax += tot.total;

    if (tot.percentage > highestPct) {
      highestPct = tot.percentage;
      bestTest = {
        name: t.name,
        score: `${tot.obtained}/${tot.total}`,
        pct: tot.percentage,
      };
    }
  }

  const overallPct = totalMax > 0 ? Math.round(((totalObtained / totalMax) * 100) * 10) / 10 : 0;
  const avgObtained = tests.length > 0 ? Math.round((totalObtained / tests.length) * 10) / 10 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Total Tests */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Tests Logged</span>
          <FileText className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 font-mono">
          {tests.length}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
          <span className="text-indigo-600 font-bold">{milestoneCount}</span> Milestone •{' '}
          <span className="text-amber-600 font-bold">{aitsCount}</span> AITS
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Overall Average</span>
          <Percent className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-emerald-600 font-mono">
          {overallPct}%
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium font-mono">
          {Math.round(totalObtained)} / {Math.round(totalMax)} marks total
        </div>
      </div>

      {/* Average Marks / Test */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Marks / Test</span>
          <BookmarkCheck className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 font-mono">
          {avgObtained}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium">
          Across {tests.length} test papers
        </div>
      </div>

      {/* Best Test */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Personal Best</span>
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-amber-600 font-mono">
          {bestTest ? `${bestTest.pct}%` : '—'}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">
          {bestTest ? `${bestTest.name} (${bestTest.score})` : 'No tests recorded'}
        </div>
      </div>
    </div>
  );
};
