import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { removeWhiteBackground } from '@/lib/removeBackground';

export default function GlassesOverlay({ facePhoto, glassesImage }) {
const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processedGlasses, setProcessedGlasses] = useState(null);
  const [processing, setProcessing] = useState(false);
const [baseOffset] = useState({ x: 3, y: 4 }); //correccion de posicion lentes
  // When glasses change, remove the white background
  useEffect(() => {
    if (!glassesImage) {
      setProcessedGlasses(null);
      return;
    }
    setProcessing(true);
    setProcessedGlasses(null);
    setPosition({ x: 0, y: 0 });
    setScale(1);

    // Try to remove background; if CORS or any error, use original image directly
    removeWhiteBackground(glassesImage, 230)
      .then((result) => {
        setProcessedGlasses(result);
        setProcessing(false);
      })
      .catch(() => {
        setProcessedGlasses(glassesImage);
        setProcessing(false);
      });

    // Safety timeout: if processing takes too long, use original
    const timeout = setTimeout(() => {
      setProcessedGlasses(prev => prev || glassesImage);
      setProcessing(false);
    }, 4000);
  }, [glassesImage]);

  const handleMouseDown = (e) => {
    e.preventDefault();

    setDragging(true);

    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    e.preventDefault();

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();

    const touch = e.touches[0];

    setDragging(true);

    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;

    e.preventDefault();

    const touch = e.touches[0];

    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-foreground/5 border-4 border-primary/70 shadow-xl shadow-primary/20 select-none"        style={{
          cursor: dragging ? 'grabbing' : 'default',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Face photo */}
        <img
          src={facePhoto}
          alt="Tu rostro"
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          draggable={false}
        />

        {/* Processing spinner */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-background/90 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-medium">Aplicando lentes...</span>
            </div>
          </div>
        )}

        {/* Glasses overlay — draggable, transparent */}
        {processedGlasses && !processing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={processedGlasses}
              alt="Lentes"
              draggable={false}
              className="pointer-events-auto"
              style={{
              transform: `
  translate(${position.x + baseOffset.x}px,
            ${position.y + baseOffset.y}px)
  scale(${scale})
`,
                width: '72%',
                maxWidth: '320px',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
                cursor: dragging ? 'grabbing' : 'grab',
                mixBlendMode: 'multiply',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            />
          </div>
        )}

        {/* Reticle guide lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-4 right-4 h-px bg-primary/20" />
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-primary/20" />
        </div>

        {processedGlasses && !processing && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs text-muted-foreground flex items-center gap-2">
            <Move className="w-3 h-3" />
            Arrastrá para ajustar
          </div>
        )}
      </div>

      {/* Scale slider */}
      {processedGlasses && !processing && (
        <div className="w-full max-w-md flex items-center gap-4 px-4">
          <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[scale * 50]}
            onValueChange={([v]) => setScale(v / 50)}
            min={20}
            max={100}
            step={1}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      )}
    </div>
  );
}