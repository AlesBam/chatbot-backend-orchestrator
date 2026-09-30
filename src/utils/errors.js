class TimeoutError extends Error {
  constructor(service) {
    super(`${service} timed out`);
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT';
    this.service = service;
  }
}

class ApiError extends Error {
  constructor(service, statusCode) {
    super(`${service} returned ${statusCode}`);
    this.name = 'ApiError';
    this.code = 'API_ERROR';
    this.service = service;
    this.statusCode = statusCode;
  }
}

class CityNotFoundError extends Error {
  constructor(cityName) {
    super(`City not found: ${cityName}`);
    this.name = 'CityNotFoundError';
    this.code = 'CITY_NOT_FOUND';
    this.cityName = cityName;
  }
}

module.exports = { TimeoutError, ApiError, CityNotFoundError };
