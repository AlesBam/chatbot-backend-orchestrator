const { getOrder } = require('../services/order.service');
const { TimeoutError, ApiError } = require('../utils/errors');

async function handle(message, session) {
  if (!session.context.orderId && session.pendingField !== 'orderId') {
    session.pendingIntent = 'track_order';
    session.pendingField = 'orderId';
    return { reply: 'Jaké je číslo objednávky?' };
  }

  if (session.pendingField === 'orderId') {
    session.context.orderId = message.trim();
    session.pendingField = null;
    session.pendingIntent = null;
  }

  try {
    const result = await getOrder(session.context.orderId);
    const reply = `Stav objednávky ${session.context.orderId}: ${result.status}`;

    session.context.orderId = null;
    session.pendingIntent = null;
    session.pendingField = null;

    return { reply };
  } catch (err) {
    // context.orderId zůstává – další zpráva (i necílená) zopakuje dotaz na stejné orderId
    session.pendingIntent = 'track_order';
    session.pendingField = null;

    if (err instanceof TimeoutError) {
      return { reply: 'Systém pro sledování objednávek neodpovídá, zkus to prosím za chvíli.' };
    }
    if (err instanceof ApiError) {
      return { reply: 'Nepodařilo se zjistit stav objednávky, zkus to prosím znovu.' };
    }
    throw err;
  }
}

module.exports = { handle };
