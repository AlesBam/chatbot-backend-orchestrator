const { request } = require('../utils/http');
const config = require('../../config');
const { geocodeCity } = require('./geocoding.service');

const WMO_CODE_DESCRIPTIONS = {
  0: 'jasno',
  1: 'převážně jasno',
  2: 'polojasno',
  3: 'zataženo',
  45: 'mlha',
  48: 'namrzající mlha',
  51: 'slabé mrholení',
  53: 'mrholení',
  55: 'husté mrholení',
  56: 'slabé mrznoucí mrholení',
  57: 'husté mrznoucí mrholení',
  61: 'slabý déšť',
  63: 'déšť',
  65: 'silný déšť',
  66: 'slabý mrznoucí déšť',
  67: 'silný mrznoucí déšť',
  71: 'slabé sněžení',
  73: 'sněžení',
  75: 'silné sněžení',
  77: 'sněhové zrno',
  80: 'slabé přeháňky',
  81: 'přeháňky',
  82: 'silné přeháňky',
  85: 'slabé sněhové přeháňky',
  86: 'silné sněhové přeháňky',
  95: 'bouřka',
  96: 'bouřka s kroupami',
  99: 'silná bouřka s kroupami',
};

function describeWeatherCode(code) {
  return WMO_CODE_DESCRIPTIONS[code] || 'neznámé počasí';
}

async function getWeather(cityName) {
  const { latitude, longitude, name } = await geocodeCity(cityName);

  const url = `${config.openMeteoBaseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  const data = await request(url, {
    timeout: config.timeouts.weatherApi,
    service: 'open-meteo',
  });

  return {
    cityName: name,
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    description: describeWeatherCode(data.current_weather.weathercode),
  };
}

module.exports = { getWeather, describeWeatherCode };
