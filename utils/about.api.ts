// services/about.api.ts
import { fetchData, putData } from "@/utils/api";

/* =======================
   TYPES - According to backend schema
======================= */

export interface Stat {
  label: string;
  value: string;
  _id?: string; // Backend _id field optional
}

export interface Section {
  title: string;
  content: string;
  _id?: string; // Backend _id field optional
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
      const response = await fetchData<AboutResponse | AboutData>("/about");

      console.log("📦 Raw response:", response);

      if (!response) {
        console.log("⚠️ No response received");
        return null;
      }

      // 🔥 Case 1: Response is { success: true, data: aboutObject }
      if (typeof response === "object" && response !== null) {
        // Check if it's the wrapped response
        if (
          "success" in response &&
          response.success === true &&
          response.data
        ) {
          console.log("✅ About data found in wrapper:", response.data);
          return response.data;
        }

        // 🔥 Case 2: Response is directly the AboutData object
        if ("heroTitle" in response || "mission" in response) {
          console.log("✅ Direct about object found");
          return response as AboutData;
        }
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

      const response = await putData<AboutResponse | AboutData>("/about", data);
      console.log("📦 Update response:", response);

      if (!response) {
        console.log("⚠️ No response received");
        return null;
      }

      // 🔥 Handle wrapped response
      if (typeof response === "object" && response !== null) {
        if ("success" in response) {
          if (response.success === false) {
            throw new Error(response.message || "Update failed");
          }
          if (response.success === true && response.data) {
            console.log("✅ About data updated successfully:", response.data);
            return response.data;
          }
        }

        // 🔥 Direct object response
        if ("heroTitle" in response || "mission" in response) {
          console.log("✅ Direct updated object received");
          return response as AboutData;
        }
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

  // 🗑️ REMOVED: initializeDefaultData method - No hardcoded data!
};

// Export types
export type { AboutData as AboutDataType };
