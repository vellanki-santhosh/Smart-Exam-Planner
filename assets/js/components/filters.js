window.Planner = window.Planner || {};

window.applyTypeFilter = function applyTypeFilter(type) {
  window.Planner.state.currentFilterType = type;

  document.querySelectorAll('.day-card').forEach(card => {
    if (type === 'all') {
      card.classList.remove('hidden');
      return;
    }

    const cardType = card.dataset.type;
    if (type === 'exam' && (cardType === 'exam' || cardType === 'lab' || cardType === 'nptel')) {
      card.classList.remove('hidden');
    } else if (type === cardType) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
};

window.filterCards = function filterCards(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.applyTypeFilter(type);
  window.Planner.applyFocusMode(new Date());
};
