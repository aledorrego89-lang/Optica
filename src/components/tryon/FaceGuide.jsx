import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    id: 'center',
    label: 'Centrá tu cara',
    hint: 'Colocá tu cara en el centro del marco',
    offset: { x: 0, y: 0 },
    tilt: 0,
  },
  {
    id: 'left',
    label: 'Bien derecho',
    hint: 'Mirá directo a la cámara, sin girar',
    offset: { x: -18, y: 0 },
    tilt: -8,
  },
  {
    id: 'right',
    label: 'Alineá los ojos',
    hint: 'Mantené los ojos al mismo nivel',
    offset: { x: 18, y: 0 },
    tilt: 8,
  },
  {
    id: 'final',
    label: '¡Perfecto!',
    hint: 'Así es como debería verse tu foto',
    offset: { x: 0, y: 0 },
    tilt: 0,
  },
];

function FaceCaricature({ offset, tilt }) {
  return (
    <motion.div
      animate={{ x: offset.x, y: offset.y, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
className="relative w-32 h-36 mx-auto"
    >
      {/* Head */}
      <motion.div
        className="absolute inset-0 rounded-[50%] bg-amber-200 border-4 border-amber-300"
        style={{ borderRadius: '50% 50% 45% 45%' }}
      />
      {/* Hair */}
      <div className="absolute -top-3 left-2 right-2 h-10 bg-amber-800 rounded-t-full" style={{ borderRadius: '50% 50% 10% 10%' }} />
      {/* Eyes */}
      <div className="absolute top-10 left-6 w-5 h-5 bg-white rounded-full border-2 border-gray-700 flex items-center justify-center">
        <motion.div
          className="w-2.5 h-2.5 bg-gray-800 rounded-full"
          animate={{ x: offset.x > 0 ? 1 : offset.x < 0 ? -1 : 0 }}
        />
      </div>
      <div className="absolute top-10 right-6 w-5 h-5 bg-white rounded-full border-2 border-gray-700 flex items-center justify-center">
        <motion.div
          className="w-2.5 h-2.5 bg-gray-800 rounded-full"
          animate={{ x: offset.x > 0 ? 1 : offset.x < 0 ? -1 : 0 }}
        />
      </div>
      {/* Glasses */}

      {/* Nose */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-4 h-4">
        <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-amber-300 border border-amber-400" />
        <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-300 border border-amber-400" />
      </div>
      {/* Mouth */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-4 overflow-hidden"
        animate={{ scaleY: tilt !== 0 ? 0.7 : 1 }}
      >
        <div className="w-8 h-8 rounded-full border-4 border-amber-700 border-t-transparent -mt-4" />
      </motion.div>
    </motion.div>
  );
}

export default function FaceGuide({ onContinue }) {
  const [step, setStep]     = useState(0);
  const [done, setDone]     = useState(false);
  const current             = STEPS[step];

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= STEPS.length - 1) {
          setDone(true);
          clearInterval(timer);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => clearInterval(timer);
  }, [done]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto text-center"
    >
      {/* Oval frame with face */}
      <div className="relative mx-auto w-56 h-64 mb-6">
        {/* Oval guide */}
        <div className="absolute inset-0 rounded-[50%] border-4 border-dashed border-primary/40" style={{ borderRadius: '50% 50% 45% 45%' }} />
        {/* Corner markers */}
        {[
          'top-2 left-8 border-t-2 border-l-2 rounded-tl-lg',
          'top-2 right-8 border-t-2 border-r-2 rounded-tr-lg',
          'bottom-2 left-8 border-b-2 border-l-2 rounded-bl-lg',
          'bottom-2 right-8 border-b-2 border-r-2 rounded-br-lg',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 border-primary ${cls}`} />
        ))}

        {/* Crosshair */}
<div className="absolute inset-0 pointer-events-none z-20">
  {/* Horizontal line (eye level) */}
  <div className="absolute top-[42%] left-0 w-full h-px bg-primary/25" />

  {/* Vertical center line */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-primary/15" />
</div>

        {/* Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FaceCaricature offset={current.offset} tilt={current.tilt} />
        </div>

        {/* Done checkmark */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 mb-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.id}
            animate={{ width: i === step ? 20 : 8, opacity: i <= step ? 1 : 0.3 }}
            className="h-2 rounded-full bg-primary"
          />
        ))}
      </div>

      {/* Label & hint */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-heading text-xl font-bold mb-1">{current.label}</p>
          <p className="text-sm text-muted-foreground">{current.hint}</p>
        </motion.div>
      </AnimatePresence>

      {/* Tips */}
      <div className="mt-5 mb-6 text-left bg-muted/60 rounded-xl p-4 space-y-1.5">
        {[
          '📸 Buena iluminación, de frente',
          '🎯 Centrá la cara en el óvalo y la linea horizontal en los ojos',
          '😐 Expresión neutral, sin gafas',
        ].map(tip => (
          <p key={tip} className="text-xs text-muted-foreground">{tip}</p>
        ))}
      </div>

      <Button
        onClick={onContinue}
        className="w-full rounded-full h-12 font-semibold"
        disabled={!done}
      >
        {done ? 'Entendido, sacar foto' : 'Mirá la animación...'}
      </Button>
    </motion.div>
  );
}