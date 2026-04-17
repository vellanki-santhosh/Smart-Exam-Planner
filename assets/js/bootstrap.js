window.Planner = window.Planner || {};

window.Planner.updateCountdown();
setInterval(window.Planner.updateCountdown, 30000);

// Stagger card animations.
document.querySelectorAll('.day-card').forEach((card, i) => {
  card.style.animationDelay = (i * 0.04) + 's';
});
