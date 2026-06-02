import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PhotoUpload from '@/components/tryon/PhotoUpload';
import GlassesOverlay from '@/components/tryon/GlassesOverlay';
import ProductSelector from '@/components/tryon/ProductSelector';
import { addToCart } from '@/lib/cartUtils';
import FaceGuide from '@/components/tryon/FaceGuide';
/* =========================
   API FUNCTION (CORRECTO)
========================= */

const getProducts = async () => {
  const res = await fetch('/api/products.php');
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
};

/* ========================= */

export default function TryOn() {
  const [facePhoto, setFacePhoto] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
const [showGuide, setShowGuide] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedId = urlParams.get('productId');

  /* =========================
     QUERY
  ========================= */

const { data: products = [], isLoading } = useQuery({
  queryKey: ['products-tryon'],
  queryFn: async () => {
    const data = await getProducts();

    console.log("🔥 RAW API RESPONSE:", data);
    console.log("📦 TYPE:", typeof data, Array.isArray(data));

    return data;
  },
  initialData: [],
});

  /* =========================
     PRESELECT PRODUCT
  ========================= */

  useEffect(() => {
    if (preselectedId && products.length > 0 && !selectedProduct) {
      const found = products.find((p) => p.id === preselectedId);
      if (found) setSelectedProduct(found);
    }
  }, [preselectedId, products, selectedProduct]);

  /* =========================
     CART
  ========================= */

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct);
    toast.success(`${selectedProduct.name} agregado al carrito`);
  };

  /* =========================
     UI
  ========================= */
const mainImage =
  selectedProduct?.images?.[0] ||
  selectedProduct?.overlay_url ||
  null;

useEffect(() => {
  console.log("🔥 selectedProduct RAW:");
  console.log(selectedProduct);

  console.log("🧠 JSON:");
  console.log(JSON.stringify(selectedProduct, null, 2));
}, [selectedProduct]);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            Probador Virtual
          </span>

          <h1 className="font-heading text-4xl md:text-5xl font-bold mt-4">
            Tu espejo digital
          </h1>

          <p className="text-muted-foreground mt-3 max-w-lg">
            Subí una foto de tu rostro y probá cada modelo de nuestra colección.
          </p>
        </motion.div>

        {/* STEP 1 */}
{!facePhoto ? (
  showGuide ? (
    <FaceGuide onContinue={() => setShowGuide(false)} />
  ) : (
    <PhotoUpload onPhotoReady={setFacePhoto} />
  )
) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* MIRROR */}
            <div className="lg:col-span-2">
              <div className="sticky top-28">

                <GlassesOverlay
                  facePhoto={facePhoto}
glassesImage={
   mainImage
}
                />

                <div className="flex gap-3 mt-6 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFacePhoto(null);
                      setSelectedProduct(null);
                    }}
                    className="rounded-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Cambiar Foto
                  </Button>

                  {selectedProduct && (
                    <Button
                      onClick={handleAddToCart}
                      className="rounded-full"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                  )}
                </div>

                {/* PRODUCT INFO */}
                {selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 rounded-xl bg-card border border-border"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {selectedProduct.brand || 'OCULAR'}
                    </p>

                    <p className="font-heading text-lg font-semibold mt-1">
                      {selectedProduct.name}
                    </p>

                    <p className="font-heading text-2xl font-bold text-primary mt-1">
                      ${selectedProduct.price?.toLocaleString()}
                    </p>

                    {selectedProduct.description && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {selectedProduct.description}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <ProductSelector
                  products={products}
                  selectedId={selectedProduct?.id}
                  onSelect={setSelectedProduct}
                />
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}