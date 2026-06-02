import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scan, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Extreme close-up of a human eye"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-widest uppercase">Probador Virtual Activo</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-[0.9] tracking-tight mb-8">
              Tu visión,
              <br />
              <span className="text-primary">redefinida.</span>
            </h1>

            <p className="text-lg md:text-xl text-background/60 leading-relaxed max-w-lg mb-12">
              Probá los lentes de forma virtual sobre tu rostro. Elegí tu estilo, cargá tu receta y recibilos en casa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/try-on">
                <Button
                  size="lg"
                  className="group text-base px-8 py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Iniciar Probador
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-full border-background/20 text-background hover:bg-background/10"
                >
                  Ver Colección
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative reticle */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-background/30">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-background/30" />
        <span className="text-xs tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
}