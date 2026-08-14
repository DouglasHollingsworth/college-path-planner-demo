// Student Launch button interaction hardening.
(function () {
  const byId = id => document.getElementById(id);

  // Prevent buttons from behaving like implicit submit controls if forms are added later.
  document.querySelectorAll('button').forEach(button => {
    if (!button.hasAttribute('type')) button.type = 'button';
  });

  function showView(viewId) {
    const target = byId(viewId);
    if (!target || !target.classList.contains('view')) return;
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('on', view.id === viewId));
    document.querySelectorAll('#nav button[data-view]').forEach(button => {
      const active = button.dataset.view === viewId;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { window.scrollTo({ top: 160, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 160); }
  }

  // Delegation keeps navigation working even after re-renders or dynamically added buttons.
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    const view = button.dataset.view;
    const goTo = button.dataset.go;
    if (view || goTo) {
      event.preventDefault();
      showView(view || goTo);
      return;
    }

    // Give immediate tactile/visual feedback on ordinary action buttons.
    button.classList.add('pressed');
    window.setTimeout(() => button.classList.remove('pressed'), 140);
  });

  // Make the generated Explore/Selected buttons report state accessibly after each render.
  function syncButtonState() {
    document.querySelectorAll('button').forEach(button => {
      if (!button.hasAttribute('type')) button.type = 'button';
      if (button.classList.contains('on') || button.textContent.includes('Selected')) {
        button.setAttribute('aria-pressed', 'true');
      } else if (button.classList.contains('btn') || button.closest('#nav')) {
        button.setAttribute('aria-pressed', 'false');
      }
    });
  }

  const observer = new MutationObserver(syncButtonState);
  observer.observe(document.body, { childList: true, subtree: true });
  syncButtonState();
})();