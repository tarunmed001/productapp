import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';

function ProductDetailsPage({ addToCart, toggleWishlist, isInWishlist, isInCart, setMessage }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleToggleWishlist = async () => {
    if (product) {
      await toggleWishlist(product);
      setMessage(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-details">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} />
        <button onClick={handleToggleWishlist} className="wishlist-button">
          <Heart
            fill={isInWishlist(product._id) ? "red" : "none"} 
            color={isInWishlist(product._id) ? "red" : "black"}
            size={24}
          />
        </button>
      </div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price.toFixed(2)}</p>
      {isInCart(product._id) ? (
        <button onClick={handleGoToCart}>Go to Cart</button>
      ) : (
        <button onClick={handleAddToCart}>Add to Cart</button>
      )}
    </div>
  );
}

export default ProductDetailsPage;