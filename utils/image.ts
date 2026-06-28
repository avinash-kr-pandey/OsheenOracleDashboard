/**
 * Utility to compress and resize an image on the client side using HTML5 Canvas
 */
export const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    // Only compress image files
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to original
          return;
        }

        // Draw image on canvas with scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas back to Blob, then to File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type || "image/jpeg",
                lastModified: Date.now(),
              });
              console.log(
                `Image compressed: original size = ${(file.size / 1024).toFixed(2)} KB, compressed size = ${(compressedFile.size / 1024).toFixed(2)} KB`
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        resolve(file); // Fallback on image loading error
      };
    };
    reader.onerror = () => {
      resolve(file); // Fallback on file read error
    };
  });
};
