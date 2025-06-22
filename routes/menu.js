// routes/menu.js

const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { isAuthenticated } = require('../middleware/auth');

// GET /menu - Display available menu items
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const menu = await MenuItem.find({ available: true });
    res.render('menu/menu.html', {
      user: req.session.user,
      menu
    });
  } catch (err) {
    console.error('❌ Error fetching menu:', err);
    req.flash('error', 'Could not load menu.');
    res.redirect('/');
  }
});

// POST /menu/order - Place an order
router.post('/order', isAuthenticated, async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    req.flash('error', 'No items selected.');
    return res.redirect('/menu');
  }

  try {
    let total = 0;
    const validatedItems = items.map(item => {
      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.price);
      if (!quantity || !price || quantity < 1 || price < 0) throw new Error('Invalid item data');
      total += price * quantity;
      return {
        name: item.name,
        price,
        quantity
      };
    });

    const order = new Order({
      user: req.session.user._id,
      items: validatedItems,
      total
    });

    await order.save();
    req.flash('success', 'Order placed successfully!');
    res.redirect('/menu');
  } catch (error) {
    console.error('❌ Order processing failed:', error);
    req.flash('error', 'Failed to process your order.');
    res.redirect('/menu');
  }
});

module.exports = router;
    
