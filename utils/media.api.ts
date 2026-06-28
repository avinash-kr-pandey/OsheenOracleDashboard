import { fetchData, postData, putData, deleteData, postFormData } from "./api";

// Types for Media
export interface MediaFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  type: "image" | "video" | "document";
  url: string;
  createdAt?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  message: string;
  file: MediaFile;
}

export interface MediaListResponse {
  success: boolean;
  files: {
    images: MediaFile[];
    videos: MediaFile[];
    others: MediaFile[];
    total: number;
  };
}

export interface MediaDeleteResponse {
  success: boolean;
  message: string;
}

// Media API functions
export const mediaAPI = {
  /**
   * Upload a single file (image/video)
   * POST /api/uploads/file-upload
   * @param file - File object to upload
   * @returns Promise with uploaded file details
   */
  uploadFile: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await postFormData<MediaUploadResponse>(
        "/uploads/file-upload",
        formData,
      );
      return response;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  /**
   * Get all media files (images and videos)
   * GET /api/uploads/list
   * @returns Promise with list of all media files
   */
  getAllMedia: (): Promise<MediaListResponse> => {
    return fetchData<MediaListResponse>("/uploads/list");
  },

  /**
   * Get only images
   * GET /api/uploads/list?type=images
   */
  getImages: (): Promise<MediaListResponse> => {
    return fetchData<MediaListResponse>("/uploads/list?type=images");
  },

  /**
   * Get only videos
   * GET /api/uploads/list?type=videos
   */
  getVideos: (): Promise<MediaListResponse> => {
    return fetchData<MediaListResponse>("/uploads/list?type=videos");
  },

  /**
   * Delete a media file
   * DELETE /api/uploads/:filename
   * @param filename - Name of the file to delete
   * @returns Promise with delete response
   */
  deleteMedia: (filename: string): Promise<MediaDeleteResponse> => {
    return deleteData<MediaDeleteResponse>(`/uploads/${filename}`);
  },

  /**
   * Get file URL for display
   * @param filename - Name of the file
   * @returns Full URL to access the file
   */
  getFileUrl: (filename: string): string => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const baseUrl = isLocal ? "http://localhost:5000" : "https://api.osheenoracle.com";
      return `${baseUrl}/uploads/images/${filename}`;
    }
    return `https://api.osheenoracle.com/uploads/images/${filename}`;
  },

  /**
   * Get video URL for display
   * @param filename - Name of the video file
   * @returns Full URL to access the video
   */
  getVideoUrl: (filename: string): string => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const baseUrl = isLocal ? "http://localhost:5000" : "https://api.osheenoracle.com";
      return `${baseUrl}/uploads/videos/${filename}`;
    }
    return `https://api.osheenoracle.com/uploads/videos/${filename}`;
  },
};
