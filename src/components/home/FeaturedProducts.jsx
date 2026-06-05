import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/catalog/ProductCard';

export default function FeaturedProducts({ products, isLoading }) {
const featured = products?.filter(p => p.in_stock) || [];
  if (isLoading) {
    return (
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
<section className="pt-4 pb-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}