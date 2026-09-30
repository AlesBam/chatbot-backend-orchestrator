const { request } = require('../utils/http');
const config = require('../../config');

async function getOrder(orderId) {
  const url = `http://localhost:${config.port}/mock/orders/${encodeURIComponent(orderId)}`;

  return request(url, {
    timeout: config.timeouts.orderApi,
    service: 'order-api',
  });
}

module.exports = { getOrder };
