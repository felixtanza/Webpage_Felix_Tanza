// routes/auth.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require('path');

// Configure Multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ GET: Register Page
router.get('/register', (req, res) => {
  res.render('auth/register.html');
});

// ✅ POST: Register User
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/register');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already registered');
      return res.redirect('/auth/register');
    }

    const hash = await bcrypt.hash(password, 10);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const newUser = new User({ username, email, password: hash, photo });
    await newUser.save();

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('❌ Register Error:', err);
    req.flash('error', 'Registration failed due to server error');
    res.redirect('/auth/register');
  }
});

// ✅ GET: Login Page
router.get('/login', (req, res) => {
  res.render('auth/login.html');
});

// ✅ POST: Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id;
    req.flash('success', 'Logged in successfully');
    res.redirect('/menu');
  } catch (err) {
    console.error('❌ Login Error:', err);
    req.flash('error', 'Login failed');
    res.redirect('/auth/login');
  }
});

// ✅ Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

// ✅ GET: Forgot Password Page
router.get('/forgot', (req, res) => {
  res.render('auth/forgot.html');
});

module.exports = router;
    
