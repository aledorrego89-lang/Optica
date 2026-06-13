import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function ProductDetail() {
  const { id } = useParams();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products.php');
      return res.json();
    }
  });

  const product = products.find(
  p => String(p.id) === String(id)
);
console.log(id);
console.log(products);
  const images = product?.images || [];

  const [selected, setSelected] = useState(0);

  if (!products.length) {
  return (
    <div className="p-10 text-center">
      Cargando...
    </div>
  );
}

if (!product) {
  return (
    <div className="p-10 text-center">
      Producto no encontrado
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="grid lg:grid-cols-2 gap-10">

        <div>

          <img
            src={images[selected]}
            className="w-full rounded-2xl"
            alt={product.name}
          />

          <div className="grid grid-cols-5 gap-2 mt-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setSelected(i)}
                className="cursor-pointer rounded-lg border"
              />
            ))}
          </div>

        </div>

        <div>

          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>

          <p className="text-2xl font-bold text-primary mt-4">
            ${product.price?.toLocaleString()}
          </p>

          <p className="mt-4 text-muted-foreground">
            {product.description}
          </p>

          <Button
            className="mt-8"
            onClick={() =>
              window.location.href =
                `/try-on?productId=${product.id}`
            }
          >
            Probar Virtualmente
          </Button>

        </div>

      </div>

    </div>
  );
}