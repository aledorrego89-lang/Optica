import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/lib/cartUtils';
import { toast } from 'sonner';
import ProductSelector from '@/components/tryon/ProductSelector';
import LiveTryOn from '@/components/tryon/LiveTryOn';

const getProducts = async () => {
  const res = await fetch('/api/products.php');

  if (!res.ok) {
    throw new Error('Error');
  }

  return res.json();
};

export default function TryOnLive() {
  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const urlParams = new URLSearchParams(
    window.location.search
  );

  const preselectedId =
    urlParams.get('productId');

  const { data: products = [] } =
    useQuery({
      queryKey: ['products-live'],
      queryFn: getProducts,
    });

  useEffect(() => {
    if (
      preselectedId &&
      products.length > 0 &&
      !selectedProduct
    ) {
      const found = products.find(
        p =>
          String(p.id) ===
          String(preselectedId)
      );

      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [
    preselectedId,
    products,
    selectedProduct,
  ]);


  const handleAddToCart = () => {
  if (!selectedProduct) return;

  addToCart(selectedProduct);

  toast.success(
    `${selectedProduct.name} agregado al carrito`
  );
};


  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-8">
        Probador en Cámara 3D
      </h1>

      <div className="grid lg:grid-cols-5 gap-10">

        <div className="lg:col-span-2">

{selectedProduct ? (
  <>
    <LiveTryOn
      glassesImage={
        selectedProduct.overlay_url
      }
    />

    <div className="mt-4 space-y-4">
      <div className="p-4 rounded-xl border bg-card">
        <p className="text-xs uppercase text-muted-foreground">
          {selectedProduct.brand || 'OCULAR'}
        </p>

        <h2 className="font-semibold text-lg mt-1">
          {selectedProduct.name}
        </h2>

        <p className="text-2xl font-bold text-primary mt-1">
          $
          {selectedProduct.price?.toLocaleString()}
        </p>
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full rounded-full"
      >
        <ShoppingBag className="w-4 h-4 mr-2" />
        Agregar al carrito
      </Button>
    </div>
  </>
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