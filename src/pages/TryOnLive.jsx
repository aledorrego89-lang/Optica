import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import ProductSelector from '@/components/tryon/ProductSelector';
import LiveTryOn from '@/components/tryon/LiveTryOn';

const getProducts = async () => {
  const res = await fetch('/api/products.php');

  if (!res.ok)
    throw new Error('Error');

  return res.json();
};

export default function TryOnLive() {
  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const { data: products = [] } =
    useQuery({
      queryKey: ['products-live'],
      queryFn: getProducts,
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-8">
        Probador en Cámara 3D
      </h1>

      <div className="grid lg:grid-cols-5 gap-10">

        <div className="lg:col-span-2">

          {selectedProduct ? (
            <LiveTryOn
              glassesImage={
                selectedProduct.overlay_url
              }
            />
          ) : (
            <div className="border rounded-xl p-10 text-center">
              Seleccioná un modelo
            </div>
          )}

        </div>

        <div className="lg:col-span-3">

          <ProductSelector
            products={products.filter(
              p => p.in_stock
            )}
            selectedId={selectedProduct?.id}
            onSelect={setSelectedProduct}
          />

        </div>

      </div>
    </div>
  );
}