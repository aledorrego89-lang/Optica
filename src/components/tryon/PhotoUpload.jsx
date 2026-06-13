import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoUpload({ onPhotoReady }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(null); // null | 'camera' | 'uploading'
  const [cameraActive, setCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startCamera = async () => {
    setMode('camera');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
    setMode(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onPhotoReady(dataUrl);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMode('uploading');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploading(false);
      setMode(null);
      onPhotoReady(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {mode === 'camera' ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-foreground"
          >
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground shadow-xl w-16 h-16"
                onClick={capturePhoto}
              >
                <Camera className="w-6 h-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-background/30 text-background"
                onClick={stopCamera}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Reticle overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-primary/40" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-primary/40" />
<div
  className="
    absolute
    top-[20%]
    left-[30%]
    right-[30%]
    bottom-[20%]
    border-4
    border-primary/50
    rounded-full
  "
/>            </div>
          </motion.div>
        ) : mode === 'uploading' ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64"
          >
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Procesando imagen...</p>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Subí tu foto</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Tomá una selfie o subí una foto de frente para probar los lentes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={startCamera}
                  className="rounded-full bg-primary text-primary-foreground"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Usar Cámara
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Archivo
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}