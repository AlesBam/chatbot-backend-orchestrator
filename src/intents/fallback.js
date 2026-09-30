const config = require('../../config');
const help = require('./help');

const FALLBACK_MESSAGE = 'Nerozuměl jsem, zkus to prosím jinak (nebo napiš "pomoc").';

async function handle(message, session) {
  session.fallbackStreak += 1;

  if (session.fallbackStreak >= config.fallbackStreakThreshold) {
    session.fallbackStreak = 0;
    return help.handle(message, session);
  }

  return { reply: FALLBACK_MESSAGE };
}

module.exports = { handle };
