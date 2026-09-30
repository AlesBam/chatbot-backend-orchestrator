const app = require('./app');
const config = require('../config');
const { startCleanup } = require('./session/session.store');
const logger = require('./utils/logger');

startCleanup();

app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});
