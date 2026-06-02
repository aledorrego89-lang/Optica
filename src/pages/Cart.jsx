import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartItemRow from '@/components/cart/CartItemRow';
import { getCart, removeFromCart } from '@/lib/cartUtils';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  const handleRemove = (id) => {
    const updated = removeFromCart(id);
    setCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase">Tu Selección</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mt-4 tracking-tight mb-12">
            Carrito
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-20">
<ShoppingBag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-lg text-muted-foreground mb-6">Tu carrito está vacío</p>
              <Link to="/catalog">
                <Button className="rounded-full bg-primary text-primary-foreground">
                  Explorar Colección
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-10">
                {cart.map((item) => (
                  <CartItemRow key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-heading text-2xl font-bold">${total.toLocaleString()}</span>
                </div>
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full rounded-full bg-primary text-primary-foreground h-14 text-base group"
                >
                  Continuar con el pedido
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}