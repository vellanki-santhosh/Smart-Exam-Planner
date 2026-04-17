window.Planner = window.Planner || {};

window.toggleCard = function toggleCard(card) {
  card.classList.toggle('expanded');
};

window.toggleSyllabusPanel = function toggleSyllabusPanel(event, button) {
  event.stopPropagation();
  const panel = button.nextElementSibling;
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));
};
