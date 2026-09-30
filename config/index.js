require('dotenv').config();

const config = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  openMeteoBaseUrl: 'https://api.open-meteo.com/v1',
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1',
  timeouts: Object.freeze({
    weatherApi: 5000,
    geocodingApi: 5000,
    orderApi: 3000,
  }),
  fallbackStreakThreshold: 5,
  maxMessageLength: 500,
});

module.exports = config;
