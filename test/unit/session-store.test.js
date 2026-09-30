const test = require('node:test');
const assert = require('node:assert/strict');
const { getOrCreateSession, appendHistory, startCleanup } = require('../../src/session/session.store');

test('vytvoří novou session se správným výchozím tvarem', () => {
  const session = getOrCreateSession('unit-new-session');

  assert.equal(session.sessionId, 'unit-new-session');
  assert.equal(session.pendingIntent, null);
  assert.equal(session.pendingField, null);
  assert.deepEqual(session.context, {});
  assert.equal(session.fallbackStreak, 0);
  assert.deepEqual(session.history, []);
});

test('vrací stejnou referenci pro opakované volání se stejným sessionId', () => {
  const first = getOrCreateSession('unit-same-ref');
  first.context.foo = 'bar';

  const second = getOrCreateSession('unit-same-ref');

  assert.equal(second, first);
  assert.equal(second.context.foo, 'bar');
});

test('appendHistory přidá záznam se správným tvarem', () => {
  const session = getOrCreateSession('unit-history');
  appendHistory(session, 'user', 'ahoj');

  assert.equal(session.history.length, 1);
  assert.equal(session.history[0].role, 'user');
  assert.equal(session.history[0].message, 'ahoj');
  assert.equal(typeof session.history[0].timestamp, 'number');
});

test('startCleanup smaže sessions starší než TTL', async () => {
  const session = getOrCreateSession('unit-ttl');
  session.lastActiveAt = Date.now() - 1000; // uměle "zestárlá" session

  const intervalId = startCleanup({ ttlMs: 50, intervalMs: 20 });

  await new Promise((resolve) => setTimeout(resolve, 100));
  clearInterval(intervalId);

  const recreated = getOrCreateSession('unit-ttl');
  assert.notEqual(recreated, session); // nová instance => stará byla smazána
});
