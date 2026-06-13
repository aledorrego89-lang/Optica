import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addToCart } from '@/lib/cartUtils';
import { toast } from 'sonner';

const categoryLabels = {
  optical: 'Óptico',
  sunglasses: 'Sol',
  blue_light: 'Luz Azul',
  reading: 'Lectura',
};

const materialLabels = {
  acetate: 'Acetato',
  titanium: 'Titanio',
  stainless_steel: 'Acero',
  wood: 'Madera',
  mixed: 'Mixto',
};

export default function ProductCard({ product }) {
  const images = product.images || product.gallery || [];
  const [currentImage, setCurrentImage] = useState(0);
  const [loaded, setLoaded] = useState(false);

  
  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  // PRELOAD IMAGES (CLAVE PARA MOBILE)
  useEffect(() => {
    if (!images.length) return;

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // CAROUSEL
  useEffect(() => {
    if (!images.length) return;

    setLoaded(false);

    const interval = setInterval(() => {
      setLoaded(false);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images]);

  return (
<Link
  to={`/product/${product.id}`}
  className="group block"
>      <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl">

        {/* IMAGE CONTAINER */}
        <div className="aspect-square relative bg-muted/50 overflow-hidden">

          {images.length > 0 ? (
            <img
              key={currentImage}
              src={images[currentImage]}
              alt={product.name}
              className="w-full h-full object-contain p-2 transition-opacity duration-500"
              onLoad={() => setLoaded(true)}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Eye className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}

          {/* CATEGORY */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-background/80 backdrop-blur-sm text-[10px]">
              {categoryLabels[product.category] || product.category}
            </Badge>
          </div>
        </div>

        {/* INFO */}
        <div className="p-3">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] text-muted-foreground uppercase">
              {product.brand || 'OCULAR'}
            </span>

            {product.material && (
              <span className="text-xs text-muted-foreground">
                {materialLabels[product.material] || product.material}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold truncate">
            {product.name}
          </h3>

          <div className="flex justify-between items-center mt-2">
            {product.in_stock ? (
              <p className="font-bold text-primary">
                ${product.price?.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">
                Sin stock
              </p>
            )}

            <button
              onClick={product.in_stock ? handleAdd : undefined}
              disabled={!product.in_stock}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition
                ${product.in_stock
                  ? "bg-primary/10 hover:bg-primary text-primary hover:text-white"
                  : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}