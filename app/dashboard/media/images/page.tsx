"use client";
// components/dashboard/Images.tsx
import { mediaAPI, MediaFile } from "@/utils/media.api";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";


const Images = () => {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all images
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await mediaAPI.getImages();
      if (response.success && response.files?.images) {
        setImages(response.files.images);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload new image
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }


    setUploading(true);
    try {
      const response = await mediaAPI.uploadFile(file);
      if (response.success) {
        toast.success("Image uploaded successfully!");
        fetchImages(); // Refresh the list
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  // Delete image
  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await mediaAPI.deleteMedia(filename);
      if (response.success) {
        toast.success("Image deleted successfully!");
        fetchImages(); // Refresh the list
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  // View image in modal
  const viewImage = (image: MediaFile) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Images Gallery</h1>
        <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No images uploaded yet. Click Upload Image to add some.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.filename}
              className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={image.url}
                alt={image.originalname}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => viewImage(image)}
                onError={(e) => {
                  const target = e.currentTarget;
                  const svgPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f4f6'/><path d='M200 120c11.05 0 20-8.95 20-20s-8.95-20-20-20-20 8.95-20 20 8.95 20 20 20zm0 15c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40zm0 20c-36.82 0-66.67 29.85-66.67 66.67h133.34c0-36.82-29.85-66.67-66.67-66.67z' fill='%239ca3af'/><text x='50%' y='85%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' font-weight='500' fill='%236b7280'>Failed to load image</text></svg>";
                  if (target.src !== svgPlaceholder) {
                    target.src = svgPlaceholder;
                  }
                }}
              />
              <div className="p-3">
                <p
                  className="text-sm font-medium truncate"
                  title={image.originalname}
                >
                  {image.originalname}
                </p>
                <p className="text-xs text-gray-500">
                  {(image.size / 1024).toFixed(2)} KB
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(image.url)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(image.filename)}
                    className="text-xs bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing image */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-w-4xl max-h-screen p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.originalname}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Images;
