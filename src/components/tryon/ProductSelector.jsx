import React from 'react';
import { Eye, Check } from 'lucide-react';

const categoryLabels = {
  optical: 'Óptico',
  sunglasses: 'Sol',
  blue_light: 'Luz Azul',
  reading: 'Lectura',
};

export default function ProductSelector({ products, selectedId, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">
        Elegí un modelo
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {products.map((product) => {
          // ✅ ACA se calcula correctamente (FUERA del JSX)
          const image =
            product.images?.[0] ||
            product.overlay_url ||
            product.image_url;

          return (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 text-left ${
                String(selectedId) === String(product.id)
                  ? 'border-primary shadow-lg shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {/* IMAGE */}
              <div className="aspect-square bg-muted/50 overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-muted-foreground/20" />
                  </div>
                )}
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