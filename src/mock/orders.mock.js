const express = require('express');
const config = require('../../config');

const router = express.Router();

const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

// SIMULATION CONFIG – upravuj pro testování
const FAILURE_RATE = 0.1; // 10% šance na chybu
const TIMEOUT_RATE = 0.05; // 5% šance na timeout (simulováno zpožděním)
const FORCED_DELAY_MS = config.timeouts.orderApi + 2000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;

  // "success" je deterministický opak "timeout"/"error500" – vždy obejde fault
  // injection, aby šla napsat integrační testy na happy-path bez flakiness.
  if (orderId !== 'success') {
    // --- FAULT INJECTION – deterministické i náhodné selhání pro testování fallbacků ---
    if (orderId === 'timeout' || Math.random() < TIMEOUT_RATE) {
      await delay(FORCED_DELAY_MS);
    }

    if (orderId === 'error500' || Math.random() < FAILURE_RATE) {
      return res.status(500).json({ error: 'Simulated server error' });
    }
    // --- END FAULT INJECTION ---
  }

  const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
  res.json({ orderId, status });
});

module.exports = router;
