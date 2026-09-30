const { TimeoutError, ApiError } = require('./errors');

async function request(url, options = {}) {
  const { method = 'GET', timeout = 5000, service } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { method, signal: controller.signal });

    if (!response.ok) {
      throw new ApiError(service, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new TimeoutError(service);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { request };
