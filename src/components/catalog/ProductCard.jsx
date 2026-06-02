import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/lib/cartUtils';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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
  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };





const images = product.images || product.gallery || [];
const [currentImage, setCurrentImage] = useState(0);

useEffect(() => {
  if (!images.length) return;

  const interval = setInterval(() => {
    setCurrentImage(prev =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, 4000);
console.log("PRODUCT:", product);
  return () => clearInterval(interval);
}, [images]);


  return (
    <Link to={`/try-on?productId=${product.id}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
<div className="aspect-square overflow-hidden bg-muted/50 relative">

  {images.length > 0 ? (
<div className="relative w-full h-full">
  {images.map((img, idx) => (
    <img
      key={idx}
      src={img}
      alt=""
      style={{
        opacity: idx === currentImage ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
      }}
      className="absolute inset-0 w-full h-full object-contain"
    />
  ))}
</div>

  ) : (
    <div className="w-full h-full flex items-center justify-center">
{product.gallery?.[0] ? (
  <img
    src={product.gallery[0]}
    className="w-full h-full object-contain p-2"
    alt={product.name}
  />
) : product.image_url ? (
  <img
    src={product.image_url}
    className="w-full h-full object-contain p-2"
    alt={product.name}
  />
) : (
  <Eye className="w-12 h-12 text-muted-foreground/30" />
)}    </div>
  )}

  <div className="absolute top-4 left-4">
    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs font-medium">
      {categoryLabels[product.category] || product.category}
    </Badge>
  </div>

  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
    <Button
      size="sm"
      className="rounded-full bg-primary text-primary-foreground shadow-lg"
      onClick={handleAdd}
    >
      Agregar al carrito
    </Button>
  </div>

</div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.brand || 'OCULAR'}
            </span>
            {product.material && (
              <span className="text-xs text-muted-foreground">
                {materialLabels[product.material] || product.material}
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="font-heading text-2xl font-bold text-primary">
            ${product.price?.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}