import React, { useState } from 'react';
import { TestEntry, CategoryFilter } from '../../types';
import { getTestTotal, getSubjectPercentage, getCategoryKey } from '../../utils/calculations';
import { Search, Edit2, Trash2, Calendar, FileText } from 'lucide-react';

interface Props {
  tests: TestEntry[];
  onEdit: (test: TestEntry) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (cat: CategoryFilter) => void;
}

export const TestList: React.FC<Props> = ({
  tests,
  onEdit,
  onDelete,
  onAddNew,
  categoryFilter,
  onCategoryFilterChange,
}) => {
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter tests based on category tab & search query
  const filtered = tests.filter(test => {
    // Category match
    if (categoryFilter !== 'all') {
      const key = getCategoryKey(test.series, test.type);
      if (key !== categoryFilter) return false;
    }
    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = test.name.toLowerCase().includes(q);
      const matchNotes = (test.notes || '').toLowerCase().includes(q);
      const matchSeries = test.series.toLowerCase().includes(q);
      const matchType = test.type.toLowerCase().includes(q);
      return matchName || matchNotes || matchSeries || matchType;
    }
    return true;
  });

  // Sort descending by date
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categoryTabs: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All Tests' },
    { key: 'milestone_main', label: 'Milestone Main' },
    { key: 'milestone_advanced', label: 'Milestone Adv' },
    { key: 'aits_main', label: 'AITS Main' },
    { key: 'aits_advanced', label: 'AITS Adv' },
  ];

  const getBadgeStyle = (series: string, type: string) => {
    if (series === 'milestone') {
      return type === 'main'
        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
        : 'bg-purple-100 text-purple-800 border-purple-200';
    } else {
      return type === 'main'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header with Title & Filter Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Test Records &amp; History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {sorted.length} of {tests.length} tests recorded
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests or notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          {categoryTabs.map(tab => {
            const count = tab.key === 'all'
              ? tests.length
              : tests.filter(t => getCategoryKey(t.series, t.type) === tab.key).length;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onCategoryFilterChange(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  categoryFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    categoryFilter === tab.key ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table view */}
      {sorted.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No tests found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {search ? 'Try adjusting your search criteria' : 'Start tracking by adding your first test'}
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Add New Test
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Test Details</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-indigo-700">Physics</th>
                <th className="py-3 px-3 text-emerald-700">Chemistry</th>
                <th className="py-3 px-3 text-rose-700">Maths</th>
                <th className="py-3 px-3">Total Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(test => {
                const tot = getTestTotal(test);
                const pPct = getSubjectPercentage(test.physics);
                const cPct = getSubjectPercentage(test.chemistry);
                const mPct = getSubjectPercentage(test.maths);
                const badgeClass = getBadgeStyle(test.series, test.type);

                return (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{test.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(test.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {test.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1 max-w-xs">
                          "{test.notes}"
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                        {test.series} {test.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-indigo-900">
                        {test.physics.obtained} <span className="text-slate-400 font-normal">/ {test.physics.total}</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold font-mono">
                        {pPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-900">
                        {test.chemistry.obtained} <span className="text-slate-400 font-normal">/ {test.chemistry.total}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                        {cPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-rose-900">
                        {test.maths.obtained} <span className="text-slate-400 font-normal">/ {test.maths.total}</span>
                      </div>
                      <span className="text-[10px] text-rose-600 font-semibold font-mono">
                        {mPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-extrabold text-slate-900 text-sm">
                        {tot.obtained} <span className="text-slate-400 text-xs font-normal">/ {tot.total}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 font-mono">
                        {tot.percentage}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(test)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit Test"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmId === test.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-md border border-rose-200">
                            <span className="text-[10px] text-rose-700 font-semibold">Delete?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDelete(test.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1 text-slate-500 hover:text-slate-700 text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(test.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Test"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
