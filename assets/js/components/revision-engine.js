window.Planner = window.Planner || {};

window.Planner.revisionSubjectMap = {
  os: { label: 'Operating Systems', short: 'OS' },
  dl: { label: 'Deep Learning', short: 'DL' },
  dv: { label: 'Data Visualization', short: 'DV' },
  cloud: { label: 'Cloud Computing', short: 'Cloud' },
  dm: { label: 'Disaster Management', short: 'DM' },
  nptel: { label: 'NPTEL', short: 'NPTEL' },
  soft: { label: 'Soft Skills', short: 'Soft Skills' }
};

window.Planner.setRevisionMode = function setRevisionMode(mode) {
  if (!['exam-first', 'weakness-first', 'mixed'].includes(mode)) return;
  window.Planner.state.revisionMode = mode;
  window.Planner.updateCountdown();
};

window.Planner.setRevisionStudyHours = function setRevisionStudyHours(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.revisionStudyHours = Math.min(8, Math.max(2, parsed));
  window.Planner.updateCountdown();
};

window.Planner.toggleRevisionMiniTests = function toggleRevisionMiniTests(isChecked) {
  window.Planner.state.revisionIncludeMiniTests = Boolean(isChecked);
  window.Planner.updateCountdown();
};

window.Planner.setRevisionWeakness = function setRevisionWeakness(subjectKey, value, outputId) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.subjectWeakness[subjectKey] = Math.min(5, Math.max(1, parsed));
  const output = document.getElementById(outputId);
  if (output) output.textContent = `${parsed}/5`;
  window.Planner.updateCountdown();
};

window.Planner.getRevisionSubjectLabel = function getRevisionSubjectLabel(subjectKey) {
  return window.Planner.revisionSubjectMap[subjectKey]?.label || subjectKey;
};

window.Planner.getRevisionCandidates = function getRevisionCandidates(now, nextExam, ongoingExam) {
  const timelineScore = (subjectKey) => {
    const nextExamWeight = nextExam && nextExam.key === subjectKey ? 5 : 0;
    const ongoingWeight = ongoingExam && ongoingExam.key === subjectKey ? 5 : 0;
    const daysToNext = nextExam ? Math.max(0, (nextExam.start - now) / 86400000) : 99;
    const urgency = Math.max(0, 5 - daysToNext);
    const weakness = window.Planner.state.subjectWeakness[subjectKey] || 2;
    return weakness * 2 + urgency + nextExamWeight + ongoingWeight;
  };

  return ['os', 'dl', 'dv', 'cloud', 'dm'].map(subjectKey => ({
    key: subjectKey,
    label: window.Planner.getRevisionSubjectLabel(subjectKey),
    weakness: window.Planner.state.subjectWeakness[subjectKey] || 2,
    score: timelineScore(subjectKey)
  })).sort((a, b) => b.score - a.score);
};

window.Planner.renderRevisionEngine = function renderRevisionEngine(now, nextExam, ongoingExam) {
  const mode = window.Planner.state.revisionMode;
  const studyHours = window.Planner.state.revisionStudyHours;
  const includeMiniTests = window.Planner.state.revisionIncludeMiniTests;
  const badges = document.getElementById('revisionModeBadge');
  const hoursChip = document.getElementById('revisionStudyHoursOutput');
  const miniTestsToggle = document.getElementById('revisionMiniTestsToggle');

  if (badges) badges.textContent = mode.replace('-', ' ');
  if (hoursChip) hoursChip.textContent = `${studyHours}h/day`;
  if (miniTestsToggle) miniTestsToggle.checked = includeMiniTests;

  const modeButtons = {
    'exam-first': document.getElementById('revisionModeExamFirst'),
    'weakness-first': document.getElementById('revisionModeWeaknessFirst'),
    mixed: document.getElementById('revisionModeMixed')
  };

  Object.entries(modeButtons).forEach(([key, button]) => {
    if (button) button.classList.toggle('active', mode === key);
  });

  const candidates = window.Planner.getRevisionCandidates(now, nextExam, ongoingExam);
  const topSubjects = mode === 'weakness-first' ? candidates : candidates.slice(0, 3);
  const tasks = [];
  const timeBlocks = Math.max(2, Math.min(4, Math.round(studyHours / 2)));
  const blockMinutes = Math.round((studyHours * 60) / timeBlocks);

  topSubjects.slice(0, 3).forEach((subject, index) => {
    const blockLabel = `Block ${index + 1} · ${blockMinutes} min`;
    const strength = subject.weakness;
    const miniTestLine = includeMiniTests ? 'Finish with a 5-minute recall test.' : 'End with a 5-minute self-summary.';
    let detail = `${blockLabel}: revise ${subject.label} units, diagrams, and prior questions. ${miniTestLine}`;

    if (mode === 'mixed' && index === 1 && nextExam) {
      detail = `${blockLabel}: split between ${subject.label} and ${window.Planner.getRevisionSubjectLabel(nextExam.key)} for exam proximity.`;
    }

    tasks.push({
      title: `Priority ${index + 1} · ${subject.label} (${strength}/5 weak)` ,
      detail
    });
  });

  if (ongoingExam) {
    tasks.unshift({
      title: `Current Exam · ${ongoingExam.name}`,
      detail: 'Use only quick recall and execution tactics. No new learning.'
    });
  } else if (nextExam) {
    tasks.unshift({
      title: `Next Exam · ${nextExam.name}`,
      detail: `Anchor your session around the upcoming paper and keep ${studyHours}h reserved for it.`
    });
  }

  if (tasks.length < 3) {
    tasks.push({
      title: 'Maintenance Block',
      detail: 'Review formula sheets, important definitions, and one timed answer.'
    });
  }

  const meta = ongoingExam
    ? `Revision mode ${mode.replace('-', ' ')} is in live-exam support. Focus on maintenance and memory recall.`
    : nextExam
      ? `Revision mode ${mode.replace('-', ' ')} is anchored to ${nextExam.name}. ${studyHours}h plan with ${includeMiniTests ? 'mini tests enabled' : 'mini tests off'}.`
      : `Revision mode ${mode.replace('-', ' ')} is now placement-oriented. ${studyHours}h plan ready.`;

  const summary = tasks.slice(0, 3).map(task => `<div class="revision-summary-item"><strong>${task.title}</strong><span>${task.detail}</span></div>`).join('');
  document.getElementById('revisionSummaryList').innerHTML = summary;
  document.getElementById('revisionMeta').textContent = meta;
};
