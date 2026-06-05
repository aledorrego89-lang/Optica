import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Glasses,
  Upload,
  CreditCard,
} from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'Subí Foto',
  },
  {
    icon: Glasses,
    title: 'Probá Lentes',
  },
  {
    icon: Upload,
    title: 'Cargá Receta',
  },
  {
    icon: CreditCard,
    title: 'Finalizá Compra',
  },
];

export default function FeaturesSection() {
  return (
    <div>
      <div className="mb-6">
        <span className="text-xs font-medium text-primary tracking-widest uppercase">
          Cómo funciona
        </span>

        <h2 className="text-2xl lg:text-3xl font-bold mt-2">
          4 pasos simples
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
              }}
              className="
                bg-card
                border
                rounded-2xl
                p-4
                hover:border-primary/30
                hover:shadow-md
                transition-all
              "
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              <div className="text-xs text-muted-foreground mb-1">
                0{i + 1}
              </div>

              <h3 className="text-sm font-semibold leading-tight">
                {step.title}
              </h3>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}