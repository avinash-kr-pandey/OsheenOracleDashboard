import {
  fetchData,
  postData,
  putData,
  patchData,
  deleteData,
  uploadFile as apiUploadFile,
} from "./api";

// ==================== TYPES ====================

export interface Subcategory {
  _id?: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
  subcategories: Subcategory[];
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface ServiceRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: Category | string;
  categoryName: string;
  subcategory: Subcategory;
  subcategoryName: string;
  price: number;
  communicationMode: "voice_call" | "video_call" | "voice_note";
  description: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  preferredDate?: string;
  preferredTimeSlot?: string;
  adminNotes?: string;
  isGuest: boolean;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  activeCategories: number;
  totalSubcategories: number;
  categoryDistribution: Array<{
    _id: string;
    count: number;
  }>;
  subcategoryDistribution: Array<{
    _id: string;
    count: number;
  }>;
  recentRequests: ServiceRequest[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
}

// ==================== FILE UPLOAD ====================

// ✅ Re-export uploadFile from api.ts
export const uploadFile = apiUploadFile;

// ==================== CATEGORY API ====================

export const categoryAPI = {
  getAllCategories: (params?: { isActive?: boolean }) => {
    return fetchData<ApiResponse<Category[]>>("/services/categories", params);
  },

  getCategoryById: (id: string) => {
    return fetchData<ApiResponse<Category>>(`/services/categories/${id}`);
  },

  createCategory: (data: Partial<Category>) => {
    return postData<ApiResponse<Category>>("/services/categories", data);
  },

  updateCategory: (id: string, data: Partial<Category>) => {
    return putData<ApiResponse<Category>>(`/services/categories/${id}`, data);
  },

  deleteCategory: (id: string) => {
    return deleteData<ApiResponse<null>>(`/services/categories/${id}`);
  },

  toggleCategoryStatus: (id: string) => {
    return patchData<ApiResponse<Category>>(
      `/services/categories/${id}/toggle`,
      {},
    );
  },
};

// ==================== SUBCATEGORY API ====================

export const subcategoryAPI = {
  addSubcategory: (categoryId: string, data: Partial<Subcategory>) => {
    return postData<ApiResponse<Category>>(
      `/services/categories/${categoryId}/subcategories`,
      data,
    );
  },

  updateSubcategory: (
    categoryId: string,
    subcategoryId: string,
    data: Partial<Subcategory>,
  ) => {
    return putData<ApiResponse<Category>>(
      `/services/categories/${categoryId}/subcategories/${subcategoryId}`,
      data,
    );
  },

  deleteSubcategory: (categoryId: string, subcategoryId: string) => {
    return deleteData<ApiResponse<null>>(
      `/services/categories/${categoryId}/subcategories/${subcategoryId}`,
    );
  },

  toggleSubcategoryStatus: (categoryId: string, subcategoryId: string) => {
    return patchData<ApiResponse<Category>>(
      `/services/categories/${categoryId}/subcategories/${subcategoryId}/toggle`,
      {},
    );
  },
};

// ==================== SERVICE REQUEST API ====================

export const serviceRequestAPI = {
  submitRequest: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    categoryId: string;
    subcategoryId: string;
    communicationMode: string;
    description: string;
    preferredDate?: string;
    preferredTimeSlot?: string;
  }) => {
    return postData<ApiResponse<ServiceRequest>>("/services/requests", data);
  },

  getAllRequests: (params?: { status?: string }) => {
    return fetchData<ApiResponse<ServiceRequest[]>>(
      "/services/requests",
      params,
    );
  },

  getRequestById: (id: string) => {
    return fetchData<ApiResponse<ServiceRequest>>(`/services/requests/${id}`);
  },

  updateRequestStatus: (id: string, status: string, adminNotes?: string) => {
    return patchData<ApiResponse<ServiceRequest>>(
      `/services/requests/${id}/status`,
      {
        status,
        adminNotes,
      },
    );
  },

  deleteRequest: (id: string) => {
    return deleteData<ApiResponse<null>>(`/services/requests/${id}`);
  },

  getDashboardStats: () => {
    return fetchData<ApiResponse<DashboardStats>>("/services/admin/stats");
  },
};

// ==================== HELPER FUNCTIONS ====================

export const getActiveServices = async () => {
  try {
    const response = await categoryAPI.getAllCategories({ isActive: true });
    if (response.success && response.data) {
      const categoriesWithActiveSubs = response.data.map((category) => ({
        ...category,
        subcategories: category.subcategories.filter((sub) => sub.isActive),
      }));
      return categoriesWithActiveSubs.filter(
        (cat) => cat.subcategories.length > 0,
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching active services:", error);
    return [];
  }
};

export const getAllSubcategoriesFlattened = async () => {
  try {
    const response = await categoryAPI.getAllCategories({ isActive: true });
    if (response.success && response.data) {
      const flattened: Array<{
        _id: string;
        name: string;
        description: string;
        price: number;
        duration: string;
        categoryId: string;
        categoryName: string;
        isActive: boolean;
      }> = [];

      response.data.forEach((category) => {
        category.subcategories.forEach((subcategory) => {
          flattened.push({
            _id: subcategory._id || "",
            name: subcategory.name,
            description: subcategory.description,
            price: subcategory.price,
            duration: subcategory.duration,
            categoryId: category._id,
            categoryName: category.name,
            isActive: subcategory.isActive && category.isActive,
          });
        });
      });

      return flattened;
    }
    return [];
  } catch (error) {
    console.error("Error fetching flattened subcategories:", error);
    return [];
  }
};

export const getSubcategoriesByCategory = async (categoryId: string) => {
  try {
    const response = await categoryAPI.getCategoryById(categoryId);
    if (response.success && response.data) {
      return response.data.subcategories.filter((sub) => sub.isActive);
    }
    return [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
};

export const getServiceDetails = async (
  categoryId: string,
  subcategoryId: string,
) => {
  try {
    const response = await categoryAPI.getCategoryById(categoryId);
    if (response.success && response.data) {
      const subcategory = response.data.subcategories.find(
        (sub) => sub._id === subcategoryId,
      );
      if (subcategory) {
        return {
          category: response.data,
          subcategory: subcategory,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching service details:", error);
    return null;
  }
};
