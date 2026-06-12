import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
export default function HeroSection() {
  return (
<section className="relative overflow-hidden pt-24 md:pt-4">

      {/* Fondo */}
      <div className="absolute inset-0 bg-background" />

      {/* Blurs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right,#999 1px,transparent 1px),linear-gradient(to bottom,#999 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-12">

        <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[550px]">

          {/* TEXTO */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >



<Link to="/try-on">
  <div className="relative inline-flex items-center gap-3 px-5 py-3 rounded-full mb-6 overflow-hidden border border-sky-400/30 bg-gradient-to-r from-sky-500/15 via-primary/10 to-sky-500/15 backdrop-blur-sm cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/20">

    {/* Reflejo animado */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 -left-32 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-12 animate-shine" />
    </div>

    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white">
      👓
    </div>

    <div className="relative">
      <div className="text-base md:text-sm font-extrabold text-sky-600 tracking-wide">
        PROBADOR VIRTUAL
      </div>

      {/* <div className="text-xs text-muted-foreground">
        Probá tus lentes en tiempo real
      </div> */}
    </div>

  </div>
</Link>




            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Encontrá tus
              <span className="block text-primary">
                lentes perfectos
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Probá cualquier modelo sobre tu rostro,
              cargá tu receta y recibí tus lentes sin
              salir de casa.
            </p>
          </motion.div>

          {/* IMAGEN */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="relative"
          >

            {/* Glow detrás */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-transparent blur-3xl scale-110" />

            {/* Imagen */}
            <div className="relative overflow-hidden rounded-[40px]">

              <img
                src="/portada.jpg"
                alt="Lentes"
                className="w-full h-auto object-cover"
              />

              {/* Degradado izquierdo para fundir con el texto */}
<div
  className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent"
/>              {/* Degradado inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}