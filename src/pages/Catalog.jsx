import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/catalog/ProductCard';

/* =========================
   API FUNCTION (CORRECTO)
========================= */

const getProducts = async () => {
  const res = await fetch('/api/products.php');
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
};

/* ========================= */

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'optical', label: 'Ópticos' },
  { value: 'sunglasses', label: 'Sol' },
  { value: 'blue_light', label: 'Luz Azul' },
  { value: 'reading', label: 'Lectura' },
];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  /* =========================
     QUERY
  ========================= */

 const { data: products = [], isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const res = await fetch('/api/products.php');

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  },
});

  /* =========================
     FILTERS
  ========================= */

const filtered = products
  .filter((p) => p.in_stock)
  .filter((p) => {
    const matchCategory =
      activeCategory === 'all' ||
      p.category === activeCategory;

    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  /* =========================
     UI
  ========================= */

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            Colección
          </span>

          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 mb-8">
            Nuestra selección
          </h1>

          {/* FILTERS */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="bg-muted/50">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.value} value={cat.value}>
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full bg-muted/50 border-0"
              />
            </div>

          </div>
        </motion.div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}