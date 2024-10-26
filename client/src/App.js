import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Navbar from './pages/Navbar';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCartItems();
    fetchWishlistItems();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      const response = await axios.get('/api/wishlist');
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    }
  };

  const addToCart = useCallback(async (product) => {
    try {
      const response = await axios.post('/api/cart', { productId: product._id, quantity: 1 });
      setCartItems(response.data);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Failed to add to cart. Please try again.');
      setTimeout(() => setMessage(''), 2000);
    }
  }, []);

  const updateQuantity = useCallback(async (id, quantity) => {
    try {
      const response = await axios.put(`/api/cart/${id}`, { quantity });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, []);

  const removeFromCart = useCallback(async (id) => {
    try {
      const response = await axios.delete(`/api/cart/${id}`);
      setCartItems(response.data);
      setMessage('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      setMessage('Failed to remove item from cart');
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    try {
      const response = await axios.post('/api/wishlist/toggle', { productId: product._id });
      await fetchWishlistItems();
      setMessage(response.data.message);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setMessage('Failed to update wishlist. Please try again.');
      setTimeout(() => setMessage(''), 2000);
    }
  }, []);

  const removeFromWishlist = useCallback(async (itemId) => {
    try {
      console.log('Removing item from wishlist:', itemId);
      const response = await axios.delete(`/api/wishlist/${itemId}`);
      console.log('Remove response:', response.data);
      setWishlistItems(response.data.wishlist);
      setMessage('Item removed from wishlist');
      return response.data.wishlist; // Return the updated wishlist
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessage('Failed to remove item from wishlist');
      throw error; // Throw the error so it can be caught in the WishlistPage component
    }
  }, []);
  const isInWishlist = useCallback((productId) => {
    if (!productId || !Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item && item.productId && item.productId._id === productId);
  }, [wishlistItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.productId._id === productId);
  }, [cartItems]);

  const moveToWishlist = useCallback(async (item) => {
    try {
      await removeFromCart(item._id);
      await toggleWishlist(item.productId);
      setMessage('Moved to Wishlist');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      setMessage('Failed to move item to wishlist. Please try again.');
      setTimeout(() => setMessage(''), 2000);
    }
  }, [removeFromCart, toggleWishlist]);

  const moveToCart = useCallback(async (item) => {
    try {
      await toggleWishlist(item.productId);
      await addToCart(item.productId);
      setMessage('Moved to Cart');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error moving to cart:', error);
      setMessage('Failed to move item to cart. Please try again.');
      setTimeout(() => setMessage(''), 2000);
    }
  }, [toggleWishlist, addToCart]);

  return (
    <Router>
      <div className="App">
        <Navbar cartItemsCount={cartItems.length} wishlistItemsCount={wishlistItems.length} />
        {message && <div className="message">{message}</div>}
        <Routes>
          <Route 
            path="/" 
            element={
              <ProductListPage 
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                setMessage={setMessage}
              />
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProductDetailsPage 
                addToCart={addToCart} 
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                isInCart={isInCart}
                setMessage={setMessage}
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <CartPage 
                cartItems={cartItems} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart} 
                moveToWishlist={moveToWishlist} 
                setMessage={setMessage}
              />
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <WishlistPage 
                wishlistItems={wishlistItems} 
                toggleWishlist={toggleWishlist}
                removeFromWishlist={removeFromWishlist}
                moveToCart={moveToCart} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;