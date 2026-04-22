// lib/horoscopeData.ts
import {
  zodiacAPI,
  horoscopeAPI,
  rishiAPI,
  Zodiac,
  HoroscopePrediction,
  Rishi,
  CreateZodiacData,
  CreateHoroscopeData,
  CreateRishiData,
} from "@/utils/horoscopemain.api";

// Predefined data
export const ZODIAC_SIGNS_LIST = [
  {
    id: 1,
    name: "Aries",
    nameHindi: "मेष",
    symbol: "♈",
    dates: "Mar 21 - Apr 19",
    element: "Fire",
    elementHindi: "अग्नि",
  },
  {
    id: 2,
    name: "Taurus",
    nameHindi: "वृषभ",
    symbol: "♉",
    dates: "Apr 20 - May 20",
    element: "Earth",
    elementHindi: "पृथ्वी",
  },
  {
    id: 3,
    name: "Gemini",
    nameHindi: "मिथुन",
    symbol: "♊",
    dates: "May 21 - Jun 20",
    element: "Air",
    elementHindi: "वायु",
  },
  {
    id: 4,
    name: "Cancer",
    nameHindi: "कर्क",
    symbol: "♋",
    dates: "Jun 21 - Jul 22",
    element: "Water",
    elementHindi: "जल",
  },
  {
    id: 5,
    name: "Leo",
    nameHindi: "सिंह",
    symbol: "♌",
    dates: "Jul 23 - Aug 22",
    element: "Fire",
    elementHindi: "अग्नि",
  },
  {
    id: 6,
    name: "Virgo",
    nameHindi: "कन्या",
    symbol: "♍",
    dates: "Aug 23 - Sep 22",
    element: "Earth",
    elementHindi: "पृथ्वी",
  },
  {
    id: 7,
    name: "Libra",
    nameHindi: "तुला",
    symbol: "♎",
    dates: "Sep 23 - Oct 22",
    element: "Air",
    elementHindi: "वायु",
  },
  {
    id: 8,
    name: "Scorpio",
    nameHindi: "वृश्चिक",
    symbol: "♏",
    dates: "Oct 23 - Nov 21",
    element: "Water",
    elementHindi: "जल",
  },
  {
    id: 9,
    name: "Sagittarius",
    nameHindi: "धनु",
    symbol: "♐",
    dates: "Nov 22 - Dec 21",
    element: "Fire",
    elementHindi: "अग्नि",
  },
  {
    id: 10,
    name: "Capricorn",
    nameHindi: "मकर",
    symbol: "♑",
    dates: "Dec 22 - Jan 19",
    element: "Earth",
    elementHindi: "पृथ्वी",
  },
  {
    id: 11,
    name: "Aquarius",
    nameHindi: "कुंभ",
    symbol: "♒",
    dates: "Jan 20 - Feb 18",
    element: "Air",
    elementHindi: "वायु",
  },
  {
    id: 12,
    name: "Pisces",
    nameHindi: "मीन",
    symbol: "♓",
    dates: "Feb 19 - Mar 20",
    element: "Water",
    elementHindi: "जल",
  },
];

export const TIME_FRAMES = [
  { value: "daily" as const, label: "Daily", labelHindi: "दैनिक" },
  { value: "weekly" as const, label: "Weekly", labelHindi: "साप्ताहिक" },
  { value: "monthly" as const, label: "Monthly", labelHindi: "मासिक" },
  { value: "yearly" as const, label: "Yearly", labelHindi: "वार्षिक" },
];

export const ELEMENTS = [
  { name: "Fire", nameHindi: "अग्नि" },
  { name: "Earth", nameHindi: "पृथ्वी" },
  { name: "Air", nameHindi: "वायु" },
  { name: "Water", nameHindi: "जल" },
];

// API Functions
export const fetchAllData = async () => {
  const [zodiacData, predictionData, rishiData] = await Promise.all([
    zodiacAPI.getAll(),
    horoscopeAPI.getAll(),
    rishiAPI.getAll(),
  ]);
  return {
    zodiacs: Array.isArray(zodiacData) ? zodiacData : [],
    predictions: Array.isArray(predictionData) ? predictionData : [],
    rishis: Array.isArray(rishiData) ? rishiData : [],
  };
};

export const addZodiacAPI = async (data: CreateZodiacData) => {
  const response = await zodiacAPI.create(data);
  return response.zodiac;
};

export const updateZodiacAPI = async (
  id: string,
  data: Partial<CreateZodiacData>,
) => {
  const response = await zodiacAPI.update(id, data);
  return response.zodiac;
};

export const deleteZodiacAPI = async (id: string) => {
  await zodiacAPI.delete(id);
};

export const addPredictionAPI = async (data: CreateHoroscopeData) => {
  const response = await horoscopeAPI.create(data);
  return response.item;
};

export const updatePredictionAPI = async (
  id: string,
  data: Partial<CreateHoroscopeData>,
) => {
  const response = await horoscopeAPI.update(id, data);
  return response.item;
};

export const deletePredictionAPI = async (id: string) => {
  await horoscopeAPI.delete(id);
};

export const addRishiAPI = async (data: CreateRishiData) => {
  const response = await rishiAPI.create(data);
  return response.rishi;
};

export const updateRishiAPI = async (
  id: string,
  data: Partial<CreateRishiData>,
) => {
  const response = await rishiAPI.update(id, data);
  return response.rishi;
};

export const deleteRishiAPI = async (id: string) => {
  await rishiAPI.delete(id);
};
