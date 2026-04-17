window.Planner = window.Planner || {};

window.Planner.selfTestLibrary = {
  os: [
    { prompt: 'Explain FCFS, SJF, and Round Robin in one line each.', hint: 'Focus on scheduling order and fairness.' },
    { prompt: 'What is a critical section and why does it matter?', hint: 'Mention mutual exclusion and race conditions.' },
    { prompt: 'Describe paging with a simple example.', hint: 'Talk about frames, pages, and page tables.' }
  ],
  dl: [
    { prompt: 'What is backpropagation used for?', hint: 'Explain gradient flow and weight updates.' },
    { prompt: 'Compare CNN and RNN in one short answer.', hint: 'CNN for spatial data, RNN for sequence data.' },
    { prompt: 'What does regularization help prevent?', hint: 'Overfitting is the key idea.' }
  ],
  dv: [
    { prompt: 'Why are Gestalt principles important in visualization?', hint: 'They guide perception and grouping.' },
    { prompt: 'What is a visualization reference model?', hint: 'It connects data, encoding, and interaction.' },
    { prompt: 'Name one use case for heatmaps and one for networks.', hint: 'Mention comparison and relationship patterns.' }
  ],
  cloud: [
    { prompt: 'Differentiate IaaS, PaaS, and SaaS briefly.', hint: 'Think infrastructure, platform, software.' },
    { prompt: 'Why is virtualization important in cloud computing?', hint: 'It improves resource sharing and isolation.' },
    { prompt: 'What is the shared responsibility model?', hint: 'Cloud provider vs customer duties.' }
  ],
  dm: [
    { prompt: 'What is the disaster management cycle?', hint: 'Preparedness, response, recovery, mitigation.' },
    { prompt: 'Why are case studies useful in DM answers?', hint: 'They make answers practical and realistic.' },
    { prompt: 'How does GIS help during disasters?', hint: 'Mapping, monitoring, and response planning.' }
  ],
  soft: [
    { prompt: 'Write a 3-point answer on communication skills.', hint: 'Define, explain, give one example.' },
    { prompt: 'Why is teamwork important in professional settings?', hint: 'Mention collaboration and shared goals.' },
    { prompt: 'What makes a good presentation answer in an exam?', hint: 'Structure, confidence, and example.' }
  ],
  nptel: [
    { prompt: 'How would you prepare from weekly assignment questions?', hint: 'Use assignment-based recall and concept review.' },
    { prompt: 'What is the safest way to revise for MCQ-heavy exams?', hint: 'Short notes, concept maps, and practice tests.' },
    { prompt: 'Explain why lecture content matters in NPTEL prep.', hint: 'It frames the questions and concepts.' }
  ]
};

window.Planner.setSelfTestMode = function setSelfTestMode(mode) {
  if (!['quick', 'timed', 'deep'].includes(mode)) return;
  window.Planner.state.selfTestMode = mode;
  window.Planner.updateCountdown();
};

window.Planner.setSelfTestQuestionCount = function setSelfTestQuestionCount(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.selfTestQuestionCount = Math.min(6, Math.max(2, parsed));
  window.Planner.updateCountdown();
};

window.Planner.setSelfTestTimerMinutes = function setSelfTestTimerMinutes(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return;
  window.Planner.state.selfTestTimerMinutes = Math.min(20, Math.max(5, parsed));
  window.Planner.updateCountdown();
};

window.Planner.toggleSelfTestShuffle = function toggleSelfTestShuffle(isChecked) {
  window.Planner.state.selfTestShuffleOrder = Boolean(isChecked);
  window.Planner.updateCountdown();
};

window.Planner.toggleSelfTestAnswers = function toggleSelfTestAnswers(isChecked) {
  window.Planner.state.selfTestShowAnswers = Boolean(isChecked);
  window.Planner.updateCountdown();
};

window.Planner.resolveSelfTestSubject = function resolveSelfTestSubject(now, nextExam, ongoingExam) {
  if (ongoingExam) return ongoingExam.key === 'nptel-1' || ongoingExam.key === 'nptel-2' ? 'nptel' : ongoingExam.key;
  if (nextExam) return nextExam.key === 'nptel-1' || nextExam.key === 'nptel-2' ? 'nptel' : nextExam.key;
  return 'soft';
};

window.Planner.shuffleArray = function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

window.Planner.renderSelfTest = function renderSelfTest(now, nextExam, ongoingExam) {
  const mode = window.Planner.state.selfTestMode;
  const questionCount = window.Planner.state.selfTestQuestionCount;
  const timerMinutes = window.Planner.state.selfTestTimerMinutes;
  const shuffle = window.Planner.state.selfTestShuffleOrder;
  const showAnswers = window.Planner.state.selfTestShowAnswers;
  const subjectKey = window.Planner.resolveSelfTestSubject(now, nextExam, ongoingExam);
  const badge = document.getElementById('selfTestBadge');
  const questionCountOutput = document.getElementById('selfTestQuestionCountOutput');
  const timerOutput = document.getElementById('selfTestTimerMinutesOutput');
  const shuffleToggle = document.getElementById('selfTestShuffleToggle');
  const answersToggle = document.getElementById('selfTestAnswersToggle');

  if (badge) badge.textContent = `${mode} mode`;
  if (questionCountOutput) questionCountOutput.textContent = `${questionCount} cards`;
  if (timerOutput) timerOutput.textContent = `${timerMinutes}m`;
  if (shuffleToggle) shuffleToggle.checked = shuffle;
  if (answersToggle) answersToggle.checked = showAnswers;

  const modeButtons = {
    quick: document.getElementById('selfTestModeQuick'),
    timed: document.getElementById('selfTestModeTimed'),
    deep: document.getElementById('selfTestModeDeep')
  };
  Object.entries(modeButtons).forEach(([key, button]) => {
    if (button) button.classList.toggle('active', key === mode);
  });

  const library = window.Planner.selfTestLibrary[subjectKey] || window.Planner.selfTestLibrary.soft;
  const selectedCards = shuffle ? window.Planner.shuffleArray(library).slice(0, questionCount) : library.slice(0, questionCount);
  const questionItems = selectedCards.map((card, index) => {
    const prefix = mode === 'timed' ? `Q${index + 1} · ${Math.max(1, Math.round(timerMinutes / questionCount))}m` : `Card ${index + 1}`;
    const answerHtml = showAnswers ? `<span style="display:block;margin-top:6px;color:#cbd5e1;">Hint: ${card.hint}</span>` : '';
    return `<li class="selftest-question"><strong>${prefix}: ${card.prompt}</strong><span>Answer from memory first.${answerHtml}</span></li>`;
  }).join('');

  const leadingText = ongoingExam
    ? `Live exam context detected for ${ongoingExam.name}.`
    : nextExam
      ? `Next exam context: ${nextExam.name}.`
      : 'Post-exam context detected.';

  const modeText = mode === 'quick'
    ? 'Quick recall cards'
    : mode === 'timed'
      ? 'Timed recall challenge'
      : 'Deep recall and explanation cards';

  document.getElementById('selfTestQuestionList').innerHTML = questionItems;
  document.getElementById('selfTestMeta').textContent = `${leadingText} ${modeText} for ${window.Planner.getRevisionSubjectLabel(subjectKey)}. ${timerMinutes} minute setting with ${questionCount} card(s).`;
};
