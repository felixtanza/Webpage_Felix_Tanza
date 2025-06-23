const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem'); // Ensure path is correct

dotenv.config();

const sampleItems = [
  {
    name: "Chicken Biryani",
    description: "Spiced rice with marinated chicken",
    price: 450,
    image: "/images/biryani.jpg",
    available: true
  },
  {
    name: "Beef Stew",
    description: "Slow-cooked beef with vegetables",
    price: 400,
    image: "/images/beef_stew.jpg",
    available: true
  },
  {
    name: "Chapati & Beans",
    description: "Kenyan-style chapati with fried beans",
    price: 250,
    image: "/images/chapati_beans.jpg",
    available: true
  },
  {
    name: "Ugali & Sukuma",
    description: "Classic Kenyan ugali with sukuma wiki",
    price: 200,
    image: "/images/ugali_sukuma.jpg",
    available: true
  },
  {
    name: "Grilled Chicken",
    description: "Spicy grilled chicken quarter",
    price: 500,
    image: "/images/grilled_chicken.jpg",
    available: true
  },
  {
    name: "Fried Tilapia",
    description: "Deep-fried tilapia fish served with kachumbari",
    price: 550,
    image: "/images/fried_tilapia.jpg",
    available: true
  },
  {
    name: "Pilau",
    description: "Aromatic spiced rice with beef",
    price: 400,
    image: "/images/pilau.jpg",
    available: true
  },
  {
    name: "Samosa (2pcs)",
    description: "Crispy triangle beef samosas",
    price: 100,
    image: "/images/samosa.jpg",
    available: true
  },
  {
    name: "French Fries",
    description: "Crispy golden fries",
    price: 200,
    image: "/images/fries.jpg",
    available: true
  },
  {
    name: "Chapati Roll",
    description: "Stuffed chapati with veggies & meat",
    price: 300,
    image: "/images/chapati_roll.jpg",
    available: true
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await MenuItem.deleteMany(); // Optional: clear existing
    await MenuItem.insertMany(sampleItems);
    console.log('✅ Menu items inserted successfully');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Failed to insert menu items:', err);
    process.exit(1);
  });
    
