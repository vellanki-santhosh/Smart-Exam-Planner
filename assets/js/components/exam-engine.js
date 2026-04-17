window.Planner = window.Planner || {};

window.Planner.setTimer = function setTimer(diffMs) {
  const safeDiff = Math.max(0, diffMs);
  const days = Math.floor(safeDiff / 86400000);
  const hours = Math.floor((safeDiff % 86400000) / 3600000);
  const mins = Math.floor((safeDiff % 3600000) / 60000);

  document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
  document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cdMins').textContent = String(mins).padStart(2, '0');
};

window.Planner.applyExamCardStates = function applyExamCardStates(now) {
  document.querySelectorAll('.day-card.exam-day').forEach(card => {
    const exam = window.Planner.examByKey[card.dataset.examKey];
    if (!exam) return;

    const header = card.querySelector('.day-card-header');
    let badge = header.querySelector('.exam-status-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'exam-status-badge';
      header.insertBefore(badge, header.querySelector('.day-expand-icon'));
    }

    card.classList.remove('exam-ongoing-card', 'exam-completed-card');
    badge.classList.remove('exam-status-ongoing', 'exam-status-upcoming', 'exam-status-completed');

    if (now >= exam.end) {
      card.classList.add('exam-completed-card');
      badge.classList.add('exam-status-completed');
      badge.textContent = 'Completed';
    } else if (now >= exam.start && now < exam.end) {
      card.classList.add('exam-ongoing-card');
      badge.classList.add('exam-status-ongoing');
      badge.textContent = 'Ongoing';
    } else {
      badge.classList.add('exam-status-upcoming');
      badge.textContent = 'Upcoming';
    }
  });
};

window.Planner.updateSmartPanel = function updateSmartPanel(now, completedCount, ongoingCount, remainingCount, nextExam, ongoingExam) {
  const completion = Math.round((completedCount / window.Planner.exams.length) * 100);
  document.getElementById('completionPercent').textContent = `${completion}% complete`;
  document.getElementById('completedCount').textContent = String(completedCount);
  document.getElementById('ongoingCount').textContent = String(ongoingCount);
  document.getElementById('remainingCount').textContent = String(remainingCount);

  const note = document.getElementById('smartRecommendation');
  if (ongoingExam) {
    note.textContent = `Live now: ${ongoingExam.name}. Focus on calm execution and time split per question.`;
    return;
  }

  if (nextExam) {
    const hoursToGo = Math.max(1, Math.floor((nextExam.start - now) / 3600000));
    note.textContent = `Next target: ${nextExam.name} in about ${hoursToGo} hour(s). Revise high-yield topics first.`;
    return;
  }

  note.textContent = 'All exams are completed. Switch to placement prep, interview practice, and project polishing.';
};

window.Planner.updateCountdown = function updateCountdown() {
  const now = new Date();
  const ongoing = window.Planner.exams.find(e => now >= e.start && now < e.end);
  const next = window.Planner.exams.find(e => e.start > now);
  const countdownBox = document.getElementById('countdownBox');
  const countdownLabel = countdownBox.querySelector('.countdown-label');

  const completedCount = window.Planner.exams.filter(e => now >= e.end).length;
  const ongoingCount = window.Planner.exams.filter(e => now >= e.start && now < e.end).length;
  const remainingCount = window.Planner.exams.filter(e => now < e.start).length;

  window.Planner.applyExamCardStates(now);
  window.Planner.updateSmartPanel(now, completedCount, ongoingCount, remainingCount, next, ongoing);
  window.Planner.applyFocusMode(now);
  window.Planner.updateDailyPlan(now, next, ongoing, remainingCount);

  if (ongoing) {
    document.body.classList.remove('exam-completed');
    countdownBox.classList.remove('completed-state');
    countdownLabel.textContent = 'Ongoing Exam';
    document.getElementById('countdownName').textContent = ongoing.name;
    window.Planner.setTimer(ongoing.end - now);
    return;
  }

  if (!next) {
    document.body.classList.add('exam-completed');
    countdownBox.classList.add('completed-state');
    countdownLabel.textContent = 'Exam Status';
    document.getElementById('countdownName').textContent = 'Completed';
    window.Planner.setTimer(0);
    return;
  }

  document.body.classList.remove('exam-completed');
  countdownBox.classList.remove('completed-state');
  countdownLabel.textContent = 'Next Exam';
  document.getElementById('countdownName').textContent = next.name;
  window.Planner.setTimer(next.start - now);
};
