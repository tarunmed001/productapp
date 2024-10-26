import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Products</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;