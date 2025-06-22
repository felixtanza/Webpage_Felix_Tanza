// routes/mpesaCallback.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body: { stkCallback } } = req.body;
    const result = stkCallback;

    const accountRef = result.CallbackMetadata?.Item.find(i => i.Name === 'AccountReference')?.Value;
    const amount = result.CallbackMetadata?.Item.find(i => i.Name === 'Amount')?.Value;
    const receipt = result.CallbackMetadata?.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

    if (result.ResultCode === 0) {
      const orderId = accountRef.replace('ORDER', '');
      const order = await Order.findById(orderId);
      if (!order) {
        logger.error(`Order not found via callback reference: ${orderId}`);
        return res.status(404).send();
      }
      order.status = 'paid';
      order.paymentMethod = 'M-Pesa';
      order.transactionId = receipt;
      await order.save();

      await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: 1 } });

      logger.info(`M-Pesa callback success for order ${orderId}`);
    } else {
      logger.warn(`M-Pesa payment failed: ${result.ResultDesc}`);
    }

    res.status(200).send({ message: 'Callback processed' });
  } catch (err) {
    logger.error('M-Pesa callback handling error', err.message);
    res.status(500).send();
  }
});

module.exports = router;
