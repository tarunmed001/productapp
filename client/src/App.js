import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from './utils/axiosConfig';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './pages/Navbar';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // Memoize fetch functions
  const fetchCartItems = useCallback(async () => {
    try {
      if (!user) return;
      const response = await axios.get('/api/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      if (error.response?.status === 401) {
        setMessage('Please login to view your cart');
      }
    }
  }, [user]);

  const fetchWishlistItems = useCallback(async () => {
    try {
      if (!user) return;
      const response = await axios.get('/api/wishlist');
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      if (error.response?.status === 401) {
        setMessage('Please login to view your wishlist');
      }
    }
  }, [user]);

  // Update useEffect with memoized functions
  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchWishlistItems();
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [user, fetchCartItems, fetchWishlistItems]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const addToCart = useCallback(async (product) => {
    try {
      if (!user) {
        setMessage('Please login to add items to cart');
        return;
      }
      const response = await axios.post('/api/cart', { productId: product._id, quantity: 1 });
      setCartItems(response.data);
      setMessage('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage(error.response?.data?.message || 'Failed to add to cart. Please try again.');
    }
  }, [user]);

  const updateQuantity = useCallback(async (id, quantity) => {
    try {
      if (!user) {
        setMessage('Please login to update cart');
        return;
      }
      const response = await axios.put(`/api/cart/${id}`, { quantity });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setMessage('Failed to update quantity');
    }
  }, [user]);

  const removeFromCart = useCallback(async (id) => {
    try {
      if (!user) {
        setMessage('Please login to remove items from cart');
        return;
      }
      const response = await axios.delete(`/api/cart/${id}`);
      setCartItems(response.data);
      setMessage('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      setMessage('Failed to remove item from cart');
    }
  }, [user]);

  const toggleWishlist = useCallback(async (product) => {
    try {
      if (!user) {
        setMessage('Please login to manage wishlist');
        return;
      }
      const response = await axios.post('/api/wishlist/toggle', { productId: product._id });
      await fetchWishlistItems();
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setMessage(error.response?.data?.message || 'Failed to update wishlist. Please try again.');
    }
  }, [user, fetchWishlistItems]);

  const removeFromWishlist = useCallback(async (itemId) => {
    try {
      if (!user) {
        setMessage('Please login to remove items from wishlist');
        return;
      }
      const response = await axios.delete(`/api/wishlist/${itemId}`);
      setWishlistItems(response.data.wishlist);
      setMessage('Item removed from wishlist');
      return response.data.wishlist;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessage('Failed to remove item from wishlist');
      throw error;
    }
  }, [user]);

  const isInWishlist = useCallback((productId) => {
    if (!productId || !Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item && item.productId && item.productId._id === productId);
  }, [wishlistItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.productId._id === productId);
  }, [cartItems]);

  const moveToWishlist = useCallback(async (item) => {
    try {
      if (!user) {
        setMessage('Please login to move items to wishlist');
        return;
      }
      await removeFromCart(item._id);
      await toggleWishlist(item.productId);
      setMessage('Moved to Wishlist');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      setMessage('Failed to move item to wishlist. Please try again.');
    }
  }, [user, removeFromCart, toggleWishlist]);

  const moveToCart = useCallback(async (item) => {
    try {
      if (!user) {
        setMessage('Please login to move items to cart');
        return;
      }
      await toggleWishlist(item.productId);
      await addToCart(item.productId);
      setMessage('Moved to Cart');
    } catch (error) {
      console.error('Error moving to cart:', error);
      setMessage('Failed to move item to cart. Please try again.');
    }
  }, [user, toggleWishlist, addToCart]);

  return (
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
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <CartPage 
                cartItems={cartItems} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart} 
                moveToWishlist={moveToWishlist} 
                setMessage={setMessage}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <WishlistPage 
                wishlistItems={wishlistItems} 
                toggleWishlist={toggleWishlist}
                removeFromWishlist={removeFromWishlist}
                moveToCart={moveToCart} 
              />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;