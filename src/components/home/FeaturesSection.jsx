import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, CreditCard, Truck } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'Subí tu Foto',
    description: 'Tomá una selfie o subí una foto de tu rostro para comenzar la experiencia.',
  },
  {
    icon: Upload,
    title: 'Probá los Lentes',
    description: 'Explorá nuestra colección y visualizá cada modelo sobre tu rostro en tiempo real.',
  },
  {
    icon: Upload,
    title: 'Cargá tu Receta',
    description: 'Subí una foto de tu prescripción óptica. Nuestro sistema la analiza al instante.',
  },
  {
    icon: CreditCard,
    title: 'Completá tu Pedido',
    description: 'Finalizá la compra con un proceso de pago simple y seguro.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase">Cómo funciona</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 tracking-tight">
            4 pasos hacia la
            <br />
            <span className="text-primary">claridad perfecta</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-3">0{i + 1}</div>
                <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}