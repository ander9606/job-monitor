const axios = require('axios');

// Global axios defaults
const DEFAULT_UA = 'JobMonitor/1.0 (+https://github.com/ander9606/job-monitor)';
axios.defaults.headers.common['User-Agent'] = DEFAULT_UA;
axios.defaults.timeout = 15000;

// Simple retry interceptor for transient errors (5xx, network)
const MAX_RETRIES = 2;
axios.interceptors.response.use(null, async (error) => {
  const config = error.config;
  if (!config) return Promise.reject(error);
  config.__retryCount = config.__retryCount || 0;
  const status = error.response?.status;
  // Retry on network errors or 5xx, and on 429
  if (config.__retryCount < MAX_RETRIES && (error.code === 'ECONNABORTED' || !error.response || status >= 500 || status === 429)) {
    config.__retryCount += 1;
    const delay = 500 * Math.pow(2, config.__retryCount);
    await new Promise(r => setTimeout(r, delay));
    return axios(config);
  }
  return Promise.reject(error);
});

module.exports = axios;
