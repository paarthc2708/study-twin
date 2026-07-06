// Calls the backend's health check endpoint (see backend/src/routes/health.routes.ts).
(function () {
  async function checkHealth() {
    const { data } = await window.apiClient.get('/health');
    return data;
  }

  window.healthService = { checkHealth };
})();
