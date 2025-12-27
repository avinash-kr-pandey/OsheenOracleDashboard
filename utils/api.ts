// utils/api.ts
import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE_URL = "https://osheenoraclebackend-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token from localStorage
api.interceptors.request.use(
  (config) => {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // 🚫 Login page par ho to redirect mat karo
        if (currentPath !== "/login") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
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
  noCache: boolean = true
): Promise<T> => {
  try {
    const headers = noCache ? { "Cache-Control": "no-cache" } : undefined;
    const response: AxiosResponse<T> = await api.get(endpoint, {
      params,
      headers,
    });
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
  data: object
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
  data: object
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

export default api;
