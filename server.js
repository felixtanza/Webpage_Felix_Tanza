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

// Check environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in environment variables.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing in environment variables.');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Logger
app.use(morgan('dev'));

// Sessions
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // set to true if using HTTPS
    },
  })
);

// Flash messages
app.use(flash());

// Middleware for flash and user session
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
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const mpesaRoutes = require('./routes/mpesa');
const paymentRoutes = require('./routes/payment');
const mpesaCb = require('./routes/mpesaCallback');

// Mount routes
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/order', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/mpesa', mpesaRoutes);
app.use('/payment', paymentRoutes);
app.use(mpesaCb);

// Home redirect
app.get('/', (req, res) => {
  res.redirect('/menu');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).render('error', { error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
                          
