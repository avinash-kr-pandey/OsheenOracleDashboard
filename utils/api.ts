import axios, { AxiosError, AxiosResponse } from "axios";

// ✅ Dynamic API URL based on environment
const getApiUrl = () => {
  // For production
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.NEXT_PUBLIC_API_URL || "https://api.osheenoracle.com/api"
    );
  }
  // For development
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

const API_BASE_URL = getApiUrl();

console.log("🔧 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    "Content-Type": "application/json",
  },
  // ✅ IMPORTANT: Enable credentials for cookies/session
  withCredentials: true,
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
        delete config.headers["Cache-Control"];
        delete config.headers["Pragma"];
        delete config.headers["Expires"];
      }

      // ✅ For multipart/form-data (file uploads), remove Content-Type header
      // Let browser set it automatically with boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
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
        if (currentPath !== "/login" && !currentPath.includes("/admin")) {
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
   GET
======================= */
export const fetchData = async <T = unknown>(
  endpoint: string,
  params?: object,
): Promise<T> => {
  try {
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
   POST FORM DATA (for file uploads)
======================= */
export const postFormData = async <T = unknown>(
  endpoint: string,
  formData: FormData,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("POST FormData Error:", err.response?.data || err.message);
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
   PATCH
======================= */
export const patchData = async <T = unknown>(
  endpoint: string,
  data: object,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.patch(endpoint, data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("PATCH Error:", err.response?.data || err.message);
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

/* =======================
   FILE UPLOAD HELPER
======================= */
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await postFormData<{
      success: boolean;
      message?: string;
      file: {
        url: string;
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
        type: string;
      };
    }>("/uploads/file-upload", formData);

    if (response.success && response.file?.url) {
      return response.file.url;
    }
    throw new Error(response.message || "Upload failed");
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/* =======================
   HOROSCOPE ENDPOINTS
======================= */

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
  sign?: string;
}

export const horoscopeAPI = {
  addHoroscope: (
    horoscopeData: CreateHoroscopeData,
  ): Promise<HoroscopeResponse> => {
    console.log("📝 Adding horoscope:", horoscopeData);
    return postData<HoroscopeResponse>("/horoscope", horoscopeData);
  },

  getHoroscopeBySign: (sign: string): Promise<HoroscopeResponse> => {
    console.log("🔍 Fetching horoscope for sign:", sign);
    return fetchData<HoroscopeResponse>(`/horoscope/${sign}`);
  },

  getHoroscopeBySignAndTime: (
    sign: string,
    time: string,
  ): Promise<HoroscopeResponse> => {
    console.log("📅 Fetching horoscope for:", sign, time);
    return fetchData<HoroscopeResponse>(`/horoscope/${sign}/${time}`);
  },

  getAllHoroscopes: (): Promise<HoroscopeResponse> => {
    console.log("📋 Fetching all horoscopes");
    return fetchData<HoroscopeResponse>("/horoscope");
  },
};

export default api;
