import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('ocular_cart') || '[]');
      setCartCount(cart.length);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}