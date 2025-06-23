// routes/admin.js
const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Admin dashboard
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();
    const menuItems = await MenuItem.countDocuments();
    res.render('admin/dashboard.html', {
      user: req.session.user,
      stats: { users, orders, menuItems }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    req.flash('error', 'Failed to load admin dashboard');
    res.redirect('/');
  }
});

module.exports = router;
        
