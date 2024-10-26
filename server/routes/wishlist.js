const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching wishlist items from database...');
    const wishlistItems = await Wishlist.find().populate('productId');
    console.log('Wishlist items fetched:', wishlistItems);
    res.json(wishlistItems);
  } catch (err) {
    console.error('Error fetching wishlist items:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlistItem = await Wishlist.findOne({ productId });

    if (wishlistItem) {
      // If item exists, remove it
      await Wishlist.findByIdAndDelete(wishlistItem._id);
      res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      // If item doesn't exist, add it
      wishlistItem = new Wishlist({ productId });
      await wishlistItem.save();
      res.json({ message: 'Added to wishlist', action: 'added' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Removing wishlist item with id:', id);
    await Wishlist.findByIdAndDelete(id);
    const updatedWishlist = await Wishlist.find().populate('productId');
    res.json({ message: 'Item removed from wishlist', wishlist: updatedWishlist });
  } catch (err) {
    console.error('Error removing wishlist item:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;