import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WishlistPage({ moveToCart, removeFromWishlist }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
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

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist');
      setWishlistItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setError('Failed to load wishlist items. Please try again later.');
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (item) => {
    if (window.confirm('Are you sure you want to remove this item from the wishlist?')) {
      try {
        console.log('Removing item:', item);
        await removeFromWishlist(item._id);
        // Update local state after successful removal
        setWishlistItems(prevItems => prevItems.filter(wishlistItem => wishlistItem._id !== item._id));
        setMessage('Item removed from wishlist.');
      } catch (error) {
        console.error('Error removing item from wishlist:', error);
        setMessage('Failed to remove item. Please try again.');
      }
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      await moveToCart(item);
      // Update local state after successful move to cart
      setWishlistItems(prevItems => prevItems.filter(wishlistItem => wishlistItem._id !== item._id));
      setMessage('Item moved to cart!');
    } catch (error) {
      console.error('Error moving item to cart:', error);
      setMessage('Failed to move item to cart. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>
      {message && <p className="message">{message}</p>}
      {wishlistItems.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        wishlistItems.map(item => {
          // Check if item and productId exist before rendering
          if (!item || !item.productId) {
            console.error('Invalid wishlist item:', item);
            return null;
          }
          return (
            <div key={item._id} className="wishlist-item">
              <img src={item.productId.image} alt={item.productId.name} />
              <div className="wishlist-item-details">
                <h3>{item.productId.name}</h3>
                <p>Price: ${item.productId.price.toFixed(2)}</p>
              </div>
              <div className="wishlist-item-actions">
                <button onClick={() => handleRemoveFromWishlist(item)}>Remove</button>
                <button onClick={() => handleMoveToCart(item)}>Move to Cart</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default WishlistPage;