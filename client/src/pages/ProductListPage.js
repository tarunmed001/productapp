import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';

function ProductListPage({ toggleWishlist, isInWishlist }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        console.log('Fetched products:', response.data);
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (minPrice === '' || product.price >= parseFloat(minPrice)) &&
      (maxPrice === '' || product.price <= parseFloat(maxPrice))
    );
    setFilteredProducts(results);
  }, [searchTerm, minPrice, maxPrice, products]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;
  if (products.length === 0) return <div>No products found.</div>;

  return (
    <div className="product-list-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="product-list">
        <div className="collection-header">
          <img src="/images/apple.svg" alt="Apple Logo" className="apple-logo" />
          <h2>Apple Collection</h2>
        </div>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.name} />
                <button 
                  onClick={() => toggleWishlist(product)} 
                  className="wishlist-button"
                >
                  <Heart
                    fill={isInWishlist(product._id) ? "red" : "none"} 
                    color={isInWishlist(product._id) ? "red" : "black"}
                    size={24}
                  />
                </button>
              </div>
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <Link to={`/product/${product._id}`}>View Details</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;