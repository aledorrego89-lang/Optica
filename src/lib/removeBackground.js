/**
 * Removes white/near-white background from an image using canvas pixel manipulation.
 * Returns a data URL of the image with the background made transparent.
 */
export function removeWhiteBackground(imageUrl, tolerance = 240) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is near-white, make it transparent
        if (r >= tolerance && g >= tolerance && b >= tolerance) {
          // Smooth edge: partial transparency based on how white it is
          const whiteness = Math.min(r, g, b);
          const alpha = Math.round(((255 - whiteness) / (255 - tolerance)) * 255);
          data[i + 3] = Math.min(alpha, data[i + 3]);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;

    // For cross-origin images, we proxy through a fresh load
    img.src = imageUrl;
  });
}