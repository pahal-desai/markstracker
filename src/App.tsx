import React, { useState, useEffect, useRef } from 'react';
import { TestEntry, CategoryFilter } from './types';
import { SAMPLE_TESTS } from './data/mockData';
import { calculateSubjectStats } from './utils/calculations';
import { QuickStats } from './components/stats/QuickStats';
import { StrongWeakCard } from './components/stats/StrongWeakCard';
import { SubjectTrendChart } from './components/charts/SubjectTrendChart';
import { TotalMarksChart } from './components/charts/TotalMarksChart';
import { CategoryComparisonChart } from './components/charts/CategoryComparisonChart';
import { TestList } from './components/tests/TestList';
import { TestModal } from './components/modals/TestModal';
import {
  Plus,
  Download,
  Upload,
  Sparkles,
  BarChart2,
  Trash2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

const STORAGE_KEY = 'markstracker_tests_data_v1';

export const App: React.FC = () => {
  // Load initial tests from localStorage or initialize with sample tests
  const [tests, setTests] = useState<TestEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tests from localStorage', e);
    }
    return SAMPLE_TESTS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    } catch (e) {
      console.error('Failed to save tests to localStorage', e);
    }
  }, [tests]);

  // Temporary notification toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveTest = (test: TestEntry) => {
    if (editingTest) {
      setTests(prev => prev.map(t => (t.id === test.id ? test : t)));
      showToast(`Updated "${test.name}" successfully`);
    } else {
      setTests(prev => [test, ...prev]);
      showToast(`Added "${test.name}" successfully`);
    }
    setEditingTest(null);
  };

  const handleDeleteTest = (id: string) => {
    const toDelete = tests.find(t => t.id === id);
    setTests(prev => prev.filter(t => t.id !== id));
    showToast(`Deleted "${toDelete?.name || 'test'}"`);
  };

  const handleOpenEdit = (test: TestEntry) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTest(null);
    setIsModalOpen(true);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(tests, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `markstracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported backup file successfully');
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setTests(parsed);
          showToast(`Imported ${parsed.length} tests successfully`);
        } else {
          showToast('Invalid backup file format');
        }
      } catch (err) {
        showToast('Error reading backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSampleData = () => {
    setTests(SAMPLE_TESTS);
    showToast('Loaded 8 sample tests (Milestone & AITS)');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all test records? This action cannot be undone.')) {
      setTests([]);
      showToast('All test records cleared');
    }
  };

  // Compute overall subject stats
  const overallSubjectStats = calculateSubjectStats(tests);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {notification}
        </div>
      )}

      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  MarksTracker
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  JEE Prep
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Milestone &amp; AITS performance analytics (Main &amp; Advanced)
              </p>
            </div>
          </div>

          {/* Quick Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Test</span>
              <span className="xs:hidden">Add</span>
            </button>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />

            <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
              <button
                type="button"
                onClick={handleExportJSON}
                title="Export data to JSON file"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Import data from JSON backup"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Restore</span>
              </button>

              {tests.length === 0 ? (
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Load Sample
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClearAllData}
                  title="Clear all recorded tests"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Quick Top Stats Cards */}
        <QuickStats tests={tests} />

        {/* Strong & Weak Subjects Record (User Requirement) */}
        <StrongWeakCard stats={overallSubjectStats} tests={tests} />

        {/* Category Breakdown Comparison Chart (Milestone Main/Adv & AITS Main/Adv) */}
        <CategoryComparisonChart tests={tests} />

        {/* Section: Sequential Performance Trends */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Performance Trends by Category
              </h2>
              <p className="text-xs text-slate-500">
                Filter by test type to inspect subject score trajectory over time
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl overflow-x-auto self-start sm:self-auto max-w-full">
              {(
                [
                  { id: 'all', label: 'All Tests' },
                  { id: 'milestone_main', label: 'Milestone Main' },
                  { id: 'milestone_advanced', label: 'Milestone Adv' },
                  { id: 'aits_main', label: 'AITS Main' },
                  { id: 'aits_advanced', label: 'AITS Adv' },
                ] as const
              ).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Trend Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SubjectTrendChart
              tests={tests}
              selectedCategory={selectedCategory}
            />
            <TotalMarksChart
              tests={tests}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Test Logs Table & Management */}
        <TestList
          tests={tests}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTest}
          onAddNew={handleOpenCreate}
          categoryFilter={selectedCategory}
          onCategoryFilterChange={setSelectedCategory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>🎯</span>
            <span className="font-semibold text-slate-700">MarksTracker</span> — Milestone &amp; AITS Personal Marks Dashboard
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-indigo-600 hover:underline font-medium"
            >
              Reset to Sample Data
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleExportJSON}
              className="text-slate-600 hover:underline font-medium"
            >
              Download Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Test Modal */}
      <TestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTest(null);
        }}
        onSave={handleSaveTest}
        initialData={editingTest}
      />
    </div>
  );
};

export default App;
