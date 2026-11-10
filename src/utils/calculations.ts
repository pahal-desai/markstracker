import { CategoryFilter, SubjectName, SubjectStats, TestEntry, TestSeries, TestType } from '../types';

export function getTestTotal(test: TestEntry): { obtained: number; total: number; percentage: number } {
  const obtained = Number(test.physics.obtained) + Number(test.chemistry.obtained) + Number(test.maths.obtained);
  const total = Number(test.physics.total) + Number(test.chemistry.total) + Number(test.maths.total);
  const percentage = total > 0 ? (obtained / total) * 100 : 0;
  return {
    obtained: Math.round(obtained * 10) / 10,
    total: Math.round(total * 10) / 10,
    percentage: Math.round(percentage * 10) / 10,
  };
}

export function getSubjectPercentage(score: { obtained: number; total: number }): number {
  if (!score || score.total <= 0) return 0;
  return Math.round(((Number(score.obtained) / Number(score.total)) * 100) * 10) / 10;
}

export function getCategoryKey(series: TestSeries, type: TestType): CategoryFilter {
  return `${series}_${type}` as CategoryFilter;
}

export function getCategoryLabel(series: TestSeries, type: TestType): string {
  const s = series === 'milestone' ? 'Milestone' : 'AITS';
  const t = type === 'main' ? 'Main' : 'Advanced';
  return `${s} ${t}`;
}

export function filterTests(tests: TestEntry[], category: CategoryFilter): TestEntry[] {
  if (category === 'all') return tests;
  return tests.filter(t => getCategoryKey(t.series, t.type) === category);
}

export function sortTestsByDate(tests: TestEntry[], ascending = true): TestEntry[] {
  return [...tests].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return ascending ? diff : -diff;
    return ascending ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
  });
}

export function calculateSubjectStats(tests: TestEntry[]): SubjectStats[] {
  const subjects: { key: SubjectName; name: string }[] = [
    { key: 'physics', name: 'Physics' },
    { key: 'chemistry', name: 'Chemistry' },
    { key: 'maths', name: 'Mathematics' },
  ];

  if (tests.length === 0) {
    return subjects.map(s => ({
      subject: s.key,
      name: s.name,
      totalObtained: 0,
      totalMax: 0,
      averagePercentage: 0,
      averageMarks: 0,
      highestMarks: 0,
      highestTotal: 0,
      testCount: 0,
    }));
  }

  return subjects.map(s => {
    let totalObtained = 0;
    let totalMax = 0;
    let highestMarks = -Infinity;
    let highestTotal = 0;
    let sumPercentages = 0;

    tests.forEach(test => {
      const score = test[s.key];
      const obtained = Number(score.obtained) || 0;
      const total = Number(score.total) || 100;

      totalObtained += obtained;
      totalMax += total;
      sumPercentages += total > 0 ? (obtained / total) * 100 : 0;

      if (obtained > highestMarks) {
        highestMarks = obtained;
        highestTotal = total;
      }
    });

    const averagePercentage = tests.length > 0 ? sumPercentages / tests.length : 0;
    const averageMarks = tests.length > 0 ? totalObtained / tests.length : 0;

    return {
      subject: s.key,
      name: s.name,
      totalObtained: Math.round(totalObtained * 10) / 10,
      totalMax: Math.round(totalMax * 10) / 10,
      averagePercentage: Math.round(averagePercentage * 10) / 10,
      averageMarks: Math.round(averageMarks * 10) / 10,
      highestMarks: highestMarks === -Infinity ? 0 : highestMarks,
      highestTotal,
      testCount: tests.length,
    };
  });
}

export function getStrongAndWeakSubjects(subjectStats: SubjectStats[]) {
  if (subjectStats.every(s => s.testCount === 0)) {
    return {
      strongest: null,
      moderate: null,
      weakest: null,
      ranked: [],
    };
  }

  // Sort descending by average percentage
  const ranked = [...subjectStats].sort((a, b) => b.averagePercentage - a.averagePercentage);

  return {
    strongest: ranked[0],
    moderate: ranked[1] || null,
    weakest: ranked[ranked.length - 1],
    ranked,
  };
}

export function getCategorySummaries(tests: TestEntry[]) {
  const categories: { key: CategoryFilter; series: TestSeries; type: TestType; label: string }[] = [
    { key: 'milestone_main', series: 'milestone', type: 'main', label: 'Milestone Main' },
    { key: 'milestone_advanced', series: 'milestone', type: 'advanced', label: 'Milestone Advanced' },
    { key: 'aits_main', series: 'aits', type: 'main', label: 'AITS Main' },
    { key: 'aits_advanced', series: 'aits', type: 'advanced', label: 'AITS Advanced' },
  ];

  return categories.map(cat => {
    const catTests = filterTests(tests, cat.key);
    if (catTests.length === 0) {
      return {
        ...cat,
        testCount: 0,
        avgTotalMarks: 0,
        avgTotalMax: cat.type === 'main' ? 300 : 360,
        avgPercentage: 0,
        physicsAvgPct: 0,
        chemistryAvgPct: 0,
        mathsAvgPct: 0,
        physicsAvgMarks: 0,
        chemistryAvgMarks: 0,
        mathsAvgMarks: 0,
      };
    }

    let sumTotal = 0;
    let sumTotalMax = 0;
    let sumPct = 0;
    let sumP = 0;
    let sumC = 0;
    let sumM = 0;
    let sumPMarks = 0;
    let sumCMarks = 0;
    let sumMMarks = 0;

    catTests.forEach(t => {
      const tot = getTestTotal(t);
      sumTotal += tot.obtained;
      sumTotalMax += tot.total;
      sumPct += tot.percentage;

      sumP += getSubjectPercentage(t.physics);
      sumC += getSubjectPercentage(t.chemistry);
      sumM += getSubjectPercentage(t.maths);

      sumPMarks += Number(t.physics.obtained);
      sumCMarks += Number(t.chemistry.obtained);
      sumMMarks += Number(t.maths.obtained);
    });

    const n = catTests.length;
    return {
      ...cat,
      testCount: n,
      avgTotalMarks: Math.round((sumTotal / n) * 10) / 10,
      avgTotalMax: Math.round((sumTotalMax / n) * 10) / 10,
      avgPercentage: Math.round((sumPct / n) * 10) / 10,
      physicsAvgPct: Math.round((sumP / n) * 10) / 10,
      chemistryAvgPct: Math.round((sumC / n) * 10) / 10,
      mathsAvgPct: Math.round((sumM / n) * 10) / 10,
      physicsAvgMarks: Math.round((sumPMarks / n) * 10) / 10,
      chemistryAvgMarks: Math.round((sumCMarks / n) * 10) / 10,
      mathsAvgMarks: Math.round((sumMMarks / n) * 10) / 10,
    };
  });
}
