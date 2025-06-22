// routes/menu.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  const menu = await MenuItem.find({ available: true });
  res.render('menu/menu.html', { user: req.session.user, menu });
});

router.post('/order', isAuthenticated, async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) return res.redirect('/menu');

  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({
      user: req.session.user._id,
      items,
      total
    });
    await order.save();
    req.flash('success', 'Order placed successfully!');
    res.redirect('/menu');
  } catch (error) {
    console.error('Order failed:', error);
    req.flash('error', 'Order failed. Try again.');
    res.redirect('/menu');
  }
});

module.exports = router;
