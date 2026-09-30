const config = require('../../config');

function sendError(res, code, message) {
  res.status(400).json({ error: { code, message } });
}

function validate(req, res, next) {
  const { sessionId, message } = req.body || {};

  if (typeof sessionId !== 'string' || sessionId.trim() === '') {
    return sendError(res, 'MISSING_SESSION_ID', 'sessionId is required');
  }

  if (typeof message !== 'string' || message.trim() === '') {
    return sendError(res, 'MISSING_MESSAGE', 'message is required');
  }

  if (message.length > config.maxMessageLength) {
    return sendError(
      res,
      'MESSAGE_TOO_LONG',
      `message must be at most ${config.maxMessageLength} characters`
    );
  }

  next();
}

module.exports = { validate };
