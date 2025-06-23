const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');
const initiateMpesaSTK = require('../utils/initiateMpesaSTK'); // You must create this helper

// GET /menu
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const menu = await MenuItem.find({ available: true });
    const user = await User.findById(req.session.userId);
    res.render('menu/menu.html', { user, menu });
  } catch (err) {
    console.error('Menu fetch failed:', err);
    req.flash('error', 'Could not load menu');
    res.redirect('/');
  }
});

// POST /menu/order
router.post('/order', ensureAuthenticated, async (req, res) => {
  try {
    const { items, total, phoneNumber } = req.body;

    if (!items || !phoneNumber || total <= 0) {
      req.flash('error', 'Invalid order details.');
      return res.redirect('/menu');
    }

    const parsedItems = JSON.parse(items); // Ensure it's parsed

    // Save order before payment (can be marked as 'pending')
    const newOrder = new Order({
      user: req.session.userId,
      items: parsedItems,
      total: Number(total),
      phoneNumber,
      status: 'pending',
    });

    await newOrder.save();

    // Initiate M-Pesa STK Push
    const paymentResponse = await initiateMpesaSTK({
      phone: phoneNumber,
      amount: Number(total),
      orderId: newOrder._id,
    });

    if (paymentResponse.ResponseCode === "0") {
      req.flash('success', 'STK Push sent to your phone. Complete payment.');
    } else {
      req.flash('error', 'Payment initiation failed. Try again.');
    }

    res.redirect('/menu');
  } catch (error) {
    console.error('Order/payment failed:', error);
    req.flash('error', 'Order/payment failed. Try again.');
    res.redirect('/menu');
  }
});

module.exports = router;
  
