// Georgia-specific pathway intelligence for Student Launch.
// Adds official state pathway resources and current work-based learning diploma guidance
// without inventing school-specific offerings.
(function () {
  const isGeorgia = () => {
    const state = String(S?.profile?.schoolState || S?.profile?.state || '').trim().toLowerCase();
    return state === 'ga' || state === 'georgia';
  };

  const profilePanel = document.querySelector('#profile .panel');
  if (profilePanel && !document.getElementById('gaPathwayCard')) {
    const card = document.createElement('div');
    card.id = 'gaPathwayCard';
    card.className = 'card notice';
    card.style.display = 'none';
    card.innerHTML = `
      <div class="eyebrow">Georgia Pathway Layer</div>
      <h3>Official Georgia career-pathway tools</h3>
      <p class="muted">Georgia CTAE currently offers more than 150 career pathways across 14 career clusters. Use Student Launch to plan, then verify a school's exact offerings through official state and district sources.</p>
      <div class="officialLinks">
        <a href="https://app.gadoe.org/gcp/search" target="_blank" rel="noopener">Search Georgia Career Pipeline ↗</a>
        <a href="https://gadoe.org/ctae/" target="_blank" rel="noopener">Georgia CTAE ↗</a>
      </div>
      <div class="card" style="margin-top:10px">
        <b>New: Work-Based Learning Diploma</b>
        <p>Georgia added a diploma option for students planning to enter high-demand careers. It keeps the 23-credit graduation requirement and includes two High Demand CTAE or Academic Career Pathways plus at least four paid work-based-learning courses connected to a pathway. Verify eligibility and implementation with the school counselor.</p>
      </div>`;
    const saveBtn = document.getElementById('saveProfile');
    profilePanel.insertBefore(card, saveBtn || null);
  }

  function refreshGeorgiaCard() {
    const card = document.getElementById('gaPathwayCard');
    if (card) card.style.display = isGeorgia() ? 'block' : 'none';
  }

  // Enrich Georgia school pathway modals after the school lookup renders them.
  const body = document.getElementById('pathwayModalBody');
  if (body) {
    const observer = new MutationObserver(() => {
      if (!isGeorgia() || body.querySelector('.gaStateLayer')) return;
      const layer = document.createElement('div');
      layer.className = 'card notice gaStateLayer';
      layer.style.marginTop = '10px';
      layer.innerHTML = `
        <b>Georgia statewide pathway check</b>
        <p>Use the Georgia Career Pipeline to confirm current CTAE programs, enrollment, work-based learning, and pathway details for this school or area.</p>
        <div class="officialLinks"><a href="https://app.gadoe.org/gcp/search" target="_blank" rel="noopener">Open Georgia Career Pipeline ↗</a></div>`;
      body.appendChild(layer);
    });
    observer.observe(body, { childList: true, subtree: false });
  }

  document.getElementById('state')?.addEventListener('input', refreshGeorgiaCard);
  document.getElementById('state')?.addEventListener('change', refreshGeorgiaCard);
  document.getElementById('saveProfile')?.addEventListener('click', () => setTimeout(refreshGeorgiaCard, 0));

  // A selected NCES school may set schoolState after a search; watch the selected-school badge.
  const selectedBadge = document.getElementById('selectedSchoolBadge');
  if (selectedBadge) {
    new MutationObserver(refreshGeorgiaCard).observe(selectedBadge, { childList: true, subtree: true });
  }

  refreshGeorgiaCard();
})();