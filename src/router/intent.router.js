const trackOrder = require('../intents/track_order');
const checkWeather = require('../intents/check_weather');
const help = require('../intents/help');
const fallback = require('../intents/fallback');
const { appendHistory } = require('../session/session.store');

// \b v JS bere jako "slovní" znaky jen [A-Za-z0-9_] – ignoruje diakritiku, takže
// \bpočasí\b nematchne ani samotné slovo "počasí". Proto vlastní hranice přes
// lookaround s \p{L} (vyžaduje flag "u").
const WORD_BOUNDARY_START = '(?<![\\p{L}\\p{N}_])';
const WORD_BOUNDARY_END = '(?![\\p{L}\\p{N}_])';

function wordPattern(alternatives) {
  return new RegExp(`${WORD_BOUNDARY_START}(?:${alternatives})${WORD_BOUNDARY_END}`, 'iu');
}

// Pořadí je záměrné – specifičtější patterny první, "help" poslední (matchuje skoro cokoliv).
const INTENTS = [
  { name: 'track_order', pattern: wordPattern('track|order|stav objednávky|objednávk\\p{L}*|zásilka|balík') },
  { name: 'check_weather', pattern: wordPattern('weather|počasí|prší|forecast|teplota') },
  { name: 'help', pattern: wordPattern('help|pomoc|co umíš|nápověda') },
];

const HANDLERS = {
  track_order: trackOrder,
  check_weather: checkWeather,
  help,
};

function matchIntent(message) {
  for (const intent of INTENTS) {
    if (intent.pattern.test(message)) {
      return intent.name;
    }
  }
  return null;
}

async function route(message, session) {
  appendHistory(session, 'user', message);

  const matchedName = matchIntent(message);
  let intentName;

  if (matchedName) {
    // regex má vždy prioritu nad pendingIntent – escape hatch z rozdělaného multi-turn flow
    session.pendingIntent = null;
    session.pendingField = null;
    intentName = matchedName;
  } else if (session.pendingIntent) {
    intentName = session.pendingIntent;
  } else {
    intentName = 'fallback';
  }

  const handler = intentName === 'fallback' ? fallback : HANDLERS[intentName];
  const result = await handler.handle(message, session);

  session.lastIntent = intentName;
  if (intentName !== 'fallback') {
    session.fallbackStreak = 0;
  }

  appendHistory(session, 'bot', result.reply);

  return result;
}

module.exports = { route, matchIntent };
