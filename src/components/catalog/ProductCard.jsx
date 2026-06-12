import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';
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
  return () => clearInterval(interval);
}, [images]);


  return (
    <Link to={`/try-on?productId=${product.id}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
<div className="aspect-[1/1] overflow-hidden bg-muted/50 relative">

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
    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] font-medium px-2 py-0">
      {categoryLabels[product.category] || product.category}
    </Badge>
  </div>


</div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
         <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {product.brand || 'OCULAR'}
            </span>
            {product.material && (
              <span className="text-xs text-muted-foreground">
                {materialLabels[product.material] || product.material}
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {/* <p className="font-heading text-2xl font-bold text-primary"> */}
          <div className="flex items-center justify-between mt-2">
{product.in_stock ? (
  <p className="font-heading text-lg font-bold text-primary">
    ${product.price?.toLocaleString()}
  </p>
) : (
  <p className="font-heading text-sm font-semibold text-red-500">
    Sin stock
  </p>
)}

<button
  onClick={product.in_stock ? handleAdd : undefined}
  disabled={!product.in_stock}
  className={`
    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
    ${product.in_stock
      ? "bg-primary/10 hover:bg-primary text-primary hover:text-white"
      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
    }
  `}
>
  <ShoppingCart className="w-4 h-4" />
</button>


</div>
        </div>
      </div>
    </Link>
  );
}