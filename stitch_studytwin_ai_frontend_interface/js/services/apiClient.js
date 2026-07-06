// Shared Axios instance for all StudyTwin AI frontend screens.
// Loaded via a plain <script> tag (no bundler), so it hangs its export off
// `window` rather than using ES module import/export.
//
// Load order on each page: /env.js -> axios (CDN) -> this file -> feature
// service files (e.g. healthService.js) that use window.apiClient.
(function () {
  if (typeof axios === 'undefined') {
    console.error('[apiClient] axios is not loaded — check the CDN <script> tag on this page.');
    return;
  }

  const baseURL = (window.__ENV__ && window.__ENV__.API_BASE_URL) || 'http://localhost:4000/api/v1';

  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response ? error.response.status : 'network error';
      console.error(`[apiClient] ${error.config && error.config.method ? error.config.method.toUpperCase() : ''} ${error.config ? error.config.url : ''} failed (${status}):`, error.message);
      return Promise.reject(error);
    }
  );

  window.apiClient = apiClient;
})();
