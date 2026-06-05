import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Catalog from '@/pages/Catalog';
const HERO_IMAGE =
  'https://media.base44.com/images/public/6a02795ba3c031678ec123fc/ff9a4189b_generated_b30573a9.png';

export const getProducts = async () => {
  const res = await fetch('/api/products.php');
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
};

export default function Home() {
const [showBubble, setShowBubble] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setShowBubble(false);
  }, 5000);

  return () => clearTimeout(timer);
}, []);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-featured'],
    queryFn: getProducts,
    initialData: [],
  });

  if (error) {
    return <div>Error cargando productos</div>;
  }

  return (
    <div>
      <HeroSection />
      {/* <FeaturesSection /> */}
      <Catalog />
      {/* <FeaturedProducts
        products={products}
        isLoading={isLoading}
      /> */}

<div
  className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
  onMouseEnter={() => setShowBubble(true)}
  onMouseLeave={() => setShowBubble(false)}
>
  <AnimatePresence>
    {showBubble && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="
          absolute
          bottom-20
          right-0
          bg-white
          text-gray-800
          px-4
          py-3
          rounded-xl
          shadow-xl
          text-sm
          font-medium
          w-56
        "
      >
        ¿Tenés alguna duda?
        <br />
        Contactanos por WhatsApp.

        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45" />
      </motion.div>
    )}
  </AnimatePresence>

  <a
    href="https://wa.me/5492914353276?text=Hola,%20quisiera%20realizar%20una%20consulta."
    target="_blank"
    rel="noopener noreferrer"
    className="
      flex
      items-center
      justify-center
      w-14
      h-14
      md:w-16
      md:h-16
      rounded-full
      bg-green-500
      text-white
      shadow-xl
      hover:bg-green-600
      hover:scale-110
      transition-all
      duration-300
    "
  >
    <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
  </a>
</div>
    </div>
  );
}