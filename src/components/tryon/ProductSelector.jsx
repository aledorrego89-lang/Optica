import React, { useEffect, useState } from 'react';
import { Eye, Check } from 'lucide-react';

const categoryLabels = {
  optical: 'Óptico',
  sunglasses: 'Sol',
  blue_light: 'Luz Azul',
  reading: 'Lectura',
};

/* =========================
   AUTO CAROUSEL
========================= */
const AutoCarousel = ({ images = [] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Eye className="w-6 h-6 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <img
        src={images[index]}
        alt="product"
        className="w-full h-full object-contain transition-all duration-500"
      />
    </div>
  );
};

/* =========================
   COMPONENT
========================= */
export default function ProductSelector({
  products,
  selectedId,
  onSelect,
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">
        Elegí un modelo
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {products.map((product) => {
          const images = product.images?.length
            ? product.images
            : [product.overlay_url || product.image_url].filter(Boolean);

          const outOfStock = !product.in_stock;

          return (
            <button
              key={product.id}
              onClick={() => {
                if (outOfStock) return; // ❌ bloquea selección
                onSelect(product);
              }}
              disabled={outOfStock}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 text-left
                ${String(selectedId) === String(product.id)
                  ? 'border-primary shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/30'
                }
                ${outOfStock ? 'opacity-80 ' : ''}
              `}
            >
              {/* BADGE SIN STOCK */}
              {outOfStock && (
                <span className="absolute top-2 left-2 z-10 text-[10px] bg-red-500 text-white px-2 py-1 rounded">
                  Sin stock
                </span>
              )}

              {/* IMAGE */}
              <div className="aspect-square bg-muted/50 overflow-hidden">
                <AutoCarousel images={images} />
              </div>

              {/* INFO */}
              <div className="p-3">
                <p className="text-xs text-muted-foreground">
                  {product.brand || 'OCULAR'}
                </p>

                <p className="text-sm font-medium truncate">
                  {product.name}
                </p>

                <p className="text-sm font-bold text-primary">
                  ${product.price?.toLocaleString()}
                </p>
              </div>

              {/* SELECTED CHECK */}
              {String(selectedId) === String(product.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}