// utils/api.ts
import axios, { AxiosError, AxiosResponse } from "axios";

// const API_BASE_URL = "https://osheenoraclebackend02-4oz7.onrender.com/api";
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ FIX: GET requests se cache headers hatao
      if (config.method?.toLowerCase() === "get") {
        // Sirf Authorization header rakho, cache headers hatao
        delete config.headers["Cache-Control"];
        delete config.headers["Pragma"];
        delete config.headers["Expires"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

// Set token dynamically
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/* =======================
   GET - UPDATED
======================= */
export const fetchData = async <T = unknown>(
  endpoint: string,
  params?: object,
  noCache: boolean = false, // ✅ Default false
): Promise<T> => {
  try {
    // ✅ Sirf params bhejo, headers mat bhejo
    const response: AxiosResponse<T> = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("GET Error:", err.response?.data || err.message);
    throw err;
  }
};

/* =======================
   POST
======================= */
export const postData = async <T = unknown>(
  endpoint: string,
  data: object,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("POST Error:", err.response?.data || err.message);
    throw err;
  }
};

/* =======================
   PUT
======================= */
export const putData = async <T = unknown>(
  endpoint: string,
  data: object,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("PUT Error:", err.response?.data || err.message);
    throw err;
  }
};

/* =======================
   DELETE
======================= */
export const deleteData = async <T = unknown>(endpoint: string): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("DELETE Error:", err.response?.data || err.message);
    throw err;
  }
};
// utils/api.ts - Horoscope section

/* =======================
   HOROSCOPE ENDPOINTS
   Based on your backend routes and actual schema
======================= */

// Complete Horoscope type matching your backend
export interface Horoscope {
  _id: string;
  zodiacSign: string;
  zodiacSignHindi: string;
  rishiName: string;
  rishiNameHindi: string;
  date: string;
  prediction: string;
  predictionHindi: string;
  timeFrame: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  // For backward compatibility - optional
  sign?: string;
}

export interface HoroscopeResponse {
  success?: boolean;
  message?: string;
  data?: Horoscope | Horoscope[];
  horoscope?: Horoscope;
  horoscopes?: Horoscope[];
  error?: string;
  status?: number;
  statusCode?: number;

  // For when the response is directly a Horoscope object
  _id?: string;
  zodiacSign?: string;
  zodiacSignHindi?: string;
  rishiName?: string;
  rishiNameHindi?: string;
  date?: string;
  prediction?: string;
  predictionHindi?: string;
  timeFrame?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateHoroscopeData {
  zodiacSign: string;
  zodiacSignHindi: string;
  date: string;
  prediction: string;
  predictionHindi: string;
  timeFrame: string;
  rishiName: string;
  rishiNameHindi: string;

  // Optional for backward compatibility
  sign?: string;
}

export const horoscopeAPI = {
  /**
   * Add new horoscope prediction
   * POST /api/horoscope
   * @param horoscopeData - Complete horoscope data with Hindi fields
   * @returns Promise with response
   */
  addHoroscope: (
    horoscopeData: CreateHoroscopeData,
  ): Promise<HoroscopeResponse> => {
    console.log("📝 Adding horoscope:", horoscopeData);
    return postData<HoroscopeResponse>("/horoscope", horoscopeData);
  },

  /**
   * Get horoscope by zodiac sign
   * GET /api/horoscope/{sign}
   * @param sign - Zodiac sign name (English)
   * @returns Promise with horoscope data
   */
  getHoroscopeBySign: (sign: string): Promise<HoroscopeResponse> => {
    console.log("🔍 Fetching horoscope for sign:", sign);
    return fetchData<HoroscopeResponse>(`/horoscope/${sign}`);
  },

  /**
   * Get horoscope by sign and time frame
   * GET /api/horoscope/{sign}/{time}
   * @param sign - Zodiac sign name (English)
   * @param time - Time frame (daily, weekly, monthly, yearly)
   * @returns Promise with horoscope data
   */
  getHoroscopeBySignAndTime: (
    sign: string,
    time: string,
  ): Promise<HoroscopeResponse> => {
    console.log("📅 Fetching horoscope for:", sign, time);
    return fetchData<HoroscopeResponse>(`/horoscope/${sign}/${time}`);
  },

  /**
   * Get all horoscopes (if this endpoint exists)
   * GET /api/horoscope
   * @returns Promise with all horoscopes
   */
  getAllHoroscopes: (): Promise<HoroscopeResponse> => {
    console.log("📋 Fetching all horoscopes");
    return fetchData<HoroscopeResponse>("/horoscope");
  },
};

export default api;
