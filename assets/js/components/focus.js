window.Planner = window.Planner || {};

window.Planner.parseCardDate = function parseCardDate(card) {
  const rawDate = card.querySelector('.day-date')?.textContent || '';
  const match = rawDate.match(/(Apr|May)\s+(\d{1,2})/i);
  if (!match) return null;

  const monthMap = { apr: 3, may: 4 };
  const month = monthMap[match[1].toLowerCase()];
  const day = Number(match[2]);
  if (month === undefined || Number.isNaN(day)) return null;

  return new Date(2026, month, day);
};

window.Planner.isSameDay = function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

window.Planner.updateFocusPanelState = function updateFocusPanelState(label, summary) {
  const focusState = document.getElementById('focusState');
  const focusSummary = document.getElementById('focusSummary');
  const focusToggleBtn = document.getElementById('focusToggleBtn');
  const focusPrepBtn = document.getElementById('focusPrepBtn');

  focusState.textContent = label;
  focusSummary.textContent = summary;
  focusState.classList.toggle('active', window.Planner.state.focusModeEnabled);
  focusToggleBtn.classList.toggle('active', window.Planner.state.focusModeEnabled);
  focusToggleBtn.textContent = window.Planner.state.focusModeEnabled ? 'Disable Focus Mode' : 'Enable Focus Mode';
  focusPrepBtn.classList.toggle('active', window.Planner.state.focusIncludePrep);
};

window.Planner.applyFocusMode = function applyFocusMode(now) {
  document.querySelectorAll('.day-card').forEach(card => card.classList.remove('focus-hidden'));

  if (!window.Planner.state.focusModeEnabled) {
    window.Planner.updateFocusPanelState('Inactive', 'Focus mode is off. Turn it on to show only the most relevant cards.');
    return;
  }

  const exams = window.Planner.exams;
  const ongoingExam = exams.find(e => now >= e.start && now < e.end);
  const nextExam = exams.find(e => e.start > now);
  const focusExam = ongoingExam || nextExam || exams[exams.length - 1];

  let shownCount = 0;
  let prepShownCount = 0;

  document.querySelectorAll('.day-card').forEach(card => {
    const isTargetExam = card.classList.contains('exam-day') && card.dataset.examKey === focusExam.key;
    const cardDate = window.Planner.parseCardDate(card);
    const isTodayPrep = window.Planner.state.focusIncludePrep && card.dataset.type === 'prep' && cardDate && window.Planner.isSameDay(cardDate, now);

    if (isTargetExam || isTodayPrep) {
      shownCount += 1;
      if (isTodayPrep) prepShownCount += 1;
    } else {
      card.classList.add('focus-hidden');
    }
  });

  const examLabel = ongoingExam ? `Ongoing: ${focusExam.name}` : `Next: ${focusExam.name}`;
  window.Planner.updateFocusPanelState('Active', `${examLabel} · Showing ${shownCount} focused card(s), including ${prepShownCount} prep card(s) for today.`);
};

window.toggleFocusMode = function toggleFocusMode() {
  window.Planner.state.focusModeEnabled = !window.Planner.state.focusModeEnabled;
  if (!window.Planner.state.focusModeEnabled) {
    window.applyTypeFilter(window.Planner.state.currentFilterType);
  }
  window.Planner.applyFocusMode(new Date());
};

window.toggleFocusPrep = function toggleFocusPrep() {
  window.Planner.state.focusIncludePrep = !window.Planner.state.focusIncludePrep;
  window.Planner.applyFocusMode(new Date());
};
