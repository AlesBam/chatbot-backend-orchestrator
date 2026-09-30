// Vlastní testovací port – nesmí kolidovat s appkou spuštěnou ručně přes `npm start`.
// Musí se nastavit PŘED require('../../config'), protože config čte process.env.PORT
// jen jednou při načtení modulu.
process.env.PORT = '3999';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const config = require('../../config');
const app = require('../../src/app');

let server;

test.before(() => {
  server = app.listen(config.port);
});

test.after(() => {
  server.close();
});

test('help vrátí statickou nápovědu', async () => {
  const res = await request(server)
    .post('/message')
    .send({ sessionId: 'it-help', message: 'pomoc' });

  assert.equal(res.status, 200);
  assert.match(res.body.reply, /Umím ti pomoct/);
});

test('validace – chybí sessionId vrátí 400 se správným kódem', async () => {
  const res = await request(server).post('/message').send({ message: 'ahoj' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'MISSING_SESSION_ID');
});

test('fallback streak – po 5 nerozpoznaných zprávách automaticky nabídne help', async () => {
  const sessionId = 'it-fallback-streak';
  let lastReply;

  for (let i = 0; i < 5; i += 1) {
    const res = await request(server)
      .post('/message')
      .send({ sessionId, message: `blabla${i}` });
    lastReply = res.body.reply;
  }

  assert.match(lastReply, /Umím ti pomoct/);
});

test('track_order – úspěšný multi-turn flow (deterministický orderId "success")', async () => {
  const sessionId = 'it-order-success';

  const r1 = await request(server)
    .post('/message')
    .send({ sessionId, message: 'jaký je stav objednávky?' });
  assert.equal(r1.body.reply, 'Jaké je číslo objednávky?');

  const r2 = await request(server).post('/message').send({ sessionId, message: 'success' });
  assert.match(r2.body.reply, /^Stav objednávky success: (processing|shipped|delivered|cancelled)$/);
});

test('track_order – error500 vrátí ApiError fallback hlášku', async () => {
  const sessionId = 'it-order-error';

  await request(server).post('/message').send({ sessionId, message: 'jaký je stav objednávky?' });
  const r2 = await request(server).post('/message').send({ sessionId, message: 'error500' });

  assert.equal(r2.body.reply, 'Nepodařilo se zjistit stav objednávky, zkus to prosím znovu.');
});

// Pomalejší test (reálné čekání na simulovaný timeout) – ověřuje i to, že po
// chybě zůstává pending stav se zapamatovaným orderId pro automatický retry.
test('track_order – timeout dá fallback a retry použije stejné orderId', async () => {
  const sessionId = 'it-order-timeout';

  await request(server).post('/message').send({ sessionId, message: 'jaký je stav objednávky?' });

  const r2 = await request(server)
    .post('/message')
    .timeout(10000)
    .send({ sessionId, message: 'timeout' });
  assert.equal(r2.body.reply, 'Systém pro sledování objednávek neodpovídá, zkus to prosím za chvíli.');

  const r3 = await request(server)
    .post('/message')
    .timeout(10000)
    .send({ sessionId, message: 'zkus znovu' }); // nematchne žádný regex -> jde do pending handleru
  assert.equal(r3.body.reply, 'Systém pro sledování objednávek neodpovídá, zkus to prosím za chvíli.');
});

test('check_weather – multi-turn flow (fetch zmockovaný, žádná reálná síť)', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.includes('geocoding-api')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ results: [{ latitude: 50.08, longitude: 14.42, name: 'Praha' }] }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ current_weather: { temperature: 10, windspeed: 5, weathercode: 0 } }),
    };
  });

  const sessionId = 'it-weather';

  const r1 = await request(server)
    .post('/message')
    .send({ sessionId, message: 'jaké bude počasí?' });
  assert.equal(r1.body.reply, 'Pro jaké město chceš znát počasí?');

  const r2 = await request(server).post('/message').send({ sessionId, message: 'Praha' });
  assert.equal(r2.body.reply, 'Praha: jasno, 10 °C, vítr 5 km/h.');
});
