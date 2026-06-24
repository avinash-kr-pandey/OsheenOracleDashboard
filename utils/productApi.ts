// utils/productApi.ts
import { fetchData, postData, putData, deleteData, postFormData } from "./api";

// Types
export interface SizePrice {
  size: string;
  price: number;
  originalPrice: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  category: string;
  inStock: boolean;
  hasColorOptions: boolean;
  colors: string[];
  sizeOptions: string[];
  discount: string;
  gender?: string;
  sizePrices?: SizePrice[];
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Review {
  admin: string;
  name?: string;
  rating: number;
  comment: string;
  createdAt: string;
  _id: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  category: string;
  inStock: boolean;
  hasColorOptions: boolean;
  colors: string[];
  sizeOptions: string[];
  discount?: string;
  gender?: string;
  sizePrices?: SizePrice[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: {
    url: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    type: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  count: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// Error type
interface ApiError {
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

/* =======================
   FILE UPLOAD API
======================= */

export const uploadProductImage = async (
  file: File,
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await postFormData<UploadResponse>(
      "/uploads/file-upload",
      formData,
    );

    if (response.success && response.file?.url) {
      return response.file.url;
    }

    return null;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

/* =======================
   PUBLIC PRODUCT APIs
======================= */

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchData<ProductsResponse>("/products");

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetchData<ProductResponse>(`/products/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

/* =======================
   ADMIN APIs
======================= */

export const createProduct = async (
  productData: ProductPayload,
): Promise<Product | null> => {
  try {
    const response = await postData<ProductResponse>("/products", productData);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error creating product:", apiError);
    throw new Error(apiError.message || "Failed to create product");
  }
};

export const updateProduct = async (
  id: string,
  productData: ProductPayload,
): Promise<Product | null> => {
  try {
    const response = await putData<ProductResponse>(
      `/products/${id}`,
      productData,
    );

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error updating product ${id}:`, apiError);
    throw new Error(apiError.message || "Failed to update product");
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await deleteData<DeleteResponse>(`/products/${id}`);

    if (response.success) {
      return true;
    }

    return false;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error deleting product ${id}:`, apiError);
    return false;
  }
};

export const addProductReview = async (
  productId: string,
  reviewData: { name: string; rating: number; comment: string }
): Promise<any> => {
  try {
    const response = await postData<any>(`/products/${productId}/reviews`, reviewData);
    return response;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

const productAPI = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  addProductReview,
};

export default productAPI;
