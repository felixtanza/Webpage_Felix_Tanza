// server.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Logger
app.use(morgan('dev'));

// Sessions


app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // Make sure this env variable is set!
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false // true if using https
  }
}));
    

// Flash messages
app.use(flash());

// Middleware for user session and flash messages
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Route imports
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const mpesaRoutes = require('./routes/mpesa');
const paymentRoutes = require('./routes/payment');
const mpesaCb = require('./routes/mpesaCallback');

// Route mounting
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/order', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/mpesa', mpesaRoutes);
app.use('/payment', paymentRoutes);
app.use(mpesaCb); // handles POST /mpesa/callback endpoint




// Home route
app.get('/', (req, res) => {
  res.redirect('/menu');
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).render('error', { error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
                            
