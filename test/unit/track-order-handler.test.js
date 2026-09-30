const test = require('node:test');
const assert = require('node:assert/strict');
const trackOrder = require('../../src/intents/track_order');

function freshSession() {
  return { context: {}, pendingIntent: null, pendingField: null };
}

// Testujeme jen round 1 (bez orderId) – nevolá order.service, takže žádná síť
// ani mockování. Round 2 (úspěch/chyba, reálné volání service) pokrývají
// integrační testy proti mock order endpointu.
test('bez orderId se zeptá na číslo objednávky a nastaví pending stav', async () => {
  const session = freshSession();
  const result = await trackOrder.handle('jaký je stav objednávky?', session);

  assert.equal(result.reply, 'Jaké je číslo objednávky?');
  assert.equal(session.pendingIntent, 'track_order');
  assert.equal(session.pendingField, 'orderId');
});
