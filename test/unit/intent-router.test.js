const test = require('node:test');
const assert = require('node:assert/strict');
const { matchIntent } = require('../../src/router/intent.router');

test('rozpozná track_order', () => {
  assert.equal(matchIntent('jaký je stav objednávky?'), 'track_order');
});

test('rozpozná check_weather i u slova s diakritikou na konci (regresní test)', () => {
  // \b v JS ignoruje diakritiku – bez WORD_BOUNDARY_END fixu by tohle nematchlo vůbec
  assert.equal(matchIntent('jaké bude počasí?'), 'check_weather');
  assert.equal(matchIntent('počasí'), 'check_weather');
});

test('nematchne slovo jako substring jiného delšího slova', () => {
  assert.equal(matchIntent('nechci info o počasích'), null);
});

test('rozpozná help', () => {
  assert.equal(matchIntent('pomoc'), 'help');
});

test('vrátí null, když zpráva nic nematchne', () => {
  assert.equal(matchIntent('asdkjqwheqjwhe'), null);
});

test('specifičtější intent vyhraje nad help, i když zpráva obsahuje obojí', () => {
  assert.equal(matchIntent('pomoc, jaký je stav objednávky?'), 'track_order');
});
