import {
  fetchData,
  postData,
  putData,
  patchData,
  deleteData,
} from "../utils/api";

// ==================== TYPES ====================

export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  icon: string;
  category: string;
  image: string;
  order: number;
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
  service: Service | string;
  serviceName: string;
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
  serviceDistribution: Array<{
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

// ==================== SERVICE API ====================

export const serviceAPI = {
  getAllServices: (params?: { isActive?: boolean; category?: string }) => {
    return fetchData<ApiResponse<Service[]>>("/services", params);
  },

  getServiceById: (id: string) => {
    return fetchData<ApiResponse<Service>>(`/services/${id}`);
  },

  createService: (data: Partial<Service>) => {
    return postData<ApiResponse<Service>>("/services", data);
  },

  updateService: (id: string, data: Partial<Service>) => {
    return putData<ApiResponse<Service>>(`/services/${id}`, data);
  },

  deleteService: (id: string) => {
    return deleteData<ApiResponse<null>>(`/services/${id}`);
  },

  toggleServiceStatus: (id: string) => {
    return patchData<ApiResponse<Service>>(`/services/${id}/toggle`, {});
  },
};

// ==================== SERVICE REQUEST API ====================

export const serviceRequestAPI = {
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
