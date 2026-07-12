// services/home.api.ts
import { fetchData, postData, putData, deleteData, API_BASE_URL } from "./api";

// ==================== TYPES ====================

export interface DiscoverSection {
  osheenMaa: {
    title: string;
    description: string;
    image: string;
    link: string;
  };
  osheenOracle: {
    title: string;
    description: string;
    image: string;
    link: string;
  };
}

export interface DiscoverPath {
  _id?: string;
  title: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface AchievementImage {
  _id?: string;
  url: string;
  caption: string;
  order: number;
}

export interface AchievementsSection {
  title: string;
  description: string;
  images: AchievementImage[];
  stats: {
    yearsOfExperience: number;
    satisfiedClients: number;
    reviews: number;
    satisfactionRate: number;
  };
}

export interface MediaSpotlight {
  _id?: string;
  title: string;
  image: string;
  logo: string;
  link: string;
  order: number;
  isActive: boolean;
}

// ==================== CATALOGUE TYPES (Matching Backend Schema) ====================

export interface CatalogueItem {
  _id?: string;
  id: number;
  name: string;
  price: string;
  rating: number;
  date: string;
  image: string;
  description: string;
  traits: string[];
  element: string;
  planet: string;
  symbol: string;
  luckyColor: string;
  luckyNumber: number;
  compatibility: string[];
  benefits: string[];
  readingIncludes: string[];
  strengths: string[];
  challenges: string[];
  order: number;
  isActive: boolean;
}

export type Catalogue = CatalogueItem[];

// ==================== EXPERT GUIDE TYPES ====================

export interface ExpertGuide {
  _id?: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  satisfactionRate: number;
  expertise: string;
  experience: string;
  languages: string[];
  expertiseAreas: string[];
  isVerified: boolean;
  stats: {
    professionalExperience: string;
    satisfiedClients: string;
  };
  order: number;
  isActive: boolean;
}

export interface HomeData {
  discoverSection: DiscoverSection;
  discoverYourPath: DiscoverPath[];
  achievements: AchievementsSection;
  mediaSpotlight: MediaSpotlight[];
  catalogue: Catalogue;
  expertGuides: ExpertGuide[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// ==================== DEFAULT DATA ====================

export const DEFAULT_DISCOVER_SECTION: DiscoverSection = {
  osheenMaa: {
    title: "Osheen MAA",
    description:
      "Amarpreet Osheen Kaur, fondly called Osheen ma is a Spiritual Mentor, Healer, Tarot reader, aura reader, relationship counselor, motivation speaker, astrologer, Reiki master and white healing spells caster with an experience of more than 10 years in the study of field of Divination, spirituality, alternative healing modalities and creating magic. She was been given the title of No.1 tarot reader in India.",
    image: "/assets/youaremagic.jpg",
    link: "/osheen-maa",
  },
  osheenOracle: {
    title: "Osheen Oracle",
    description:
      "We are highly delighted to see you here at Osheen Oracle, which is 4 time consecutively awarded as No.1 tarot reading platform in India. Osheen Oracle is one stop solution for a comprehensive healing journey where you will find guidance to heal your life in all aspects of love, relationship, mental well-being, career success, business success and for every issue you must be facing today alone as we are here to help.",
    image: "/assets/youaremagic.jpg",
    link: "/osheen-oracle",
  },
};

export const DEFAULT_DISCOVER_PATHS: DiscoverPath[] = [
  {
    _id: "1",
    title: "Natal Chart Readings",
    description:
      "We generate your natal chart and interpret the positions of the planets, signs, and houses to give you insights into your personality, strengths, weaknesses, and life path.",
    image: "/assets/image-1.jpg",
    order: 1,
    isActive: true,
  },
  {
    _id: "2",
    title: "Compatibility Readings",
    description:
      "We can analyze the compatibility between two individuals by comparing their natal charts. This can help people understand their relationships with partners, friends, or family members better.",
    image: "/assets/image-2.jpg",
    order: 2,
    isActive: true,
  },
  {
    _id: "3",
    title: "Progression Readings",
    description:
      "We provide insights into upcoming planetary transits and progressions that may influence your life events and experiences. It can be useful for timing significant decisions or life changes.",
    image: "/assets/image-3.jpg",
    order: 3,
    isActive: true,
  },
];

export const DEFAULT_ACHIEVEMENTS: AchievementsSection = {
  title: "Achievements",
  description:
    "Over the years, our students and faculty have achieved remarkable milestones. From national-level competitions to innovative projects, we take pride in nurturing talent and fostering excellence. Our platform has consistently enabled learners to showcase their skills, earn awards, and grow into leaders in their fields.",
  images: [
    { url: "/assets/Achievements.jpg", caption: "Achievement 1", order: 0 },
    { url: "/assets/Achievements-1.jpeg", caption: "Achievement 2", order: 1 },
    { url: "/assets/Achievements-2.jpeg", caption: "Achievement 3", order: 2 },
  ],
  stats: {
    yearsOfExperience: 15,
    satisfiedClients: 4200,
    reviews: 892,
    satisfactionRate: 92,
  },
};

export const DEFAULT_MEDIA_SPOTLIGHT: MediaSpotlight[] = [
  {
    _id: "1",
    title: "ZEE NEWS",
    logo: "/media/zeenews.png",
    image: "/media/img-1.png",
    link: "https://zeenews.india.com/india/top-5-best-tarot-card-readers-of-2024-2026-2808723.html",
    order: 1,
    isActive: true,
  },
  {
    _id: "2",
    title: "ABP न्यूज़",
    logo: "/media/abp.png",
    image: "/media/img-2.png",
    link: "https://news.abplive.com/brand-wire/top-5-best-astrologers-in-india-2024-2025-1739419",
    order: 2,
    isActive: true,
  },
  {
    _id: "3",
    title: "FEMINA",
    logo: "/media/femina.png",
    image: "/media/img-3.jpg",
    link: "https://www.femina.in/trending/achievers/eight-extraordinary-individuals-stories-of-success-and-impact-285335.html",
    order: 3,
    isActive: true,
  },
  {
    _id: "4",
    title: "TEDx",
    logo: "/media/tde.png",
    image: "/media/img-4.png",
    link: "https://youtu.be/ef4QUwvJnEE?si=dDXvy2wLvz-t1Dti",
    order: 4,
    isActive: true,
  },
];

export const DEFAULT_CATALOGUE: Catalogue = [
  {
    _id: "1",
    id: 1,
    name: "Angel Card Reading",
    price: "599",
    rating: 4.5,
    date: "",
    image: "/images/resize3.jpg",
    description:
      "Receive gentle divine guidance filled with love, clarity, and healing messages from the angelic realm.",
    traits: ["Guidance", "Healing", "Clarity", "Hope", "Light"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Connect with your guardian angels",
      "Receive messages of hope and direction",
      "Gain emotional clarity and reassurance",
    ],
    readingIncludes: [
      "Personalized card reading",
      "Spiritual guidance",
      "Healing and clarity messages",
    ],
    strengths: ["Compassion", "Intuition", "Sensitivity"],
    challenges: ["Overthinking", "Self-doubt"],
    order: 1,
    isActive: true,
  },
  {
    _id: "2",
    id: 2,
    name: "On Call Consultation",
    price: "799",
    rating: 4.7,
    date: "",
    image: "/images/withcandle.png",
    description:
      "One-on-one spiritual consultation to bring clarity, healing, and solutions from the comfort of your home.",
    traits: ["Clarity", "Support", "Healing", "Guidance"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Instant guidance on personal issues",
      "Emotional support and clarity",
      "Practical spiritual solutions",
    ],
    readingIncludes: [
      "Personal consultation",
      "Healing techniques",
      "Guidance for challenges",
    ],
    strengths: ["Empathy", "Problem-solving", "Insight"],
    challenges: ["Overthinking", "Dependence"],
    order: 2,
    isActive: true,
  },
  {
    _id: "3",
    id: 3,
    name: "Tarot Reading & Guidance",
    price: "699",
    rating: 4.6,
    date: "",
    image: "/images/aboutglobe.png",
    description:
      "Soulful tarot sessions offering insight, balance, and direction for love, career, and life decisions.",
    traits: ["Insight", "Balance", "Intuition", "Clarity"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Understand hidden opportunities",
      "Gain clarity on decisions",
      "Receive balanced guidance for life paths",
    ],
    readingIncludes: [
      "Tarot card reading",
      "Life guidance",
      "Career & relationship insight",
    ],
    strengths: ["Intuition", "Clarity", "Decision-making"],
    challenges: ["Confusion", "Overanalyzing"],
    order: 3,
    isActive: true,
  },
  {
    _id: "4",
    id: 4,
    name: "Relationship Healing Spells",
    price: "899",
    rating: 4.8,
    date: "",
    image: "/images/card-hh.jpg",
    description:
      "Healing rituals to restore love, harmony, trust, and emotional balance in relationships.",
    traits: ["Healing", "Love", "Harmony", "Trust"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Restore emotional balance",
      "Strengthen connections",
      "Attract love and understanding",
    ],
    readingIncludes: [
      "Relationship spells",
      "Trust rebuilding",
      "Emotional healing",
    ],
    strengths: ["Compassion", "Patience", "Love"],
    challenges: ["Past baggage", "Misunderstandings"],
    order: 4,
    isActive: true,
  },
  {
    _id: "5",
    id: 5,
    name: "Career Healing Spells",
    price: "799",
    rating: 4.4,
    date: "",
    image: "/images/resize-gallery2.jpg",
    description:
      "Energy work to remove obstacles, boost confidence, and attract growth and success in career.",
    traits: ["Confidence", "Focus", "Abundance", "Motivation"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Overcome professional blockages",
      "Enhance focus and motivation",
      "Attract career opportunities and growth",
    ],
    readingIncludes: ["Career spells", "Motivation boost", "Growth alignment"],
    strengths: ["Ambition", "Focus", "Energy"],
    challenges: ["Stress", "Doubt"],
    order: 5,
    isActive: true,
  },
  {
    _id: "6",
    id: 6,
    name: "Spell Jars for Success",
    price: "699",
    rating: 4.3,
    date: "",
    image: "/images/spellJars/img-8.jpg",
    description:
      "Handcrafted spell jars infused with crystals and intentions to attract abundance and opportunities.",
    traits: ["Manifestation", "Abundance", "Success", "Energy"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Attract success and opportunities",
      "Boost confidence",
      "Align energy with goals",
    ],
    readingIncludes: [
      "Spell jar creation",
      "Intention setting",
      "Energy alignment",
    ],
    strengths: ["Manifestation", "Positivity", "Focus"],
    challenges: ["Negativity", "Distractions"],
    order: 6,
    isActive: true,
  },
  {
    _id: "7",
    id: 7,
    name: "Reiki Healing Sessions",
    price: "999",
    rating: 4.9,
    date: "",
    image: "/images/resize-gallery2.jpg",
    description:
      "Energy healing sessions to release blockages and restore peace to mind, body, and soul.",
    traits: ["Healing", "Energy", "Peace", "Balance"],
    element: "",
    planet: "",
    symbol: "",
    luckyColor: "",
    luckyNumber: 0,
    compatibility: [],
    benefits: [
      "Release emotional blockages",
      "Restore harmony",
      "Enhance spiritual well-being",
    ],
    readingIncludes: [
      "Hands-on or distance Reiki",
      "Energy balancing",
      "Spiritual alignment",
    ],
    strengths: ["Calmness", "Healing", "Focus"],
    challenges: ["Emotional fatigue", "Resistance"],
    order: 7,
    isActive: true,
  },
];

export const DEFAULT_EXPERT_GUIDES: ExpertGuide[] = [
  {
    _id: "1",
    name: "Dr. Amarpreet Osheen Kaur",
    image: "/assets/expert-1.jpg",
    rating: 4.8,
    reviews: 892,
    satisfactionRate: 92,
    expertise:
      "Expert in numerology and KP astrology system with 15+ years of experience. Specializing in accurate predictions and practical solutions for life challenges.",
    experience: "15+ years",
    languages: ["Hindi", "Tamil", "English", "Telugu"],
    expertiseAreas: [
      "Marriage Compatibility",
      "Business Growth",
      "Health Issues",
      "Legal Matters",
      "Name Correction",
      "Lucky Number Guidance",
    ],
    isVerified: true,
    stats: {
      professionalExperience: "15+ years",
      satisfiedClients: "4200+",
    },
    order: 1,
    isActive: true,
  },
];

// ==================== PUBLIC API FUNCTIONS ====================

/**
 * Get complete home page data for website
 */
export const getHomeData = async (): Promise<ApiResponse<HomeData>> => {
  console.log("🏠 Fetching public home data");
  return fetchData<ApiResponse<HomeData>>("/home");
};

/**
 * Admin API - Get all home data (auth required)
 */
export const getAllHomeData = async (): Promise<ApiResponse<HomeData>> => {
  console.log("🔐 Fetching all home data (admin)");
  return fetchData<ApiResponse<HomeData>>("/admin/all");
};

// ==================== DISCOVER SECTION ====================

export const updateDiscoverSection = (
  data: Partial<DiscoverSection>,
): Promise<ApiResponse<DiscoverSection>> => {
  console.log("🔄 Updating discover section:", data);
  return putData<ApiResponse<DiscoverSection>>("/admin/discover", data);
};

export const uploadDiscoverImage = async (
  file: File,
  type: "osheenMaa" | "osheenOracle",
): Promise<ApiResponse<{ imageUrl: string }>> => {
  console.log("📤 Uploading discover image for:", type);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/discover/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

// ==================== DISCOVER YOUR PATH ====================

export const addDiscoverPath = (
  data: Omit<DiscoverPath, "_id">,
): Promise<ApiResponse<DiscoverPath[]>> => {
  console.log("➕ Adding discover path:", data);
  return postData<ApiResponse<DiscoverPath[]>>("/admin/discover-path", data);
};

export const updateDiscoverPath = (
  id: string,
  data: Partial<DiscoverPath>,
): Promise<ApiResponse<DiscoverPath>> => {
  console.log("✏️ Updating discover path:", id, data);
  return putData<ApiResponse<DiscoverPath>>(`/admin/discover-path/${id}`, data);
};

export const deleteDiscoverPath = (
  id: string,
): Promise<ApiResponse<DiscoverPath[]>> => {
  console.log("🗑️ Deleting discover path:", id);
  return deleteData<ApiResponse<DiscoverPath[]>>(`/admin/discover-path/${id}`);
};

export const uploadDiscoverPathImage = async (
  id: string,
  file: File,
): Promise<ApiResponse<{ imageUrl: string }>> => {
  console.log("📤 Uploading discover path image for:", id);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("id", id);

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/discover-path/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

// ==================== ACHIEVEMENTS ====================

export const updateAchievements = (
  data: Partial<AchievementsSection>,
): Promise<ApiResponse<AchievementsSection>> => {
  console.log("🏆 Updating achievements:", data);
  return putData<ApiResponse<AchievementsSection>>("/admin/achievements", data);
};

export const addAchievementImage = async (
  file: File,
  caption: string,
): Promise<ApiResponse<AchievementImage[]>> => {
  console.log("📸 Adding achievement image");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("caption", caption);

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/achievements/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

export const deleteAchievementImage = (
  imageId: string,
): Promise<ApiResponse<AchievementImage[]>> => {
  console.log("🗑️ Deleting achievement image:", imageId);
  return deleteData<ApiResponse<AchievementImage[]>>(
    `/admin/achievements/image/${imageId}`,
  );
};

// ==================== MEDIA SPOTLIGHT ====================

export const addMediaSpotlight = async (
  file: File,
  data: { title: string; logo?: string; link?: string; order?: number },
): Promise<ApiResponse<MediaSpotlight[]>> => {
  console.log("📺 Adding media spotlight:", data);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", data.title);
  if (data.logo) formData.append("logo", data.logo);
  if (data.link) formData.append("link", data.link);
  if (data.order !== undefined) formData.append("order", String(data.order));

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/media-spotlight`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

export const updateMediaSpotlight = (
  id: string,
  data: Partial<MediaSpotlight>,
): Promise<ApiResponse<MediaSpotlight>> => {
  console.log("✏️ Updating media spotlight:", id, data);
  return putData<ApiResponse<MediaSpotlight>>(
    `/admin/media-spotlight/${id}`,
    data,
  );
};

export const deleteMediaSpotlight = (
  id: string,
): Promise<ApiResponse<MediaSpotlight[]>> => {
  console.log("🗑️ Deleting media spotlight:", id);
  return deleteData<ApiResponse<MediaSpotlight[]>>(
    `/admin/media-spotlight/${id}`,
  );
};

// ==================== CATALOGUE (Updated for New Backend Schema) ====================

/**
 * Add catalogue item - Transform frontend form data to backend format
 */
export const addCatalogue = async (
  data: any,
): Promise<ApiResponse<Catalogue>> => {
  console.log("📚 Adding catalogue - transforming data:", data);

  // Transform frontend form data to backend schema format
  const transformedData: Partial<CatalogueItem> = {
    name: data.name || data.title || "",
    price: data.price || "0",
    rating: data.rating || 4.5,
    image: data.image || "",
    description: data.description || "",
    traits:
      data.traits || data.details?.keyTraits?.map((t: any) => t.trait).filter(Boolean) || [],
    benefits:
      data.benefits || data.details?.benefits?.map((b: any) => b.benefit).filter(Boolean) || [],
    readingIncludes: data.readingIncludes || [],
    strengths: data.strengths || [],
    challenges: data.challenges || [],
    element: data.element || "",
    planet: data.planet || "",
    symbol: data.symbol || "",
    luckyColor: data.luckyColor || "",
    luckyNumber: data.luckyNumber || 0,
    compatibility: data.compatibility || [],
    order: data.order || 0,
    isActive: data.isActive !== false,
    id: Date.now(), // Generate unique ID
  };

  console.log("📤 Sending transformed catalogue data:", transformedData);
  return postData<ApiResponse<Catalogue>>("/admin/catalogue", transformedData);
};

/**
 * Update catalogue item
 */
export const updateCatalogue = async (
  id: string,
  data: any,
): Promise<ApiResponse<CatalogueItem>> => {
  console.log("✏️ Updating catalogue:", id, data);

  // Transform frontend form data to backend schema format
  const transformedData: Partial<CatalogueItem> = {
    name: data.name || data.title,
    price: data.price,
    rating: data.rating,
    image: data.image,
    description: data.description,
    traits: data.traits || data.details?.keyTraits?.map((t: any) => t.trait),
    benefits:
      data.benefits || data.details?.benefits?.map((b: any) => b.benefit),
    readingIncludes: data.readingIncludes,
    strengths: data.strengths,
    challenges: data.challenges,
    element: data.element,
    planet: data.planet,
    symbol: data.symbol,
    luckyColor: data.luckyColor,
    luckyNumber: data.luckyNumber,
    compatibility: data.compatibility,
    order: data.order,
    isActive: data.isActive,
  };

  return putData<ApiResponse<CatalogueItem>>(
    `/admin/catalogue/${id}`,
    transformedData,
  );
};

/**
 * Delete catalogue item
 */
export const deleteCatalogue = (
  id: string,
): Promise<ApiResponse<Catalogue[]>> => {
  console.log("🗑️ Deleting catalogue:", id);
  return deleteData<ApiResponse<Catalogue[]>>(`/admin/catalogue/${id}`);
};

/**
 * Upload catalogue image
 */
export const uploadCatalogueImage = async (
  id: string,
  file: File,
): Promise<ApiResponse<{ imageUrl: string }>> => {
  console.log("📤 Uploading catalogue image for:", id);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("id", id);

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/catalogue/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

// ==================== EXPERT GUIDES ====================

export const addExpertGuide = (
  data: Omit<ExpertGuide, "_id">,
): Promise<ApiResponse<ExpertGuide[]>> => {
  console.log("👤 Adding expert guide:", data);
  return postData<ApiResponse<ExpertGuide[]>>("/admin/expert-guides", data);
};

export const updateExpertGuide = (
  id: string,
  data: Partial<ExpertGuide>,
): Promise<ApiResponse<ExpertGuide>> => {
  console.log("✏️ Updating expert guide:", id, data);
  return putData<ApiResponse<ExpertGuide>>(`/admin/expert-guides/${id}`, data);
};

export const deleteExpertGuide = (
  id: string,
): Promise<ApiResponse<ExpertGuide[]>> => {
  console.log("🗑️ Deleting expert guide:", id);
  return deleteData<ApiResponse<ExpertGuide[]>>(`/admin/expert-guides/${id}`);
};

export const uploadExpertGuideImage = async (
  id: string,
  file: File,
): Promise<ApiResponse<{ imageUrl: string }>> => {
  console.log("📤 Uploading expert guide image for:", id);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("id", id);

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/admin/expert-guides/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  return await response.json();
};

// ==================== GET FUNCTIONS (For Website) ====================

/**
 * Get catalogue items only (for website)
 */
export const getCatalogue = async (): Promise<Catalogue> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.catalogue.filter((item) => item.isActive);
    }
    return DEFAULT_CATALOGUE;
  } catch (error) {
    console.error("Error fetching catalogue, using default:", error);
    return DEFAULT_CATALOGUE;
  }
};

/**
 * Get single catalogue item by ID
 */
export const getCatalogueById = async (
  id: string,
): Promise<CatalogueItem | null> => {
  try {
    const catalogue = await getCatalogue();
    const item = catalogue.find(
      (item) => String(item.id) === id || item._id === id,
    );
    return item || null;
  } catch (error) {
    console.error(`Error fetching catalogue item ${id}:`, error);
    const defaultItem = DEFAULT_CATALOGUE.find(
      (item) => String(item.id) === id || item._id === id,
    );
    return defaultItem || null;
  }
};

/**
 * Get expert guides only (for website)
 */
export const getExpertGuides = async (): Promise<ExpertGuide[]> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.expertGuides.filter((guide) => guide.isActive);
    }
    return DEFAULT_EXPERT_GUIDES;
  } catch (error) {
    console.error("Error fetching expert guides, using default:", error);
    return DEFAULT_EXPERT_GUIDES;
  }
};

/**
 * Get expert guide by ID
 */
export const getExpertGuideById = async (
  id: string,
): Promise<ExpertGuide | null> => {
  try {
    const guides = await getExpertGuides();
    const guide = guides.find((item) => item._id === id);
    return guide || null;
  } catch (error) {
    console.error(`Error fetching expert guide ${id}:`, error);
    const defaultGuide = DEFAULT_EXPERT_GUIDES.find((item) => item._id === id);
    return defaultGuide || null;
  }
};

/**
 * Get discover your path items (for website)
 */
export const getDiscoverYourPath = async (): Promise<DiscoverPath[]> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.discoverYourPath.filter((item) => item.isActive);
    }
    return DEFAULT_DISCOVER_PATHS;
  } catch (error) {
    console.error("Error fetching discover your path, using default:", error);
    return DEFAULT_DISCOVER_PATHS;
  }
};

/**
 * Get achievements section (for website)
 */
export const getAchievements = async (): Promise<AchievementsSection> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.achievements;
    }
    return DEFAULT_ACHIEVEMENTS;
  } catch (error) {
    console.error("Error fetching achievements, using default:", error);
    return DEFAULT_ACHIEVEMENTS;
  }
};

/**
 * Get media spotlight items (for website)
 */
export const getMediaSpotlight = async (): Promise<MediaSpotlight[]> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.mediaSpotlight.filter((item) => item.isActive);
    }
    return DEFAULT_MEDIA_SPOTLIGHT;
  } catch (error) {
    console.error("Error fetching media spotlight, using default:", error);
    return DEFAULT_MEDIA_SPOTLIGHT;
  }
};

/**
 * Get discover section (for website)
 */
export const getDiscoverSection = async (): Promise<DiscoverSection> => {
  try {
    const response = await getHomeData();
    if (response.success && response.data) {
      return response.data.discoverSection;
    }
    return DEFAULT_DISCOVER_SECTION;
  } catch (error) {
    console.error("Error fetching discover section, using default:", error);
    return DEFAULT_DISCOVER_SECTION;
  }
};

// ==================== HELPER FUNCTIONS ====================

export const formatPrice = (price: string | number): string => {
  const numericPrice = typeof price === "string" ? parseInt(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

export const getStarRating = (
  rating: number,
): { filled: number; half: boolean; empty: number } => {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);
  return { filled, half, empty };
};

// ==================== EXPORT ALL ====================

const homeAPI = {
  // Public
  getHomeData,
  getAllHomeData,

  // Discover Section
  updateDiscoverSection,
  uploadDiscoverImage,

  // Discover Your Path
  addDiscoverPath,
  updateDiscoverPath,
  deleteDiscoverPath,
  uploadDiscoverPathImage,

  // Achievements
  updateAchievements,
  addAchievementImage,
  deleteAchievementImage,

  // Media Spotlight
  addMediaSpotlight,
  updateMediaSpotlight,
  deleteMediaSpotlight,

  // Catalogue (Updated)
  addCatalogue,
  updateCatalogue,
  deleteCatalogue,
  uploadCatalogueImage,
  getCatalogue,
  getCatalogueById,

  // Expert Guides
  addExpertGuide,
  updateExpertGuide,
  deleteExpertGuide,
  uploadExpertGuideImage,
  getExpertGuides,
  getExpertGuideById,

  // Get Functions for Website
  getDiscoverYourPath,
  getAchievements,
  getMediaSpotlight,
  getDiscoverSection,

  // Helper Functions
  formatPrice,
  getStarRating,

  // Default Data
  DEFAULT_CATALOGUE,
  DEFAULT_EXPERT_GUIDES,
};

export default homeAPI;
