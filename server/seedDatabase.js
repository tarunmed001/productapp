const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const products = require('./products');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} products inserted successfully`);

    // Log the inserted products
    insertedProducts.forEach(product => {
      console.log(`Added: ${product.name} with ID: ${product._id}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();