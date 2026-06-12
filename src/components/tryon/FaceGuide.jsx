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



function FaceGuideImage({ offset, tilt, current }) {
  return (
    <motion.img
      src="/face-guide.png"
      alt="Ejemplo de posición correcta"
      animate={{
        x: offset.x,
        y: offset.y,
        rotate: tilt,
        scale: current.id === "center" ? 1 : 0.96
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18
      }}
      
 className="w-50 h-72 object-cover select-none pointer-events-none"
  style={{
    maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
  }}
      draggable={false}
    />
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
<motion.div
  animate={{
    opacity: [0.6, 1, 0.6]
  }}
  transition={{
    duration: 2,
    repeat: Infinity
  }}
  className="
    absolute inset-0
    rounded-[50%]
    border-[6px]
    border-dashed
    border-primary
  "
  style={{
    borderRadius: '50% 50% 45% 45%',
    boxShadow: '0 0 15px rgba(59,130,246,0.4)'
  }}
/>

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
<div className="absolute top-[48%] left-0 w-full h-0.5 bg-primary/40" />

  {/* Vertical center line */}
<div className="absolute top-0 left-[49%] h-full w-0.5 bg-primary/40" />
</div>

        {/* Face */}
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <FaceCaricature offset={current.offset} tilt={current.tilt} />
        </div> */}

<div className="absolute inset-0 flex items-center justify-center">
<FaceGuideImage
  offset={current.offset}
  tilt={current.tilt}
  current={current}
/>
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