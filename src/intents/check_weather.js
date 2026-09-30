const { getWeather } = require('../services/weather.service');
const { CityNotFoundError, TimeoutError, ApiError } = require('../utils/errors');

// Naivní extrakce – jen slovo/slova za předložkou "v"/"ve"/"pro". Skloňování
// mimo pár měst v geocoding.service.js neřešíme (zdokumentované omezení).
const CITY_PATTERN = /\b(?:v|ve|pro)\b\s+([\p{L}\s]+)/iu;

function extractCity(message) {
  const match = message.match(CITY_PATTERN);
  return match ? match[1].trim() : null;
}

async function handle(message, session) {
  const city = session.pendingField === 'city' ? message.trim() : extractCity(message);

  if (!city) {
    session.pendingIntent = 'check_weather';
    session.pendingField = 'city';
    return { reply: 'Pro jaké město chceš znát počasí?' };
  }

  try {
    const weather = await getWeather(city);
    session.pendingIntent = null;
    session.pendingField = null;
    return {
      reply: `${weather.cityName}: ${weather.description}, ${weather.temperature} °C, vítr ${weather.windspeed} km/h.`,
    };
  } catch (err) {
    if (err instanceof CityNotFoundError) {
      session.pendingIntent = 'check_weather';
      session.pendingField = 'city';
      return { reply: `Město "${city}" se mi nepodařilo najít, zkus to prosím znovu.` };
    }
    if (err instanceof TimeoutError) {
      session.pendingIntent = 'check_weather';
      session.pendingField = 'city';
      return { reply: 'Předpověď počasí teď neodpovídá, zkus to prosím za chvíli.' };
    }
    if (err instanceof ApiError) {
      session.pendingIntent = 'check_weather';
      session.pendingField = 'city';
      return { reply: 'Nepodařilo se zjistit počasí.' };
    }
    throw err;
  }
}

module.exports = { handle };
