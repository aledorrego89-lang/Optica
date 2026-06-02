import React, { useRef, useState } from 'react';
import { Upload, FileCheck, Loader2, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrescriptionUpload({ onPrescriptionReady }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  /* =========================
     UPLOAD FILE
  ========================= */
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload-prescription.php', {
      method: 'POST',
      body: formData,
    });

    return await res.json();
  };

  /* =========================
     PROCESS FILE
  ========================= */
  const processFile = async (file) => {
    const reader = new FileReader();

    reader.onload = (ev) => {
      setPreview(ev.target.result);
    };

    reader.readAsDataURL(file);

    setUploading(true);

    try {
      // subir archivo
      const upload = await uploadFile(file);
console.log('UPLOAD RESPONSE:', upload);
      if (!upload.file_url) {
        throw new Error('Upload failed');
      }

      const file_url = upload.file_url;

      setUploading(false);
      setExtracting(true);

      // OCR opcional
      let data = {};

      try {
        const result = await fetch('/api/extract-prescription.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_url }),
        });

        if (result.ok) {
          const json = await result.json();
          data = json?.output || {};
        }
      } catch (err) {
        console.log('OCR no disponible');
      }

      setExtracting(false);

      setPrescriptionData(data);

      onPrescriptionReady({
        file_url,
        data,
      });

    } catch (err) {
      console.error(err);

      setUploading(false);
      setExtracting(false);

      alert('Error subiendo receta');
    }
  };

  /* =========================
     FILE INPUT
  ========================= */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    await processFile(file);
  };

  /* =========================
     CAMERA
  ========================= */
  const startCamera = async () => {
    setCameraActive(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
      },
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());

    streamRef.current = null;

    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0);

    stopCamera();

    canvas.toBlob(
      async (blob) => {
        const file = new File(
          [blob],
          'receta.jpg',
          {
            type: 'image/jpeg',
          }
        );

        await processFile(file);
      },
      'image/jpeg',
      0.9
    );
  };

  /* =========================
     CLEAR
  ========================= */
  const handleClear = () => {
    setPreview(null);
    setPrescriptionData(null);

    onPrescriptionReady(null);
  };

  return (
    <div className="space-y-6">

      <h3 className="text-xl font-semibold">
        Receta Óptica
      </h3>

      <AnimatePresence mode="wait">

        {cameraActive ? (
          <motion.div key="camera">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl"
            />

            <div className="flex gap-3 mt-3">

              <Button onClick={capturePhoto}>
                Capturar
              </Button>

              <Button
                variant="outline"
                onClick={stopCamera}
              >
                Cancelar
              </Button>

            </div>

          </motion.div>

        ) : !preview ? (

          <motion.div key="upload">

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed p-10 rounded-xl"
            >
              <Upload className="mx-auto mb-2" />

              Subir receta
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              onClick={startCamera}
              className="mt-3"
            >
              <Camera className="w-4 h-4 mr-2" />
              Usar cámara
            </Button>

          </motion.div>

        ) : (

          <motion.div key="preview">

            <img
              src={preview}
              alt="Receta"
              className="rounded-xl"
            />

            <Button
              onClick={handleClear}
              className="mt-3"
            >
              <X className="w-4 h-4 mr-2" />
              Eliminar
            </Button>

            {(uploading || extracting) && (
              <div className="p-4 text-center">

                <Loader2 className="animate-spin mx-auto mb-2" />

                Procesando...

              </div>
            )}

{preview && !uploading && !extracting && (
  <div className="mt-4 p-4 border rounded-xl bg-green-500/10 border-green-500/20">

    <div className="flex items-center gap-2 text-green-600">
      <FileCheck className="w-5 h-5" />

      <span className="font-medium">
        Receta cargada exitosamente
      </span>
    </div>

  </div>
)}

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}