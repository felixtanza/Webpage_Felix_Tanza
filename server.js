const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');
const ejs = require('ejs');

dotenv.config();

const app = express();

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in environment variables.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in environment variables.');
  process.exit(1);
}

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Register EJS as renderer for .html files
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Logger
app.use(morgan('dev'));

// Session management
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
      secure: false, // change to true if you're using HTTPS
    },
  })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import route modules
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

// Default redirect
app.get('/', (req, res) => res.redirect('/menu'));

// 404 handler
app.use((req, res) => res.status(404).render('404.html', { message: 'Page not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).render('error.html', { error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
