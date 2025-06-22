// routes/payment.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const axios = require('axios');
const { isAuthenticated } = require('../middleware/auth');
const logger = require('../utils/logger');

// M-Pesa credentials
const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

// === Initiate M-Pesa Payment ===
router.post('/mpesa', isAuthenticated, async (req, res) => {
  const { phone, orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'pending') return res.status(404).json({ error: 'Invalid order' });

    const tokenRes = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      auth: { username: MPESA_CONSUMER_KEY, password: MPESA_CONSUMER_SECRET }
    });

    const token = tokenRes.data.access_token;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await axios.post(
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
        AccountReference: 'TanfelHotel',
        TransactionDesc: 'Order Payment'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    logger.info(`STK Push initiated for order ${orderId}`, response.data);
    res.json({ success: true, message: 'STK Push Sent' });

  } catch (error) {
    logger.error('M-Pesa error:', error.message);
    res.status(500).json({ error: 'Payment failed, try again.' });
  }
});

// === PayPal payment route placeholder ===
// You'd use PayPal SDK here, skipped for brevity but will add if needed

// === Airtel Money placeholder ===
// Usually uses APIs similar to M-Pesa with different keys

module.exports = router;
             
