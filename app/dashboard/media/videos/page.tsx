"use client";

// components/dashboard/Videos.tsx
import { mediaAPI, MediaFile } from "@/utils/media.api";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";


const Videos = () => {
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);

  // Fetch all videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await mediaAPI.getVideos();
      if (response.success && response.files?.videos) {
        setVideos(response.files.videos);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload new video
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is video
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Check file size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      toast.error("File size should be less than 200MB");
      return;
    }

    setUploading(true);
    try {
      const response = await mediaAPI.uploadFile(file);
      if (response.success) {
        toast.success("Video uploaded successfully!");
        fetchVideos(); // Refresh the list
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  // Delete video
  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await mediaAPI.deleteMedia(filename);
      if (response.success) {
        toast.success("Video deleted successfully!");
        fetchVideos(); // Refresh the list
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Videos Gallery</h1>
        <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          {uploading ? "Uploading..." : "Upload Video"}
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No videos uploaded yet. Click Upload Video to add some.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.filename}
              className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <video
                src={video.url}
                className="w-full h-64 object-cover"
                controls
                poster="/video-placeholder.png"
              >
                Your browser does not support the video tag.
              </video>
              <div className="p-3">
                <p
                  className="text-sm font-medium truncate"
                  title={video.originalname}
                >
                  {video.originalname}
                </p>
                <p className="text-xs text-gray-500">
                  {(video.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(video.url)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(video.filename)}
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
    </div>
  );
};

export default Videos;
