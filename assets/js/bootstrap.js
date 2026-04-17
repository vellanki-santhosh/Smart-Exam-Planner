window.Planner = window.Planner || {};

window.Planner.streakState = window.Planner.loadStreakState();
window.Planner.seedStreakActivity();
window.Planner.rebuildStreak();

window.openFeatureTool = function openFeatureTool(panelId) {
  document.body.classList.add('features-open');
  document.querySelectorAll('.feature-hub .feature-panel').forEach(panel => {
    panel.classList.toggle('feature-active', panel.id === panelId);
  });

  const panel = document.getElementById(panelId);
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.Planner.updateCountdown();
setInterval(window.Planner.updateCountdown, 30000);

// Stagger card animations.
document.querySelectorAll('.day-card').forEach((card, i) => {
  card.style.animationDelay = (i * 0.04) + 's';
});
