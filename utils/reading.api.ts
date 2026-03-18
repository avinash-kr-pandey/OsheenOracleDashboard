// utils/reading.api.ts
import { fetchData, postData, putData, deleteData } from "./api";

// ==================== Reading Service Types (based on backend) ====================
export interface ReadingService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingServiceResponse {
  success: boolean;
  count?: number;
  data?: ReadingService | ReadingService[];
  message?: string;
}

export interface CreateReadingServiceData {
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image?: string;
  isActive?: boolean;
}

// ==================== Reading Package Types (based on backend) ====================
export interface ReadingPackage {
  _id: string;
  id: number;
  name: string;
  price: string;
  duration: string;
  features: string[];
  bestFor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingPackageResponse {
  message?: string;
  data?: ReadingPackage;
  // For getAll response (direct array as per your backend)
  [key: number]: ReadingPackage;
  length?: number;
}

export interface CreateReadingPackageData {
  id: number;
  name: string;
  price: string;
  duration: string;
  features: string[];
  bestFor: string;
}

// ==================== API Functions ====================
export const readingAPI = {
  // ----- Reading Services (as per your readingServiceController.js) -----
  createService: (
    serviceData: CreateReadingServiceData,
  ): Promise<ReadingServiceResponse> => {
    return postData<ReadingServiceResponse>("/reading-services", serviceData);
  },

  getAllServices: (): Promise<ReadingServiceResponse> => {
    return fetchData<ReadingServiceResponse>("/reading-services");
  },

  getServiceById: (id: string): Promise<ReadingServiceResponse> => {
    return fetchData<ReadingServiceResponse>(`/reading-services/${id}`);
  },

  updateService: (
    id: string,
    serviceData: Partial<CreateReadingServiceData>,
  ): Promise<ReadingServiceResponse> => {
    return putData<ReadingServiceResponse>(
      `/reading-services/${id}`,
      serviceData,
    );
  },

  deleteService: (id: string): Promise<ReadingServiceResponse> => {
    return deleteData<ReadingServiceResponse>(`/reading-services/${id}`);
  },

  // ----- Reading Packages (as per your readingPackageControllers.js) -----
  createPackage: (
    packageData: CreateReadingPackageData,
  ): Promise<ReadingPackage> => {
    return postData<ReadingPackage>("/reading-packages", packageData);
  },

  getAllPackages: (): Promise<ReadingPackage[]> => {
    return fetchData<ReadingPackage[]>("/reading-packages");
  },

  getPackageById: (id: number): Promise<ReadingPackage> => {
    return fetchData<ReadingPackage>(`/reading-packages/${id}`);
  },

  updatePackage: (
    id: number,
    packageData: Partial<CreateReadingPackageData>,
  ): Promise<ReadingPackage> => {
    return putData<ReadingPackage>(`/reading-packages/${id}`, packageData);
  },

  deletePackage: (id: number): Promise<{ message: string }> => {
    return deleteData<{ message: string }>(`/reading-packages/${id}`);
  },
};
