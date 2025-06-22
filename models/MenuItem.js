// models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
