// routes/order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// View user order history
router.get('/history', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.render('order/history.html', { orders });
  } catch (err) {
    console.error('Order history error:', err);
    req.flash('error', 'Failed to fetch order history');
    res.redirect('/');
  }
});

// View all orders (admin only)
router.get('/admin', ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.render('order/admin.html', { orders });
  } catch (err) {
    console.error('Admin order view error:', err);
    req.flash('error', 'Failed to fetch orders');
    res.redirect('/');
  }
});

module.exports = router;
