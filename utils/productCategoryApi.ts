// utils/productCategoryApi.ts
import { fetchData, postData, deleteData } from "./api";

export interface ProductCategory {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategoryResponse {
  success: boolean;
  data: ProductCategory;
  message?: string;
}

export interface ProductCategoriesResponse {
  success: boolean;
  data: ProductCategory[];
  count?: number;
}

export interface ProductCategoryDeleteResponse {
  success: boolean;
  message: string;
}

// Error type for API errors
interface ApiError {
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const response = await fetchData<ProductCategoriesResponse>("/product-categories");
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
};

export const createProductCategory = async (name: string): Promise<ProductCategory | null> => {
  try {
    const response = await postData<ProductCategoryResponse>("/product-categories", { name });
    if (response && response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error creating category:", apiError);
    throw new Error(
      apiError.response?.data?.message || 
      apiError.message || 
      "Failed to create category"
    );
  }
};

export const deleteProductCategory = async (id: string): Promise<boolean> => {
  try {
    const response = await deleteData<ProductCategoryDeleteResponse>(`/product-categories/${id}`);
    return !!(response && response.success);
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error deleting category ${id}:`, apiError);
    return false;
  }
};

const productCategoryApi = {
  getProductCategories,
  createProductCategory,
  deleteProductCategory,
};

export default productCategoryApi;
