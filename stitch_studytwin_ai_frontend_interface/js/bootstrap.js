// Confirms backend connectivity on load. Console-only by design — it does
// not touch the DOM, so it never affects the page's UI.
(function () {
  if (!window.healthService) return;
  window.healthService
    .checkHealth()
    .then((data) => console.log('[StudyTwin AI] backend connected:', data))
    .catch((err) => console.warn('[StudyTwin AI] backend unavailable:', err.message));
})();
