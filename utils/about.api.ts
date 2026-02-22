// services/about.api.ts
import { fetchData, putData, postData } from "@/utils/api";

/* =======================
   TYPES - Properly defined
======================= */

export interface AboutData {
  _id?: string;
  title: string;
  description: string;
  content: string;
  image?: string; // Keep optional if you want to store image URL from somewhere else
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface AboutResponse {
  success?: boolean;
  message?: string;
  data?: AboutData | AboutData[];
  about?: AboutData;
  error?: string;
  status?: number;
  statusCode?: number;
}

/* =======================
   API CALLS - Clean and separated
   NO FILE UPLOAD - Completely removed
======================= */

export const aboutAPI = {
  /**
   * GET /api/about
   * Fetch about page data
   * @returns Promise with about data
   */
  getAbout: async (): Promise<AboutData | null> => {
    try {
      console.log("📋 Fetching about data...");
      const response = await fetchData<AboutResponse>("/about");

      // Handle different response structures
      if (!response) return null;

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        return response.data[0];
      } else if (response?.data && !Array.isArray(response.data)) {
        return response.data;
      } else if (response?.about) {
        return response.about;
      } else if (Array.isArray(response) && response.length > 0) {
        return response[0] as unknown as AboutData;
      } else if (!Array.isArray(response) && response && "_id" in response) {
        return response as unknown as AboutData;
      }

      return null;
    } catch (error) {
      console.error("❌ Get about error:", error);
      return null;
    }
  },

  /**
   * POST /api/about
   * Create about page data
   * @param data - About data to save
   * @returns Promise with saved about data
   */
  createAbout: async (data: Partial<AboutData>): Promise<AboutData | null> => {
    try {
      console.log("📝 Creating about data...");
      const response = await postData<AboutResponse>("/about", data);

      if (!response) return null;

      if (response?.data) {
        return Array.isArray(response.data) ? response.data[0] : response.data;
      }

      if (response?.about) {
        return response.about;
      }

      if (!Array.isArray(response) && response && "_id" in response) {
        return response as unknown as AboutData;
      }

      return null;
    } catch (error) {
      console.error("❌ Create about error:", error);
      throw error;
    }
  },

  /**
   * PUT /api/about
   * Update about page data
   * @param data - About data to update
   * @returns Promise with updated about data
   */
  updateAbout: async (data: Partial<AboutData>): Promise<AboutData | null> => {
    try {
      console.log("📝 Updating about data...");
      const response = await putData<AboutResponse>("/about", data);

      if (!response) return null;

      if (response?.data) {
        return Array.isArray(response.data) ? response.data[0] : response.data;
      } else if (response?.about) {
        return response.about;
      } else if (!Array.isArray(response) && response && "_id" in response) {
        return response as unknown as AboutData;
      }

      return null;
    } catch (error) {
      console.error("❌ Update about error:", error);
      throw error;
    }
  },

  /**
   * Check if about data exists
   * @returns Promise<boolean>
   */
  hasAboutData: async (): Promise<boolean> => {
    try {
      const data = await aboutAPI.getAbout();
      return data !== null && !!data._id;
    } catch {
      return false;
    }
  },
};

// Export types for use in components
export type { AboutData as AboutDataType };
