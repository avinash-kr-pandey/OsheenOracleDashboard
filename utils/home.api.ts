// services/home.api.ts
import { fetchData, postData, putData, deleteData } from "../utils/api";

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

export interface CatalogueDetails {
  bookYourReading: {
    title: string;
    description: string;
    price: number;
    duration: string;
    buttonText: string;
  };
  keyTraits: Array<{ trait: string; description: string }>;
  benefits: Array<{ benefit: string; description: string }>;
  completePackage: {
    title: string;
    includes: string[];
    price: number;
    discountPrice: number;
  };
}

export interface Catalogue {
  _id?: string;
  title: string;
  image: string;
  description: string;
  details: CatalogueDetails;
  order: number;
  isActive: boolean;
}

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
  catalogue: Catalogue[];
  expertGuides: ExpertGuide[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Public API - Get home page data (no auth required)
 * GET /api/home
 */
export const getHomeData = (): Promise<ApiResponse<HomeData>> => {
  console.log("🏠 Fetching public home data");
  return fetchData<ApiResponse<HomeData>>("/home");
};

/**
 * Admin API - Get all home data (auth required)
 * GET /api/admin/all
 */
export const getAllHomeData = (): Promise<ApiResponse<HomeData>> => {
  console.log("🔐 Fetching all home data (admin)");
  return fetchData<ApiResponse<HomeData>>("/admin/all");
};

// ==================== DISCOVER SECTION ====================

/**
 * Update discover section (Osheen MAA & Osheen Oracle)
 * PUT /api/admin/discover
 * @param data - Partial discover section data
 */
export const updateDiscoverSection = (
  data: Partial<DiscoverSection>,
): Promise<ApiResponse<DiscoverSection>> => {
  console.log("🔄 Updating discover section:", data);
  return putData<ApiResponse<DiscoverSection>>("/admin/discover", data);
};

/**
 * Upload image for discover section
 * POST /api/admin/discover/image
 * @param file - Image file
 * @param type - 'osheenMaa' or 'osheenOracle'
 */
export const uploadDiscoverImage = async (
  file: File,
  type: "osheenMaa" | "osheenOracle",
): Promise<ApiResponse<{ imageUrl: string }>> => {
  console.log("📤 Uploading discover image for:", type);

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);

  // Use fetch directly for FormData (axios with custom config)
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/discover/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data;
};

// ==================== DISCOVER YOUR PATH ====================

/**
 * Add new discover path item
 * POST /api/admin/discover-path
 * @param data - Discover path data
 */
export const addDiscoverPath = (
  data: Omit<DiscoverPath, "_id">,
): Promise<ApiResponse<DiscoverPath[]>> => {
  console.log("➕ Adding discover path:", data);
  return postData<ApiResponse<DiscoverPath[]>>("/admin/discover-path", data);
};

/**
 * Update discover path item
 * PUT /api/admin/discover-path/:id
 * @param id - Discover path ID
 * @param data - Partial discover path data
 */
export const updateDiscoverPath = (
  id: string,
  data: Partial<DiscoverPath>,
): Promise<ApiResponse<DiscoverPath>> => {
  console.log("✏️ Updating discover path:", id, data);
  return putData<ApiResponse<DiscoverPath>>(`/admin/discover-path/${id}`, data);
};

/**
 * Delete discover path item
 * DELETE /api/admin/discover-path/:id
 * @param id - Discover path ID
 */
export const deleteDiscoverPath = (
  id: string,
): Promise<ApiResponse<DiscoverPath[]>> => {
  console.log("🗑️ Deleting discover path:", id);
  return deleteData<ApiResponse<DiscoverPath[]>>(`/admin/discover-path/${id}`);
};

/**
 * Upload image for discover path
 * POST /api/admin/discover-path/image
 * @param id - Discover path ID
 * @param file - Image file
 */
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
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/discover-path/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data;
};

// ==================== ACHIEVEMENTS ====================

/**
 * Update achievements section
 * PUT /api/admin/achievements
 * @param data - Partial achievements data
 */
export const updateAchievements = (
  data: Partial<AchievementsSection>,
): Promise<ApiResponse<AchievementsSection>> => {
  console.log("🏆 Updating achievements:", data);
  return putData<ApiResponse<AchievementsSection>>("/admin/achievements", data);
};

/**
 * Add achievement image
 * POST /api/admin/achievements/image
 * @param file - Image file
 * @param caption - Image caption
 */
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
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/achievements/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data;
};

/**
 * Delete achievement image
 * DELETE /api/admin/achievements/image/:imageId
 * @param imageId - Achievement image ID
 */
export const deleteAchievementImage = (
  imageId: string,
): Promise<ApiResponse<AchievementImage[]>> => {
  console.log("🗑️ Deleting achievement image:", imageId);
  return deleteData<ApiResponse<AchievementImage[]>>(
    `/admin/achievements/image/${imageId}`,
  );
};

// ==================== MEDIA SPOTLIGHT ====================

/**
 * Add media spotlight item
 * POST /api/admin/media-spotlight
 * @param file - Image file
 * @param data - Media spotlight data
 */
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
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/media-spotlight`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const result = await response.json();
  return result;
};

/**
 * Update media spotlight item
 * PUT /api/admin/media-spotlight/:id
 * @param id - Media spotlight ID
 * @param data - Partial media spotlight data
 */
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

/**
 * Delete media spotlight item
 * DELETE /api/admin/media-spotlight/:id
 * @param id - Media spotlight ID
 */
export const deleteMediaSpotlight = (
  id: string,
): Promise<ApiResponse<MediaSpotlight[]>> => {
  console.log("🗑️ Deleting media spotlight:", id);
  return deleteData<ApiResponse<MediaSpotlight[]>>(
    `/admin/media-spotlight/${id}`,
  );
};

// ==================== CATALOGUE ====================

/**
 * Add catalogue item
 * POST /api/admin/catalogue
 * @param data - Catalogue data
 */
export const addCatalogue = (
  data: Omit<Catalogue, "_id">,
): Promise<ApiResponse<Catalogue[]>> => {
  console.log("📚 Adding catalogue:", data);
  return postData<ApiResponse<Catalogue[]>>("/admin/catalogue", data);
};

/**
 * Update catalogue item
 * PUT /api/admin/catalogue/:id
 * @param id - Catalogue ID
 * @param data - Partial catalogue data
 */
export const updateCatalogue = (
  id: string,
  data: Partial<Catalogue>,
): Promise<ApiResponse<Catalogue>> => {
  console.log("✏️ Updating catalogue:", id, data);
  return putData<ApiResponse<Catalogue>>(`/admin/catalogue/${id}`, data);
};

/**
 * Delete catalogue item
 * DELETE /api/admin/catalogue/:id
 * @param id - Catalogue ID
 */
export const deleteCatalogue = (
  id: string,
): Promise<ApiResponse<Catalogue[]>> => {
  console.log("🗑️ Deleting catalogue:", id);
  return deleteData<ApiResponse<Catalogue[]>>(`/admin/catalogue/${id}`);
};

/**
 * Upload catalogue image
 * POST /api/admin/catalogue/image
 * @param id - Catalogue ID
 * @param file - Image file
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
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/catalogue/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data;
};

// ==================== EXPERT GUIDES ====================

/**
 * Add expert guide
 * POST /api/admin/expert-guides
 * @param data - Expert guide data
 */
export const addExpertGuide = (
  data: Omit<ExpertGuide, "_id">,
): Promise<ApiResponse<ExpertGuide[]>> => {
  console.log("👤 Adding expert guide:", data);
  return postData<ApiResponse<ExpertGuide[]>>("/admin/expert-guides", data);
};

/**
 * Update expert guide
 * PUT /api/admin/expert-guides/:id
 * @param id - Expert guide ID
 * @param data - Partial expert guide data
 */
export const updateExpertGuide = (
  id: string,
  data: Partial<ExpertGuide>,
): Promise<ApiResponse<ExpertGuide>> => {
  console.log("✏️ Updating expert guide:", id, data);
  return putData<ApiResponse<ExpertGuide>>(`/admin/expert-guides/${id}`, data);
};

/**
 * Delete expert guide
 * DELETE /api/admin/expert-guides/:id
 * @param id - Expert guide ID
 */
export const deleteExpertGuide = (
  id: string,
): Promise<ApiResponse<ExpertGuide[]>> => {
  console.log("🗑️ Deleting expert guide:", id);
  return deleteData<ApiResponse<ExpertGuide[]>>(`/admin/expert-guides/${id}`);
};

/**
 * Upload expert guide image
 * POST /api/admin/expert-guides/image
 * @param id - Expert guide ID
 * @param file - Image file
 */
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
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/expert-guides/image`,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();
  return data;
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

  // Catalogue
  addCatalogue,
  updateCatalogue,
  deleteCatalogue,
  uploadCatalogueImage,

  // Expert Guides
  addExpertGuide,
  updateExpertGuide,
  deleteExpertGuide,
  uploadExpertGuideImage,
};

export default homeAPI;
