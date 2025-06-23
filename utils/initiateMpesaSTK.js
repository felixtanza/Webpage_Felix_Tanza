const axios = require('axios');
require('dotenv').config();

const initiateMpesaSTK = async ({ phone, amount, orderId }) => {
  try {
    // Format phone number to 2547...
    const formattedPhone = phone.startsWith('0')
      ? phone.replace(/^0/, '254')
      : phone.startsWith('+') 
      ? phone.replace(/^\+/, '')
      : phone;

    // 1. Get access token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const tokenRes = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2. Generate timestamp and password
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:\.Z]/g, '')
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // 3. Initiate STK Push
    const stkPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BASE_URL}/mpesa/callback`,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: 'Tanfel Hotel Food Order',
    };

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return stkRes.data;
  } catch (error) {
    console.error('M-Pesa STK Error:', error.response?.data || error.message);
    return { ResponseCode: '1', error: 'M-Pesa STK Failed' };
  }
};

module.exports = initiateMpesaSTK;
