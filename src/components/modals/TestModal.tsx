import React, { useState, useEffect } from 'react';
import { TestEntry, TestSeries, TestType } from '../../types';
import { X, Check, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (test: TestEntry) => void;
  initialData?: TestEntry | null;
}

export const TestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [series, setSeries] = useState<TestSeries>('milestone');
  const [type, setType] = useState<TestType>('main');
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Scores state
  const [phyObtained, setPhyObtained] = useState<string>('');
  const [phyTotal, setPhyTotal] = useState<string>('100');

  const [chemObtained, setChemObtained] = useState<string>('');
  const [chemTotal, setChemTotal] = useState<string>('100');

  const [mathObtained, setMathObtained] = useState<string>('');
  const [mathTotal, setMathTotal] = useState<string>('100');

  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Handle edit vs create
  useEffect(() => {
    if (initialData) {
      setSeries(initialData.series);
      setType(initialData.type);
      setName(initialData.name);
      setDate(initialData.date);
      setPhyObtained(String(initialData.physics.obtained));
      setPhyTotal(String(initialData.physics.total));
      setChemObtained(String(initialData.chemistry.obtained));
      setChemTotal(String(initialData.chemistry.total));
      setMathObtained(String(initialData.maths.obtained));
      setMathTotal(String(initialData.maths.total));
      setNotes(initialData.notes || '');
      setError('');
    } else {
      // Reset to defaults
      setSeries('milestone');
      setType('main');
      setName('');
      setDate(new Date().toISOString().split('T')[0]);
      setPhyObtained('');
      setPhyTotal('100');
      setChemObtained('');
      setChemTotal('100');
      setMathObtained('');
      setMathTotal('100');
      setNotes('');
      setError('');
    }
  }, [initialData, isOpen]);

  // When type changes between Main and Advanced in create mode, adjust default totals
  const handleTypeChange = (newType: TestType) => {
    setType(newType);
    if (!initialData) {
      if (newType === 'main') {
        setPhyTotal('100');
        setChemTotal('100');
        setMathTotal('100');
      } else {
        // Advanced defaults to 120 each (totalling 360) but freely adjustable
        setPhyTotal('120');
        setChemTotal('120');
        setMathTotal('120');
      }
    }
  };

  if (!isOpen) return null;

  // Live total calculations
  const numPhyObt = Number(phyObtained) || 0;
  const numChemObt = Number(chemObtained) || 0;
  const numMathObt = Number(mathObtained) || 0;
  const totalObt = numPhyObt + numChemObt + numMathObt;

  const numPhyTot = type === 'main' ? 100 : (Number(phyTotal) || 0);
  const numChemTot = type === 'main' ? 100 : (Number(chemTotal) || 0);
  const numMathTot = type === 'main' ? 100 : (Number(mathTotal) || 0);
  const totalMax = numPhyTot + numChemTot + numMathTot;

  const totalPct = totalMax > 0 ? Math.round(((totalObt / totalMax) * 100) * 10) / 10 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a test name (e.g. Milestone 1 or AITS 2)');
      return;
    }

    if (numPhyTot <= 0 || numChemTot <= 0 || numMathTot <= 0) {
      setError('Maximum marks for each subject must be greater than zero');
      return;
    }

    const testEntry: TestEntry = {
      id: initialData?.id || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      series,
      type,
      date,
      physics: {
        obtained: Number(phyObtained) || 0,
        total: numPhyTot,
      },
      chemistry: {
        obtained: Number(chemObtained) || 0,
        total: numChemTot,
      },
      maths: {
        obtained: Number(mathObtained) || 0,
        total: numMathTot,
      },
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt || Date.now(),
    };

    onSave(testEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Test Record' : 'Add New Test Result'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track marks for Milestone or AITS tests
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Test Series & Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Series */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Test Series
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSeries('milestone')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    series === 'milestone'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Milestone
                </button>
                <button
                  type="button"
                  onClick={() => setSeries('aits')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    series === 'aits'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AITS
                </button>
              </div>
            </div>

            {/* Pattern / Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pattern / Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTypeChange('main')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'main'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Main (300 M)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('advanced')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'advanced'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Advanced (~360 M)
                </button>
              </div>
            </div>
          </div>

          {/* Test Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Test Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={series === 'milestone' ? 'e.g. Milestone 1' : 'e.g. AITS Part Test 1'}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Test Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Subject Marks Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject-wise Marks
              </label>
              {type === 'advanced' && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Advanced: enter marks obtained &amp; total per subject
                </span>
              )}
              {type === 'main' && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Fixed 100 marks per subject
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Physics */}
              <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                  <span className="font-bold text-indigo-950 text-sm">Physics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Obtained"
                      value={phyObtained}
                      onChange={e => setPhyObtained(e.target.value)}
                      className="w-24 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">/</span>
                  {type === 'main' ? (
                    <span className="w-16 text-center font-mono text-sm text-slate-600 font-semibold py-1.5 bg-slate-100/80 rounded-lg border border-slate-200">
                      100
                    </span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      placeholder="Total"
                      value={phyTotal}
                      onChange={e => setPhyTotal(e.target.value)}
                      className="w-20 px-2.5 py-1.5 text-center font-mono font-medium text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      title="Physics maximum marks"
                    />
                  )}
                </div>
              </div>

              {/* Chemistry */}
              <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span className="font-bold text-emerald-950 text-sm">Chemistry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Obtained"
                      value={chemObtained}
                      onChange={e => setChemObtained(e.target.value)}
                      className="w-24 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">/</span>
                  {type === 'main' ? (
                    <span className="w-16 text-center font-mono text-sm text-slate-600 font-semibold py-1.5 bg-slate-100/80 rounded-lg border border-slate-200">
                      100
                    </span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      placeholder="Total"
                      value={chemTotal}
                      onChange={e => setChemTotal(e.target.value)}
                      className="w-20 px-2.5 py-1.5 text-center font-mono font-medium text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      title="Chemistry maximum marks"
                    />
                  )}
                </div>
              </div>

              {/* Mathematics */}
              <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                  <span className="font-bold text-rose-950 text-sm">Maths</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Obtained"
                      value={mathObtained}
                      onChange={e => setMathObtained(e.target.value)}
                      className="w-24 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">/</span>
                  {type === 'main' ? (
                    <span className="w-16 text-center font-mono text-sm text-slate-600 font-semibold py-1.5 bg-slate-100/80 rounded-lg border border-slate-200">
                      100
                    </span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      placeholder="Total"
                      value={mathTotal}
                      onChange={e => setMathTotal(e.target.value)}
                      className="w-20 px-2.5 py-1.5 text-center font-mono font-medium text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      title="Maths maximum marks"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Live Total preview bar */}
            <div className="flex items-center justify-between p-3 bg-slate-800 text-white rounded-xl">
              <div>
                <span className="text-xs text-slate-300 font-medium">Calculated Total:</span>
                <div className="text-lg font-black font-mono">
                  {totalObt} <span className="text-slate-400 text-sm font-normal">/ {totalMax}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 font-medium">Percentage:</span>
                <div className="text-lg font-black font-mono text-emerald-400">
                  {totalPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reflections / Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Mistakes in organic chemistry, speed was good in physics..."
              rows={2}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              {initialData ? 'Update Test' : 'Save Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
