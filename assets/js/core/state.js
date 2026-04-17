window.Planner = window.Planner || {};

window.Planner.state = {
  currentFilterType: 'all',
  focusModeEnabled: false,
  focusIncludePrep: true,
  dailyPlanIntensity: 'balanced',
  dailyPlanHours: 6,
  dailyPlanIncludeSecondary: true
};

window.Planner.exams = [
  { key: 'dv-lab', name: 'Data Visualization Lab', start: new Date('2026-04-15T09:00:00'), end: new Date('2026-04-15T12:00:00') },
  { key: 'dl-lab', name: 'Deep Learning Lab', start: new Date('2026-04-16T09:00:00'), end: new Date('2026-04-16T12:00:00') },
  { key: 'nptel-1', name: 'NPTEL Exam', start: new Date('2026-04-17T09:00:00'), end: new Date('2026-04-17T12:00:00') },
  { key: 'soft-skills', name: 'Soft Skills', start: new Date('2026-04-18T09:00:00'), end: new Date('2026-04-18T12:00:00') },
  { key: 'nptel-2', name: 'NPTEL Full Day', start: new Date('2026-04-19T09:00:00'), end: new Date('2026-04-19T17:00:00') },
  { key: 'os', name: 'Operating Systems', start: new Date('2026-04-23T10:00:00'), end: new Date('2026-04-23T13:00:00') },
  { key: 'dl', name: 'Deep Learning', start: new Date('2026-04-29T10:00:00'), end: new Date('2026-04-29T13:00:00') },
  { key: 'dv', name: 'Data Visualization', start: new Date('2026-05-01T10:00:00'), end: new Date('2026-05-01T13:00:00') },
  { key: 'cloud', name: 'Cloud Computing', start: new Date('2026-05-04T10:00:00'), end: new Date('2026-05-04T13:00:00') },
  { key: 'dm', name: 'Disaster Management', start: new Date('2026-05-08T10:00:00'), end: new Date('2026-05-08T13:00:00') }
];

window.Planner.examByKey = Object.fromEntries(window.Planner.exams.map(exam => [exam.key, exam]));
