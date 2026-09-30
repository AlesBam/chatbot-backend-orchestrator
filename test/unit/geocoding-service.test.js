const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCityName } = require('../../src/services/geocoding.service');

test('normalizuje známé skloněné tvary na 1. pád', () => {
  assert.equal(normalizeCityName('Praze'), 'Praha');
  assert.equal(normalizeCityName('praze'), 'Praha'); // case-insensitive
  assert.equal(normalizeCityName('Brně'), 'Brno');
});

test('neznámé nebo už nesklonné jméno nechá beze změny', () => {
  assert.equal(normalizeCityName('Ostrava'), 'Ostrava');
  assert.equal(normalizeCityName('London'), 'London');
});
