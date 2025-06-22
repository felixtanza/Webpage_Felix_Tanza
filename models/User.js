// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true },
  password: String,
  photo: String,
});

module.exports = mongoose.model('User', userSchema);
