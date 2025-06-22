// routes/mpesaCallback.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const logger = require('../utils/logger');
const User = require('../models/User');

await User.findByIdAndUpdate(order.user, {
  $inc: { loyaltyPoints: 1 }
});


router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const callback = Body?.stkCallback;

    const orderId = callback?.Metadata?.Item?.find(i => i.Name === 'AccountReference')?.Value;
    const amount = callback?.Metadata?.Item?.find(i => i.Name === 'Amount')?.Value;

    if (callback?.ResultCode === 0) {
      await Order.findOneAndUpdate(
        { total: amount, status: 'pending' },
        { status: 'paid' }
      );
      logger.info(`M-Pesa payment confirmed for amount ${amount}`);
    } else {
      logger.warn(`M-Pesa payment failed: ${callback?.ResultDesc}`);
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (err) {
    logger.error('Callback handling failed:', err.message);
    res.status(500).end();
  }
});

module.exports = router;
