import { useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export default function LiveTryOn({ glassesImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!glassesImage) return;

   let glasses = null;

const loadGlasses = async (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    img.onload = () => resolve(img);
  });
};


let active = true;

loadGlasses(glassesImage).then((img) => {
  if (!active) return;
  glasses = img;
});


    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks?.length) return;

      const lm = results.multiFaceLandmarks[0];

      const leftEye = lm[33];
      const rightEye = lm[263];

      const lx = leftEye.x * canvas.width;
      const ly = leftEye.y * canvas.height;

      const rx = rightEye.x * canvas.width;
      const ry = rightEye.y * canvas.height;

      const dx = rx - lx;
      const dy = ry - ly;

      const angle = Math.atan2(dy, dx);

      const distance = Math.sqrt(dx * dx + dy * dy);

      const centerX = (lx + rx) / 2 - 0;
      const centerY = (ly + ry) / 2 + 15;

      const width = distance * 1.8;
      const height =
        width *
        (glasses.height / glasses.width);

      ctx.save();

      ctx.translate(centerX, centerY);

      ctx.rotate(angle);

      ctx.drawImage(
        glasses,
        -width / 2,
        -height / 2,
        width,
        height
      );

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({
          image: videoRef.current,
        });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [glassesImage]);

  return (
    <div className="relative rounded-xl overflow-hidden border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full"
        style={{
          transform: 'scaleX(-1)',
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  );
}