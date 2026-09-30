const DEFAULT_TTL_MS = 30 * 60 * 1000;
const DEFAULT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const sessions = new Map();

function createSession(sessionId) {
  const now = Date.now();
  return {
    sessionId,
    lastIntent: null,
    pendingIntent: null,
    pendingField: null,
    context: {},
    fallbackStreak: 0,
    history: [],
    createdAt: now,
    lastActiveAt: now,
  };
}

function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = createSession(sessionId);
    sessions.set(sessionId, session);
  }
  session.lastActiveAt = Date.now();
  return session;
}

function appendHistory(session, role, message) {
  session.history.push({ role, message, timestamp: Date.now() });
}

function startCleanup({ ttlMs = DEFAULT_TTL_MS, intervalMs = DEFAULT_CLEANUP_INTERVAL_MS } = {}) {
  return setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.lastActiveAt > ttlMs) {
        sessions.delete(sessionId);
      }
    }
  }, intervalMs);
}

module.exports = { getOrCreateSession, appendHistory, startCleanup };
