// services/about.api.ts
import { fetchData, putData } from "@/utils/api";

/* =======================
   TYPES - According to backend schema
======================= */

export interface Stat {
  label: string;
  value: string;
}

export interface Section {
  title: string;
  content: string;
}

export interface AboutData {
  _id?: string;
  heroTitle: string;
  heroDescription: string;
  mission: string;
  vision: string;
  stats: Stat[];
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface AboutResponse {
  success?: boolean;
  message?: string;
  data?: AboutData;
  error?: string;
}

/* =======================
   API CALLS - Only GET and PUT as per backend
======================= */

export const aboutAPI = {
  /**
   * GET /api/about
   * Fetch about page data
   */
  getAbout: async (): Promise<AboutData | null> => {
    try {
      console.log("📋 Fetching about data...");
      const response = await fetchData<AboutResponse>("/about");
      
      console.log("📦 Raw response:", response);

      if (!response) {
        console.log("⚠️ No response received");
        return null;
      }

      // Backend returns: { success: true, data: aboutObject }
      if (response.success && response.data) {
        console.log("✅ About data found:", response.data);
        return response.data;
      }

      // If response itself is the about object
      if (response && typeof response === 'object' && 'heroTitle' in response) {
        console.log("✅ Direct about object found");
        return response as unknown as AboutData;
      }

      console.log("⚠️ No valid about data found");
      return null;
    } catch (error) {
      console.error("❌ Get about error:", error);
      return null;
    }
  },

  /**
   * PUT /api/about
   * Update about page data
   */
  updateAbout: async (data: Partial<AboutData>): Promise<AboutData | null> => {
    try {
      console.log("📝 Updating about data with:", data);
      
      const response = await putData<AboutResponse>("/about", data);
      console.log("📦 Update response:", response);

      if (!response) {
        console.log("⚠️ No response received");
        return null;
      }

      // Check for error
      if (!response.success) {
        throw new Error(response.message || "Update failed");
      }

      // Backend returns updated data
      if (response.data) {
        console.log("✅ About data updated successfully:", response.data);
        return response.data;
      }

      // If response itself is the updated object
      if (response && typeof response === 'object' && 'heroTitle' in response) {
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
   */
  hasAboutData: async (): Promise<boolean> => {
    try {
      const data = await aboutAPI.getAbout();
      const hasData = data !== null && !!data._id;
      console.log(`📊 About data exists: ${hasData}`);
      return hasData;
    } catch {
      return false;
    }
  },

  /**
   * Initialize default about data if none exists
   * This is a helper method, not an API call
   */
  initializeDefaultData: (): Partial<AboutData> => {
    return {
      heroTitle: "Welcome to Our Company",
      heroDescription: "We are dedicated to providing the best service",
      mission: "Our mission is to deliver excellence",
      vision: "To be the industry leader",
      stats: [
        { label: "Years of Experience", value: "10+" },
        { label: "Happy Clients", value: "500+" },
        { label: "Projects Completed", value: "1000+" },
        { label: "Team Members", value: "50+" }
      ],
      sections: [
        {
          title: "Our Story",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        {
          title: "Our Values",
          content: "Integrity, Innovation, Excellence, Customer First"
        }
      ]
    };
  }
};

// Export types
export type { AboutData as AboutDataType };