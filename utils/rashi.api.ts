// services/rashi.api.ts
import { fetchData, postData, putData, deleteData } from "../utils/api";

// Rishi type definition based on your backend schema
export interface Rishi {
  _id: string;
  name: string;
  biography: string;
  era: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RishiResponse {
  message?: string;
  rishi?: Rishi;
  error?: string;
  // For getAll response (direct array)
  [key: number]: Rishi;
  length?: number;
}

export interface CreateRishiData {
  name: string;
  biography: string;
  era: string;
}

export const rashiAPI = {
  /**
   * Add a new rishi
   * POST /api/rishis
   */
  addRishi: (rishiData: CreateRishiData): Promise<RishiResponse> => {
    return postData<RishiResponse>("/rishis", rishiData);
  },

  /**
   * Get all rishis
   * GET /api/rishis
   */
  getAllRishis: (): Promise<Rishi[]> => {
    return fetchData<Rishi[]>("/rishis");
  },

  /**
   * Get single rishi by ID
   * GET /api/rishis/:id
   */
  getRishiById: (id: string): Promise<Rishi> => {
    return fetchData<Rishi>(`/rishis/${id}`);
  },

  /**
   * Update rishi - Note: Backend me update endpoint nahi hai,
   * but hum add kar sakte hain agar future me chahiye to
   */
  updateRishi: (
    id: string,
    rishiData: Partial<CreateRishiData>,
  ): Promise<RishiResponse> => {
    return putData<RishiResponse>(`/rishis/${id}`, rishiData);
  },

  /**
   * Delete rishi - Note: Backend me delete endpoint nahi hai,
   * but hum add kar sakte hain agar future me chahiye to
   */
  deleteRishi: (id: string): Promise<{ message: string }> => {
    return deleteData<{ message: string }>(`/rishis/${id}`);
  },
};
