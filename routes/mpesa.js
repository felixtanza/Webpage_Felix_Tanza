const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/stk', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await generateToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'Tanfel Hotel',
        TransactionDesc: 'Food Payment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Mpesa STK error:', error.message);
    res.status(500).send('Mpesa request failed');
  }
});

function getTimestamp() {
  const date = new Date();
  return (
    date.getFullYear().toString() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
}

async function generateToken() {
  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      auth: {
        username: process.env.MPESA_CONSUMER_KEY,
        password: process.env.MPESA_CONSUMER_SECRET
      }
    }
  );
  return data.access_token;
}

module.exports = router;
        
