const test = require('node:test');
const assert = require('node:assert/strict');
const { describeWeatherCode } = require('../../src/services/weather.service');

test('mapuje známé WMO kódy na český text', () => {
  assert.equal(describeWeatherCode(0), 'jasno');
  assert.equal(describeWeatherCode(61), 'slabý déšť');
  assert.equal(describeWeatherCode(95), 'bouřka');
});

test('neznámý kód vrátí fallback text, nespadne', () => {
  assert.equal(describeWeatherCode(999), 'neznámé počasí');
});
