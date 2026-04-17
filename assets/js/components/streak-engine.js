window.Planner = window.Planner || {};

window.Planner.streakStorageKey = 'planner.streak.v1';
window.Planner.streakCompleteStorageKey = 'planner.streak.completed.v1';
window.Planner.streakActivityKey = 'planner.streak.activity.v1';

window.Planner.normalizeDateKey = function normalizeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

window.Planner.loadStreakState = function loadStreakState() {
  try {
    const streakData = JSON.parse(localStorage.getItem(window.Planner.streakStorageKey) || '{}');
    const completedDays = JSON.parse(localStorage.getItem(window.Planner.streakCompleteStorageKey) || '[]');
    const activityDays = JSON.parse(localStorage.getItem(window.Planner.streakActivityKey) || '[]');
    return {
      currentStreak: Number(streakData.currentStreak) || 0,
      bestStreak: Number(streakData.bestStreak) || 0,
      lastCompletedDate: streakData.lastCompletedDate || null,
      completedDays: Array.isArray(completedDays) ? completedDays : [],
      activityDays: Array.isArray(activityDays) ? activityDays : []
    };
  } catch {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completedDays: [],
      activityDays: []
    };
  }
};

window.Planner.saveStreakState = function saveStreakState() {
  localStorage.setItem(window.Planner.streakStorageKey, JSON.stringify({
    currentStreak: window.Planner.streakState.currentStreak,
    bestStreak: window.Planner.streakState.bestStreak,
    lastCompletedDate: window.Planner.streakState.lastCompletedDate
  }));
  localStorage.setItem(window.Planner.streakCompleteStorageKey, JSON.stringify(window.Planner.streakState.completedDays));
  localStorage.setItem(window.Planner.streakActivityKey, JSON.stringify(window.Planner.streakState.activityDays));
};

window.Planner.seedStreakActivity = function seedStreakActivity() {
  const start = new Date('2026-04-15T00:00:00');
  const today = new Date();
  const activity = [];

  for (let cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    const key = window.Planner.normalizeDateKey(cursor);
    const examDay = window.Planner.exams.some(exam => window.Planner.normalizeDateKey(exam.start) === key);
    const completed = examDay || (cursor.getDate() % 2 === 0);
    if (completed) activity.push(key);
  }

  if (!window.Planner.streakState.activityDays.length) {
    window.Planner.streakState.activityDays = activity.slice(-21);
  }
};

window.Planner.rebuildStreak = function rebuildStreak() {
  const completed = new Set(window.Planner.streakState.completedDays);
  const activity = new Set(window.Planner.streakState.activityDays);
  const targetDays = [...activity].sort();

  let bestStreak = 0;
  let currentStreak = 0;
  let previousDate = null;

  targetDays.forEach(dayKey => {
    const currentDate = new Date(`${dayKey}T00:00:00`);
    if (!previousDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((currentDate - previousDate) / 86400000);
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, currentStreak);
    previousDate = currentDate;
  });

  const lastCompletedDate = window.Planner.streakState.completedDays.slice(-1)[0] || null;
  window.Planner.streakState.currentStreak = bestStreak;
  window.Planner.streakState.bestStreak = Math.max(window.Planner.streakState.bestStreak, bestStreak);
  window.Planner.streakState.lastCompletedDate = lastCompletedDate;
  window.Planner.saveStreakState();
};

window.Planner.toggleStreakToday = function toggleStreakToday() {
  const todayKey = window.Planner.normalizeDateKey(new Date());
  const completed = new Set(window.Planner.streakState.completedDays);
  const activity = new Set(window.Planner.streakState.activityDays);

  if (completed.has(todayKey)) {
    completed.delete(todayKey);
    activity.delete(todayKey);
  } else {
    completed.add(todayKey);
    activity.add(todayKey);
  }

  window.Planner.streakState.completedDays = [...completed].sort();
  window.Planner.streakState.activityDays = [...activity].sort();
  window.Planner.rebuildStreak();
  window.Planner.updateCountdown();
};

window.Planner.setStreakStudyHours = function setStreakStudyHours(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.streakStudyHours = Math.min(6, Math.max(1, parsed));
  window.Planner.updateCountdown();
};

window.Planner.toggleStreakExamDays = function toggleStreakExamDays(isChecked) {
  window.Planner.state.streakCountExamDays = Boolean(isChecked);
  window.Planner.updateCountdown();
};

window.Planner.toggleStreakCarryRestDays = function toggleStreakCarryRestDays(isChecked) {
  window.Planner.state.streakCarryRestDays = Boolean(isChecked);
  window.Planner.updateCountdown();
};

window.Planner.renderStreakEngine = function renderStreakEngine(now) {
  if (!window.Planner.streakState) {
    window.Planner.streakState = window.Planner.loadStreakState();
    window.Planner.seedStreakActivity();
    window.Planner.rebuildStreak();
  }

  const state = window.Planner.state;
  const streak = window.Planner.streakState;
  const todayKey = window.Planner.normalizeDateKey(now);
  const todayCompleted = streak.completedDays.includes(todayKey);
  const activeDays = streak.activityDays.length;
  const completionRate = activeDays ? Math.round((streak.completedDays.length / activeDays) * 100) : 0;
  const remainingToTarget = Math.max(0, state.streakTarget - streak.currentStreak);

  document.getElementById('streakCurrent').textContent = String(streak.currentStreak);
  document.getElementById('streakBest').textContent = String(streak.bestStreak);
  document.getElementById('streakTarget').textContent = String(state.streakTarget);
  document.getElementById('streakRate').textContent = `${completionRate}%`;
  document.getElementById('streakProgress').textContent = `${remainingToTarget} day(s) to target`;
  document.getElementById('streakTodayBadge').textContent = todayCompleted ? 'Today complete' : 'Today pending';
  document.getElementById('streakTodayBtn').textContent = todayCompleted ? 'Unmark Today' : 'Mark Today Complete';
  document.getElementById('streakHoursOutput').textContent = `${state.streakStudyHours}h/day`;
  document.getElementById('streakExamDaysToggle').checked = state.streakCountExamDays;
  document.getElementById('streakCarryToggle').checked = state.streakCarryRestDays;

  const todayCount = window.Planner.exams.filter(exam => window.Planner.normalizeDateKey(exam.start) === todayKey).length;
  const activeLabel = todayCompleted ? 'Recorded' : 'Ready';
  const note = now >= new Date('2026-05-08T13:00:00')
    ? 'All exams are over. Keep the streak for placement preparation and momentum.'
    : `Streak ${activeLabel}: ${todayCount ? `${todayCount} exam session(s) today` : 'no exam session today'}. Add one focused study block to keep the chain alive.`;

  const activityBars = [];
  const recentDays = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const cursor = new Date(now);
    cursor.setDate(cursor.getDate() - offset);
    const key = window.Planner.normalizeDateKey(cursor);
    recentDays.push(key);
    const done = streak.completedDays.includes(key);
    const examDay = window.Planner.exams.some(exam => window.Planner.normalizeDateKey(exam.start) === key);
    const level = done ? 4 : examDay && state.streakCountExamDays ? 2 : 1;
    activityBars.push(`<span class="streak-bar streak-level-${level}" title="${key}"></span>`);
  }

  document.getElementById('streakBars').innerHTML = activityBars.join('');
  document.getElementById('streakMeta').textContent = note;

  ['streakExamDaysToggle', 'streakCarryToggle'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.checked = id === 'streakExamDaysToggle' ? state.streakCountExamDays : state.streakCarryRestDays;
  });

  if (document.getElementById('streakHoursSlider')) {
    document.getElementById('streakHoursSlider').value = String(state.streakStudyHours);
  }
};
