
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera as MPCamera } from '@mediapipe/camera_utils';

export default function PhotoUpload({ onPhotoReady }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(null); // null | 'camera' | 'uploading'
  const [cameraActive, setCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
const [faceState, setFaceState] = useState('none');
const detectorRef = useRef(null);
const mpCameraRef = useRef(null);
const countdownStarted = useRef(false);
// none | detected | perfect

const [countdown, setCountdown] = useState(null);


const startCamera = async () => {
  setMode('camera');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' }
  });

  videoRef.current.srcObject = stream;

  await new Promise((resolve) => {
    videoRef.current.onloadedmetadata = () => resolve();
  });

  await videoRef.current.play();

  setCameraActive(true);

const detector = new FaceDetection({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});


  detector.setOptions({
    model: 0,
    minDetectionConfidence: 0.5,
  });


detector.onResults((results) => {
  if (!results.detections?.length) {
    setFaceState('none');
    return;
  }

  const box = results.detections[0].boundingBox;

  const centerX = box.xCenter;
  const centerY = box.yCenter;
  const width = box.width;
  const height = box.height;
const leftEye = results.detections[0].landmarks[0];
const rightEye = results.detections[0].landmarks[1];

// centro entre ambos ojos
const faceCenterX = (leftEye.x + rightEye.x) / 2;

// altura promedio de los ojos
const eyesY = (leftEye.y + rightEye.y) / 2;

// inclinación de la cabeza
const eyeAlignment = Math.abs(leftEye.y - rightEye.y);

// MUY estricto
const centered =
  Math.abs(faceCenterX - 0.5) < 0.02 &&
  Math.abs(eyesY - 0.5) < 0.02;

const eyesLevel = eyeAlignment < 0.01;



  // const correctSize =
  //   width > 0.20 &&
  //   width < 0.50 &&
  //   height > 0.25 &&
  //   height < 0.60;
  const correctSize =
  width > 0.32 &&
  width < 0.60 &&
  height > 0.40 &&
  height < 0.75;

if (
    centered &&
    correctSize &&
    eyesLevel 
) {
    setFaceState('perfect');
}
else if (!eyesLevel) {
    setFaceState('tilted');
}
else {
    setFaceState('detected');
}
});

  detectorRef.current = detector;


const mpCamera = new MPCamera(videoRef.current, {
  onFrame: async () => {
    try {
      await detectorRef.current.send({
        image: videoRef.current
      });
    } catch (err) {
      console.error("MEDIAPIPE ERROR:", err);
    }
  },
});

  mpCamera.start();


  mpCameraRef.current = mpCamera;
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



  const stopCamera = () => {
  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject
      .getTracks()
      .forEach((t) => t.stop());
  }

  mpCameraRef.current?.stop?.();
  mpCameraRef.current = null;

  detectorRef.current?.close?.();
  detectorRef.current = null;

  setFaceState('none');
  setCountdown(null);
  setCameraActive(false);
  setMode(null);
};


useEffect(() => {
  if (faceState !== 'perfect') {
    countdownStarted.current = false;
    setCountdown(null);
    return;
  }

  if (countdownStarted.current) return;

  countdownStarted.current = true;

  setCountdown(3);

  const t1 = setTimeout(() => setCountdown(2), 1000);
  const t2 = setTimeout(() => setCountdown(1), 2000);

  const t3 = setTimeout(() => {
    capturePhoto();
  }, 3000);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
  };
}, [faceState]);




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
{/* Overlay Inteligente */}
<div className="absolute inset-0 pointer-events-none">

  {/* Cruz */}
  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/30" />
  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/30" />

  {/* Ovalo */}
<div
  className={`
    absolute
    top-[15%]
    left-[20%]
    right-[20%]
    bottom-[15%]
    border-4
    rounded-full
    transition-all
    duration-500

${
  faceState === 'perfect'
    ? 'border-green-400 shadow-[0_0_60px_rgba(74,222,128,1)]'
    : faceState === 'detected'
    ? 'border-yellow-400 animate-breathe shadow-[0_0_20px_rgba(250,204,21,.5)]'
    : faceState === 'tilted'
    ? 'border-orange-400 animate-breathe shadow-[0_0_20px_rgba(251,146,60,.5)]'
    : 'border-white/50'
}
  `}
/>

  {/* Mensaje */}
  <div className="absolute top-6 left-1/2 -translate-x-1/2">
{faceState === 'none' && (
  <div className="px-4 py-2 rounded-full bg-black/70 text-white text-sm animate-breathe">
    Buscando rostro...
  </div>
)}

{faceState === 'detected' && (
  <div className="px-4 py-2 rounded-full bg-yellow-500 text-black text-sm font-semibold animate-breathe">
    Centrá tu rostro
  </div>
)}

{faceState === 'tilted' && (
  <div className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold animate-breathe">
    Enderezá la cabeza
  </div>
)}
  </div>

  {/* Cuenta regresiva */}
{countdown && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-white text-8xl font-bold drop-shadow-lg animate-breathe">
      {countdown}
    </div>
  </div>
)}
</div>
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