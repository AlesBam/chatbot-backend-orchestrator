const express = require('express');
const { validate } = require('./middleware/validate');
const { route } = require('./router/intent.router');
const { getOrCreateSession } = require('./session/session.store');
const ordersMock = require('./mock/orders.mock');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());

app.use('/mock/orders', ordersMock);

// Express 5 automaticky předává odmítnuté promise z async handleru do
// error-handling middleware níže – žádný try/catch tu není potřeba.
app.post('/message', validate, async (req, res) => {
  const { sessionId, message } = req.body;
  const startedAt = Date.now();

  const session = getOrCreateSession(sessionId);
  const result = await route(message, session);

  logger.info('message handled', {
    sessionId,
    message,
    matchedIntent: session.lastIntent,
    reply: result.reply,
    durationMs: Date.now() - startedAt,
  });

  res.json(result);
});

app.use((err, req, res, next) => {
  logger.error('unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
});

module.exports = app;
