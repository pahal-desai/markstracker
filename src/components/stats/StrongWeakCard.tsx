import React from 'react';
import { SubjectStats, TestEntry } from '../../types';
import { getStrongAndWeakSubjects, getSubjectPercentage } from '../../utils/calculations';
import { Trophy, AlertTriangle, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

interface Props {
  stats: SubjectStats[];
  tests: TestEntry[];
}

export const StrongWeakCard: React.FC<Props> = ({ stats, tests }) => {
  const { strongest, moderate, weakest, ranked } = getStrongAndWeakSubjects(stats);

  if (!strongest || tests.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-sm">
        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-700">Strong & Weak Subject Analysis</h3>
        <p className="text-xs text-slate-400 mt-1">Add tests to automatically discover your strongest and focus subjects</p>
      </div>
    );
  }

  // Get breakdown between Main and Advanced
  const mainTests = tests.filter(t => t.type === 'main');
  const advTests = tests.filter(t => t.type === 'advanced');

  const getMainAvg = (subj: 'physics' | 'chemistry' | 'maths') => {
    if (mainTests.length === 0) return 0;
    const sum = mainTests.reduce((acc, t) => acc + getSubjectPercentage(t[subj]), 0);
    return Math.round((sum / mainTests.length) * 10) / 10;
  };

  const getAdvAvg = (subj: 'physics' | 'chemistry' | 'maths') => {
    if (advTests.length === 0) return 0;
    const sum = advTests.reduce((acc, t) => acc + getSubjectPercentage(t[subj]), 0);
    return Math.round((sum / advTests.length) * 10) / 10;
  };

  const subjectColorMap = {
    physics: {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/60',
      text: 'text-indigo-700',
      bar: 'bg-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    chemistry: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/60',
      text: 'text-emerald-700',
      bar: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    maths: {
      border: 'border-rose-200',
      bg: 'bg-rose-50/60',
      text: 'text-rose-700',
      bar: 'bg-rose-600',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            Subject Proficiency & Weakness Record
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by overall percentage across all {tests.length} tests taken
          </p>
        </div>
      </div>

      {/* Highlights: Strongest vs Weakest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Strongest */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
              Strongest Subject
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-mono">
              #{1} Rank
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-0.5">
            {strongest.name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {strongest.averagePercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              avg score ({strongest.averageMarks} marks/test)
            </span>
          </div>
          <div className="text-[11px] text-emerald-900 mt-2 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Peak: {strongest.highestMarks}/{strongest.highestTotal} marks
          </div>
        </div>

        {/* Moderate */}
        {moderate && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Consistent Subject
              </span>
              <span className="text-xs font-bold text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-full font-mono">
                #{2} Rank
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mb-0.5">
              {moderate.name}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700 font-mono">
                {moderate.averagePercentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                avg score ({moderate.averageMarks} marks/test)
              </span>
            </div>
            <div className="text-[11px] text-blue-900 mt-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Peak: {moderate.highestMarks}/{moderate.highestTotal} marks
            </div>
          </div>
        )}

        {/* Weakest / Focus */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Needs Focus
            </span>
            <span className="text-xs font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-full font-mono">
              #{ranked.length} Rank
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-0.5">
            {weakest.name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">
              {weakest.averagePercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              avg score ({weakest.averageMarks} marks/test)
            </span>
          </div>
          <div className="text-[11px] text-rose-900 mt-2 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            Target gap: {(strongest.averagePercentage - weakest.averagePercentage).toFixed(1)}% behind {strongest.name}
          </div>
        </div>
      </div>

      {/* Detailed comparative progress bars & Main vs Adv breakdown */}
      <div className="space-y-3 pt-2">
        {ranked.map((subj, idx) => {
          const colors = subjectColorMap[subj.subject];
          const mainAvg = getMainAvg(subj.subject);
          const advAvg = getAdvAvg(subj.subject);

          return (
            <div
              key={subj.subject}
              className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {subj.name}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Strongest
                    </span>
                  )}
                  {idx === ranked.length - 1 && (
                    <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Priority Focus
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">
                    Main avg: <strong className="text-slate-700 font-mono">{mainAvg}%</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Adv avg: <strong className="text-slate-700 font-mono">{advAvg}%</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {subj.averagePercentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, subj.averagePercentage))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>
                  Total Scored: <strong className="font-mono text-slate-700">{subj.totalObtained}</strong> / {subj.totalMax} marks
                </span>
                <span>
                  Best Single Score: <strong className="font-mono text-slate-700">{subj.highestMarks}/{subj.highestTotal}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
