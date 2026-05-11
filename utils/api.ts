import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE_URL = "https://api.osheenoracle.com/api";
// const API_BASE_URL = "http://localhost:5000/api";

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
   PATCH (NEW)
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

/* =======================
   CONTACT ENDPOINTS
======================= */

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/* =======================
   ANNOUNCEMENT ENDPOINTS
======================= */

export interface Announcement {
  _id: string;
  content: string;
  isActive: boolean;
  link: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
  message?: string;
}

export interface AnnouncementsListResponse {
  success: boolean;
  data: Announcement[];
}


export default api;
