const test = require('node:test');
const assert = require('node:assert/strict');
const checkWeather = require('../../src/intents/check_weather');

function freshSession() {
  return { context: {}, pendingIntent: null, pendingField: null };
}

// Stejná logika jako u track_order testu – testujeme jen větev, co nevolá
// žádnou service (nenalezené město ve zprávě), zbytek pokrývají integrační testy.
test('bez rozpoznaného města ve zprávě se zeptá a nastaví pending stav', async () => {
  const session = freshSession();
  const result = await checkWeather.handle('jaké bude počasí?', session);

  assert.equal(result.reply, 'Pro jaké město chceš znát počasí?');
  assert.equal(session.pendingIntent, 'check_weather');
  assert.equal(session.pendingField, 'city');
});
