// middleware/auth.js

module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      req.flash('error', 'Please login to view this resource');
      return res.redirect('/auth/login');
    }
  },

  ensureAdmin: (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
      return next();
    } else {
      req.flash('error', 'Admin access only');
      return res.redirect('/');
    }
  }
};
