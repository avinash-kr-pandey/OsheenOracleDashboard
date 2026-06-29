/**
 * Utility to compress and resize an image on the client side using HTML5 Canvas
 */
export const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> => {
  // Bypass compression to allow uploading any image of any quality/size directly
  return Promise.resolve(file);
};
