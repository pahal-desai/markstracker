export type TestSeries = 'milestone' | 'aits';
export type TestType = 'main' | 'advanced';

export type CategoryFilter = 
  | 'all' 
  | 'milestone_main' 
  | 'milestone_advanced' 
  | 'aits_main' 
  | 'aits_advanced';

export interface SubjectScore {
  obtained: number;
  total: number;
}

export interface TestEntry {
  id: string;
  name: string; // e.g. "Milestone 1", "AITS Part Test 2"
  series: TestSeries; // 'milestone' or 'aits'
  type: TestType; // 'main' or 'advanced'
  date: string; // YYYY-MM-DD
  physics: SubjectScore;
  chemistry: SubjectScore;
  maths: SubjectScore;
  notes?: string;
  createdAt: number;
}

export type SubjectName = 'physics' | 'chemistry' | 'maths';

export interface SubjectStats {
  subject: SubjectName;
  name: string;
  totalObtained: number;
  totalMax: number;
  averagePercentage: number;
  averageMarks: number;
  highestMarks: number;
  highestTotal: number;
  testCount: number;
}

export interface CategorySummary {
  categoryKey: CategoryFilter;
  label: string;
  series: TestSeries | 'all';
  type: TestType | 'all';
  testCount: number;
  avgTotalMarks: number;
  avgTotalMax: number;
  avgPercentage: number;
  physicsAvgPct: number;
  chemistryAvgPct: number;
  mathsAvgPct: number;
}
