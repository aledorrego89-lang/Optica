import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6a02795ba3c031678ec123fc/ff9a4189b_generated_b30573a9.png';

export const getProducts = async () => {
  const res = await fetch('/api/products.php');
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
};

export default function Home() {
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
      <HeroSection heroImage={HERO_IMAGE} />
      <FeaturesSection />
      <FeaturedProducts products={products} isLoading={isLoading} />
    </div>
  );
}