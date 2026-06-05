import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scan,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden  pt-4">
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

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-12 pt-16 pb-0 lg:pt-20 lg:pb-4">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium">
                Probador Virtual Disponible
              </span>
            </div>

       <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Encontrá tus
              <span className="block text-primary">
                lentes perfectos
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-2">
              Probá cualquier modelo sobre tu rostro,
              cargá tu receta y recibí tus lentes sin
              salir de casa.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-3 mb-8">
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

            <div className="flex flex-wrap gap-6 text-sm md:text-base text-muted-foreground">
              <span>✓ +500 clientes</span>
              <span>✓ +100 modelos</span>
              <span>✓ Envíos a todo el país</span>
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}