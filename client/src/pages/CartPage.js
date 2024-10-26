import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CartPage({ updateQuantity, removeFromCart, moveToWishlist }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCartItems();
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
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items. Please try again later.');
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    try {
      if (quantity > 0) {
        await updateQuantity(id, quantity);
        setCartItems(cartItems.map(item => 
          item._id === id ? { ...item, quantity } : item
        ));
      } else {
        await handleRemoveFromCart(id);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setMessage('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveFromCart = async (id) => {
    if (window.confirm('Are you sure you want to remove this item from the cart?')) {
      try {
        await removeFromCart(id);
        setCartItems(cartItems.filter(item => item._id !== id));
        setMessage('Item removed from cart.');
      } catch (error) {
        console.error('Error removing item from cart:', error);
        setMessage('Failed to remove item. Please try again.');
      }
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await moveToWishlist(item);
      setCartItems(cartItems.filter(cartItem => cartItem._id !== item._id));
      setMessage('Item moved to wishlist!');
    } catch (error) {
      console.error('Error moving item to wishlist:', error);
      setMessage('Failed to move item to wishlist. Please try again.');
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.productId.price * item.quantity, 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {message && <p className="message">{message}</p>}
      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/" className="continue-shopping">Continue Shopping</Link>
        </div>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.productId.image} alt={item.productId.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.productId.name}</h3>
                <p>Price: ${item.productId.price.toFixed(2)}</p>
                <div className="quantity-control">
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value))}
                  />
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <p>Subtotal: ${(item.productId.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => handleRemoveFromCart(item._id)} className="remove-button">Remove</button>
                <button onClick={() => handleMoveToWishlist(item)} className="move-to-wishlist-button">Move to Wishlist</button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
          <Link to="/" className="continue-shopping">Continue Shopping</Link>
        </>
      )}
    </div>
  );
}

export default CartPage;