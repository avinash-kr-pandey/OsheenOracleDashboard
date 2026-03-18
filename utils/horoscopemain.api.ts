// services/horoscope.api.ts
import { fetchData, postData, putData, deleteData } from "../utils/api";

// ---------- ZODIAC TYPES ----------
export interface Zodiac {
  _id: string;
  name: string;
  nameHindi: string;
  symbol: string;
  icon: string;
  dates: string;
  datesHindi: string;
  element: string;
  elementHindi: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateZodiacData = Omit<Zodiac, "_id" | "createdAt" | "updatedAt">;
export type UpdateZodiacData = Partial<CreateZodiacData>;

// ---------- HOROSCOPE PREDICTION TYPES ----------
export interface HoroscopePrediction {
  _id: string;
  zodiacSign: string;
  zodiacSignHindi?: string;
  rishiName?: string;
  rishiNameHindi?: string;
  date: string;
  prediction: string;
  predictionHindi?: string;
  timeFrame: "daily" | "weekly" | "monthly" | "yearly";
  createdAt?: string;
}

export type CreateHoroscopeData = Omit<
  HoroscopePrediction,
  "_id" | "createdAt"
>;
export type UpdateHoroscopeData = Partial<CreateHoroscopeData>;

export interface HoroscopeCreateResponse {
  message: string;
  item: HoroscopePrediction;
}

export interface HoroscopeUpdateResponse {
  message: string;
  item: HoroscopePrediction;
}

// ---------- RISHI TYPES ----------
export interface Rishi {
  _id: string;
  name: string;
  nameHindi?: string;
  biography: string;
  biographyHindi?: string;
  era: string;
  eraHindi?: string;
  createdAt?: string;
}

export type CreateRishiData = Omit<Rishi, "_id" | "createdAt">;
export type UpdateRishiData = Partial<CreateRishiData>;

export interface RishiCreateResponse {
  message: string;
  rishi: Rishi;
}

export interface RishiUpdateResponse {
  message: string;
  rishi: Rishi;
}

// ---------- COMMON RESPONSE TYPES ----------
export interface DeleteResponse {
  message: string;
}

// ---------- ZODIAC API ----------
export const zodiacAPI = {
  getAll: (): Promise<Zodiac[]> => fetchData<Zodiac[]>("/zodiacs"),

  getById: (id: string): Promise<Zodiac> => fetchData<Zodiac>(`/zodiacs/${id}`),

  create: (
    data: CreateZodiacData,
  ): Promise<{ message: string; zodiac: Zodiac }> =>
    postData<{ message: string; zodiac: Zodiac }>("/zodiacs", data),

  update: (
    id: string,
    data: UpdateZodiacData,
  ): Promise<{ message: string; zodiac: Zodiac }> =>
    putData<{ message: string; zodiac: Zodiac }>(`/zodiacs/${id}`, data),

  delete: (id: string): Promise<DeleteResponse> =>
    deleteData<DeleteResponse>(`/zodiacs/${id}`),
};

// ---------- HOROSCOPE API ----------
export const horoscopeAPI = {
  getAll: (): Promise<HoroscopePrediction[]> =>
    fetchData<HoroscopePrediction[]>("/horoscope"),

  getBySign: (sign: string): Promise<HoroscopePrediction[]> =>
    fetchData<HoroscopePrediction[]>(`/horoscope/${sign}`),

  getBySignAndTime: (
    sign: string,
    time: string,
  ): Promise<HoroscopePrediction> =>
    fetchData<HoroscopePrediction>(`/horoscope/${sign}/${time}`),

  create: (data: CreateHoroscopeData): Promise<HoroscopeCreateResponse> =>
    postData<HoroscopeCreateResponse>("/horoscope", data),

  update: (
    id: string,
    data: UpdateHoroscopeData,
  ): Promise<HoroscopeUpdateResponse> =>
    putData<HoroscopeUpdateResponse>(`/horoscope/${id}`, data),

  delete: (id: string): Promise<DeleteResponse> =>
    deleteData<DeleteResponse>(`/horoscope/${id}`),
};

// ---------- RISHI API ----------
export const rishiAPI = {
  getAll: (): Promise<Rishi[]> => fetchData<Rishi[]>("/rishis"),

  getById: (id: string): Promise<Rishi> => fetchData<Rishi>(`/rishis/${id}`),

  create: (data: CreateRishiData): Promise<RishiCreateResponse> =>
    postData<RishiCreateResponse>("/rishis", data),

  update: (id: string, data: UpdateRishiData): Promise<RishiUpdateResponse> =>
    putData<RishiUpdateResponse>(`/rishis/${id}`, data),

  delete: (id: string): Promise<DeleteResponse> =>
    deleteData<DeleteResponse>(`/rishis/${id}`),
};
