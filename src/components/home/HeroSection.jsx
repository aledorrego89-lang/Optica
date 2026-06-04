import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scan,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection({
  products = [],
}) {
  const heroProducts = products.slice(0, 3);

const getImage = (product, index = 0) => {
  return (
    product?.images?.[index] ||
    product?.gallery?.[index] ||
    product?.image_url ||
    null
  );
};

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Blur */}
      <div className="absolute top-0 left-0 w-72 md:w-96 h-72 md:h-96 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 md:w-96 h-72 md:h-96 bg-primary/10 rounded-full blur-3xl" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right,#999 1px,transparent 1px),linear-gradient(to bottom,#999 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* TEXTO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs md:text-sm font-medium">
                Probador Virtual Disponible
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Encontrá tus
              <span className="block text-primary">
                lentes perfectos
              </span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mb-8">
              Probá cualquier modelo sobre tu rostro,
              cargá tu receta y recibí tus lentes sin
              salir de casa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to="/try-on">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Probar Ahora
                </Button>
              </Link>

              <Link to="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Ver Catálogo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                  +500
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Clientes
                </p>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                  +100
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Modelos
                </p>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                  24hs
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Soporte
                </p>
              </div>
            </div>
          </motion.div>

          {/* VISUAL */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative"
          >
            {/* MÓVIL */}
            <div className="md:hidden">
              {heroProducts[0] &&
                getImage(heroProducts[0]) && (
                  <div className="bg-card border rounded-3xl shadow-xl p-4">
                    <img
                      src={getImage(heroProducts[0], 3)}
                      alt={
                        heroProducts[0].name
                      }
                      className="w-full h-64 object-contain"
                    />
                  </div>
                )}
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block relative h-[550px]">
              <div className="absolute top-0 left-0 w-72 h-72 bg-card border rounded-3xl shadow-2xl p-6 rotate-[-8deg]">
                {heroProducts[0] &&
                  getImage(
                    heroProducts[0]
                  ) && (
                    <img
                      src={getImage(
                        heroProducts[0]
                      )}
                      alt={
                        heroProducts[0].name
                      }
                      className="w-full h-full object-contain"
                    />
                  )}
              </div>

              <div className="absolute top-24 right-0 w-72 h-72 bg-card border rounded-3xl shadow-2xl p-6 rotate-[6deg]">
                {heroProducts[1] &&
                  getImage(
                    heroProducts[1]
                  ) && (
                    <img
                      src={getImage(
                        heroProducts[1]
                      )}
                      alt={
                        heroProducts[1].name
                      }
                      className="w-full h-full object-contain"
                    />
                  )}
              </div>

              <div className="absolute bottom-0 left-20 w-72 h-72 bg-card border rounded-3xl shadow-2xl p-6 rotate-[-4deg]">
                {heroProducts[2] &&
                  getImage(
                    heroProducts[2]
                  ) && (
                    <img
                      src={getImage(
                        heroProducts[2]
                      )}
                      alt={
                        heroProducts[2].name
                      }
                      className="w-full h-full object-contain"
                    />
                  )}
              </div>

              <div className="absolute -left-6 top-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-3 shadow-xl">
                <Truck className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium">
                  Envíos a todo el país
                </p>
              </div>

              <div className="absolute -right-6 bottom-24 bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-3 shadow-xl">
                <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-medium">
                  Compra segura
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
