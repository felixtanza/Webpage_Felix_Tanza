const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const menu = await MenuItem.find({ available: true });
    res.render('menu/menu.html', { user: req.session.user, menu });
  } catch (err) {
    console.error('Menu fetch failed:', err);
    req.flash('error', 'Could not load menu');
    res.redirect('/');
  }
});

router.post('/order', ensureAuthenticated, async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) {
    req.flash('error', 'No items selected.');
    return res.redirect('/menu');
  }

  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({
      user: req.session.userId,
      items,
      total,
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
      
