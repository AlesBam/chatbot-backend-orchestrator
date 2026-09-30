const { request } = require('../utils/http');
const { CityNotFoundError } = require('../utils/errors');
const config = require('../../config');

// Open-Meteo geocoding hledá jen podle 1. pádu a na skloněné tvary fuzzy-matchne
// na nesouvisející místo (bez chyby) – pokrýváme jen nejběžnější česká města,
// zbytek skloněných tvarů zůstává zdokumentovaným omezením.
const DECLINED_CITY_FORMS = {
  praze: 'Praha',
  brně: 'Brno',
  ostravě: 'Ostrava',
  plzni: 'Plzeň',
  olomouci: 'Olomouc',
  liberci: 'Liberec',
  zlíně: 'Zlín',
  pardubicích: 'Pardubice',
};

function normalizeCityName(cityName) {
  const normalized = DECLINED_CITY_FORMS[cityName.trim().toLowerCase()];
  return normalized || cityName;
}

async function geocodeCity(cityName) {
  const normalizedCityName = normalizeCityName(cityName);
  const url = `${config.geocodingBaseUrl}/search?name=${encodeURIComponent(normalizedCityName)}&count=1&language=cs&format=json`;

  const data = await request(url, {
    timeout: config.timeouts.geocodingApi,
    service: 'geocoding-api',
  });

  if (!data.results || data.results.length === 0) {
    throw new CityNotFoundError(cityName);
  }

  const { latitude, longitude, name } = data.results[0];
  return { latitude, longitude, name };
}

module.exports = { geocodeCity, normalizeCityName };
