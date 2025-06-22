// routes/payment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

// M-Pesa credentials (from .env)
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE = 'sandbox'
} = process.env;

// ===== Initiate M-Pesa STK Push =====
router.post('/mpesa', async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ error: 'Invalid order' });
    }

    // Obtain OAuth token
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data: authRes } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const token = authRes.access_token;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substr(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: order.total,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: `ORDER${orderId}`,
        TransactionDesc: 'Food Order Payment'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    logger.info(`M-Pesa STK Push initiated for order ${orderId}`);
    res.json({ success: true, message: 'STK Push sent to phone.' });
  } catch (err) {
    logger.error('M-Pesa initiation error', err.message);
    res.status(500).json({ error: 'M-Pesa initiation failed.' });
  }
});

// ===== Airtel Money (simulated) =====
router.post('/airtel', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ error: 'Invalid order' });
    }

    order.status = 'paid';
    order.paymentMethod = 'Airtel Money';
    await order.save();

    // Loyality increment (example: 1 point per payment)
    await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: 1 } });

    logger.info(`Airtel Money payment completed for order ${orderId}`);
    res.json({ success: true, message: 'Airtel Money payment successful.' });
  } catch (err) {
    logger.error('Airtel payment error', err.message);
    res.status(500).json({ error: 'Airtel payment failed.' });
  }
});

// ===== PayPal Payment (simplified flow) =====
router.post('/paypal', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ error: 'Invalid order' });
    }

    order.status = 'paid';
    order.paymentMethod = 'PayPal';
    await order.save();

    await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: 1 } });

    logger.info(`PayPal payment recorded for order ${orderId}`);
    res.json({ success: true, message: 'PayPal payment successful.' });
  } catch (err) {
    logger.error('PayPal payment error', err.message);
    res.status(500).json({ error: 'PayPal payment failed.' });
  }
});

module.exports = router;
      
