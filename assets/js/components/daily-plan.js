window.Planner = window.Planner || {};

window.Planner.dailySubjectMap = {
  'Data Visualization Lab': 'Data Visualization',
  'Deep Learning Lab': 'Deep Learning',
  'NPTEL Exam': 'NPTEL',
  'NPTEL Full Day': 'NPTEL',
  'Soft Skills': 'Soft Skills',
  'Operating Systems': 'Operating Systems',
  'Deep Learning': 'Deep Learning',
  'Data Visualization': 'Data Visualization',
  'Cloud Computing': 'Cloud Computing',
  'Disaster Management': 'Disaster Management'
};

window.Planner.dailyIntensityLabels = {
  balanced: 'Balanced',
  aggressive: 'Aggressive',
  recovery: 'Recovery'
};

window.Planner.getSubjectFromExam = function getSubjectFromExam(exam) {
  if (!exam) return 'General Revision';
  return window.Planner.dailySubjectMap[exam.name] || exam.name;
};

window.Planner.getHoursByIntensity = function getHoursByIntensity(baseHours, intensity) {
  if (intensity === 'aggressive') return Math.min(12, baseHours + 2);
  if (intensity === 'recovery') return Math.max(3, baseHours - 1);
  return baseHours;
};

window.Planner.renderDailyPlan = function renderDailyPlan(tasks, metaText, intensityLabel) {
  const list = document.getElementById('dailyPlanList');
  const meta = document.getElementById('dailyPlanMeta');
  const badge = document.getElementById('dailyPlanTrack');

  list.innerHTML = tasks.map(task => (
    `<li class="daily-plan-item"><strong>${task.title}</strong><span>${task.detail}</span></li>`
  )).join('');

  meta.textContent = metaText;
  badge.textContent = intensityLabel;
};

window.Planner.syncDailyPlanControls = function syncDailyPlanControls() {
  const state = window.Planner.state;
  document.getElementById('dailyPlanHours').value = String(state.dailyPlanHours);
  document.getElementById('dailyPlanHoursOutput').textContent = `${state.dailyPlanHours}h/day`;
  document.getElementById('dailyPlanSecondaryToggle').checked = state.dailyPlanIncludeSecondary;

  ['balanced', 'aggressive', 'recovery'].forEach(mode => {
    const id = `planIntensity${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
    const button = document.getElementById(id);
    if (button) button.classList.toggle('active', state.dailyPlanIntensity === mode);
  });
};

window.Planner.updateDailyPlan = function updateDailyPlan(now, nextExam, ongoingExam, remainingCount) {
  const state = window.Planner.state;
  const intensity = state.dailyPlanIntensity;
  const intensityLabel = window.Planner.dailyIntensityLabels[intensity];
  const effectiveHours = window.Planner.getHoursByIntensity(state.dailyPlanHours, intensity);

  const primaryExam = ongoingExam || nextExam;
  const primarySubject = window.Planner.getSubjectFromExam(primaryExam);

  let phaseText = 'Plan for today';
  if (ongoingExam) {
    phaseText = `Live exam mode for ${primarySubject}`;
  } else if (nextExam) {
    const hoursToExam = Math.max(1, Math.floor((nextExam.start - now) / 3600000));
    phaseText = `${primarySubject} exam in ~${hoursToExam}h`;
  } else {
    phaseText = 'Exam cycle completed';
  }

  const tasks = [];

  if (ongoingExam) {
    tasks.push({
      title: 'Task 1 · Live Execution Block',
      detail: 'Use a 70/20/10 split: 70% sure answers, 20% medium, 10% review buffer.'
    });
    tasks.push({
      title: 'Task 2 · Answer Structure',
      detail: `For ${primarySubject}, write definition -> concept -> example in each answer.`
    });
    tasks.push({
      title: 'Task 3 · Final 10 Minutes',
      detail: 'Use final check for diagram labels, keywords, and unanswered questions.'
    });
  } else if (nextExam) {
    tasks.push({
      title: `Task 1 · ${Math.max(1, Math.round(effectiveHours * 0.5))}h Core Revision`,
      detail: `Focus only on high-yield ${primarySubject} units and previous important questions.`
    });
    tasks.push({
      title: `Task 2 · ${Math.max(1, Math.round(effectiveHours * 0.3))}h Active Recall`,
      detail: 'Write short-answer drills and speak out concepts without notes.'
    });
    tasks.push({
      title: `Task 3 · ${Math.max(1, Math.round(effectiveHours * 0.2))}h Rapid Review`,
      detail: 'Revise formulas, diagrams, definitions, and memory anchors only.'
    });
  } else {
    tasks.push({
      title: 'Task 1 · Placements Sprint',
      detail: '60 min aptitude + 60 min DSA + 30 min communication round.'
    });
    tasks.push({
      title: 'Task 2 · Resume and Projects',
      detail: 'Polish 1 project story using Problem -> Approach -> Impact format.'
    });
    tasks.push({
      title: 'Task 3 · Mock Interview Practice',
      detail: 'Practice 5 common interview questions with timed answers.'
    });
  }

  if (state.dailyPlanIncludeSecondary && nextExam && remainingCount > 1) {
    const secondExam = window.Planner.exams.find(exam => exam.start > nextExam.start);
    if (secondExam) {
      tasks[2] = {
        title: tasks[2].title,
        detail: `${tasks[2].detail} Add 25 min bridge revision for ${window.Planner.getSubjectFromExam(secondExam)}.`
      };
    }
  }

  window.Planner.renderDailyPlan(
    tasks,
    `${phaseText} · ${effectiveHours}h target · Secondary ${state.dailyPlanIncludeSecondary ? 'ON' : 'OFF'}`,
    intensityLabel
  );

  window.Planner.syncDailyPlanControls();
};

window.setDailyPlanIntensity = function setDailyPlanIntensity(mode) {
  if (!window.Planner.dailyIntensityLabels[mode]) return;
  window.Planner.state.dailyPlanIntensity = mode;
  window.Planner.updateCountdown();
};

window.setDailyPlanHours = function setDailyPlanHours(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.dailyPlanHours = Math.min(12, Math.max(3, parsed));
  window.Planner.updateCountdown();
};

window.toggleDailyPlanSecondary = function toggleDailyPlanSecondary(isChecked) {
  window.Planner.state.dailyPlanIncludeSecondary = Boolean(isChecked);
  window.Planner.updateCountdown();
};
