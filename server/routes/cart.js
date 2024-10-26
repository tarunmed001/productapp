const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.find().populate('productId');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Check if the item already exists in the cart
    let cartItem = await Cart.findOne({ productId });

    if (cartItem) {
      // If the item exists, update its quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // If the item doesn't exist, create a new cart item
      cartItem = new Cart({ productId, quantity });
      await cartItem.save();
    }

    // Fetch the updated cart and send it back
    const updatedCart = await Cart.find().populate('productId');
    res.status(201).json(updatedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedCartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    ).populate('productId');
    const updatedCart = await Cart.find().populate('productId');
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    // Fetch the updated cart and send it back
    const updatedCart = await Cart.find().populate('productId');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;