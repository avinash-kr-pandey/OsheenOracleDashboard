// src/utils/api/becomeamember.api.ts

import { fetchData, postData, putData, deleteData } from "./api";

// ==================== TYPES ====================

export interface MembershipFormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  plan: string;
  newsletter: boolean;
}

export interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  countryCode: string;
  plan: string;
  newsletter: boolean;
  status: "pending" | "contacted" | "active" | "cancelled" | "inactive";
  notes?: string;
  contactHistory: Array<{
    _id: string;
    date: string;
    type: "email" | "whatsapp" | "call" | "other";
    notes: string;
    contactedBy: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  lastContacted?: string;
  createdAt: string;
  updatedAt: string;
  fullPhoneNumber?: string;
}

export interface MembershipPlan {
  _id: string;
  id: string;
  name: string;
  price: string;
  period: "month" | "quarter" | "year";
  features: string[];
  popular: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  _id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  avatar: string;
  content: string;
  name: string;
  role: string;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddOn {
  _id: string;
  service: string;
  price: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stat {
  _id: string;
  number: string;
  label: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: {
    total: number;
    pending: number;
    active: number;
    cancelled: number;
  };
}

export interface ContentData {
  membershipPlans: MembershipPlan[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  addOns: AddOn[];
  stats: Stat[];
}

export interface ContactHistoryData {
  type: "email" | "whatsapp" | "call" | "other";
  notes: string;
}

export interface StatusUpdateData {
  status: "pending" | "contacted" | "active" | "cancelled" | "inactive";
  notes?: string;
}

export interface BulkUpdateData {
  ids: string[];
  status: "pending" | "contacted" | "active" | "cancelled";
}

// ==================== API FUNCTIONS ====================

export const membershipAdminApi = {
  // ==================== APPLICATIONS ====================
  getAllApplications: async (params?: {
    status?: string;
    plan?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<MembershipApplication[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.plan) queryParams.append("plan", params.plan);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const endpoint = `/becomeamember/admin/applications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await fetchData<ApiResponse<MembershipApplication[]>>(endpoint);
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  },

  getApplicationById: async (
    id: string,
  ): Promise<ApiResponse<MembershipApplication>> => {
    try {
      return await fetchData<ApiResponse<MembershipApplication>>(
        `/becomeamember/admin/applications/${id}`,
      );
    } catch (error) {
      console.error("Error fetching application:", error);
      throw error;
    }
  },

  updateApplicationStatus: async (
    id: string,
    data: StatusUpdateData,
  ): Promise<ApiResponse<{ id: string; status: string; notes?: string }>> => {
    try {
      return await putData<
        ApiResponse<{ id: string; status: string; notes?: string }>
      >(`/becomeamember/admin/applications/${id}/status`, data);
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  },

  addContactHistory: async (
    id: string,
    data: ContactHistoryData,
  ): Promise<ApiResponse<any>> => {
    try {
      return await postData<ApiResponse<any>>(
        `/becomeamember/admin/applications/${id}/contact`,
        data,
      );
    } catch (error) {
      console.error("Error adding contact history:", error);
      throw error;
    }
  },

  bulkUpdateStatus: async (
    data: BulkUpdateData,
  ): Promise<ApiResponse<{ modifiedCount: number; matchedCount: number }>> => {
    try {
      return await postData<
        ApiResponse<{ modifiedCount: number; matchedCount: number }>
      >("/becomeamember/admin/applications/bulk-update", data);
    } catch (error) {
      console.error("Error bulk updating applications:", error);
      throw error;
    }
  },

  deleteApplication: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/applications/${id}`,
      );
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  },

  exportApplications: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const endpoint = `/becomeamember/admin/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return await response.blob();
    } catch (error) {
      console.error("Error exporting applications:", error);
      throw error;
    }
  },

  // ==================== MEMBERSHIP PLANS ====================
  getAllPlans: async (): Promise<ApiResponse<MembershipPlan[]>> => {
    try {
      return await fetchData<ApiResponse<MembershipPlan[]>>(
        "/becomeamember/admin/plans",
      );
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  },

  createPlan: async (
    data: Omit<MembershipPlan, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<MembershipPlan>> => {
    try {
      return await postData<ApiResponse<MembershipPlan>>(
        "/becomeamember/admin/plans",
        data,
      );
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  },

  updatePlan: async (
    id: string,
    data: Partial<MembershipPlan>,
  ): Promise<ApiResponse<MembershipPlan>> => {
    try {
      return await putData<ApiResponse<MembershipPlan>>(
        `/becomeamember/admin/plans/${id}`,
        data,
      );
    } catch (error) {
      console.error("Error updating plan:", error);
      throw error;
    }
  },

  deletePlan: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/plans/${id}`,
      );
    } catch (error) {
      console.error("Error deleting plan:", error);
      throw error;
    }
  },

  // ==================== BENEFITS ====================
  getAllBenefits: async (): Promise<ApiResponse<Benefit[]>> => {
    try {
      return await fetchData<ApiResponse<Benefit[]>>(
        "/becomeamember/admin/benefits",
      );
    } catch (error) {
      console.error("Error fetching benefits:", error);
      throw error;
    }
  },

  createBenefit: async (
    data: Omit<Benefit, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Benefit>> => {
    try {
      return await postData<ApiResponse<Benefit>>(
        "/becomeamember/admin/benefits",
        data,
      );
    } catch (error) {
      console.error("Error creating benefit:", error);
      throw error;
    }
  },

  updateBenefit: async (
    id: string,
    data: Partial<Benefit>,
  ): Promise<ApiResponse<Benefit>> => {
    try {
      return await putData<ApiResponse<Benefit>>(
        `/becomeamember/admin/benefits/${id}`,
        data,
      );
    } catch (error) {
      console.error("Error updating benefit:", error);
      throw error;
    }
  },

  deleteBenefit: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/benefits/${id}`,
      );
    } catch (error) {
      console.error("Error deleting benefit:", error);
      throw error;
    }
  },

  // ==================== TESTIMONIALS ====================
  getAllTestimonials: async (): Promise<ApiResponse<Testimonial[]>> => {
    try {
      return await fetchData<ApiResponse<Testimonial[]>>(
        "/becomeamember/admin/testimonials",
      );
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  createTestimonial: async (
    data: Omit<Testimonial, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Testimonial>> => {
    try {
      return await postData<ApiResponse<Testimonial>>(
        "/becomeamember/admin/testimonials",
        data,
      );
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  },

  updateTestimonial: async (
    id: string,
    data: Partial<Testimonial>,
  ): Promise<ApiResponse<Testimonial>> => {
    try {
      return await putData<ApiResponse<Testimonial>>(
        `/becomeamember/admin/testimonials/${id}`,
        data,
      );
    } catch (error) {
      console.error("Error updating testimonial:", error);
      throw error;
    }
  },

  deleteTestimonial: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/testimonials/${id}`,
      );
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  },

  // ==================== ADD-ONS ====================
  getAllAddOns: async (): Promise<ApiResponse<AddOn[]>> => {
    try {
      return await fetchData<ApiResponse<AddOn[]>>(
        "/becomeamember/admin/addons",
      );
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      throw error;
    }
  },

  createAddOn: async (
    data: Omit<AddOn, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<AddOn>> => {
    try {
      return await postData<ApiResponse<AddOn>>(
        "/becomeamember/admin/addons",
        data,
      );
    } catch (error) {
      console.error("Error creating add-on:", error);
      throw error;
    }
  },

  updateAddOn: async (
    id: string,
    data: Partial<AddOn>,
  ): Promise<ApiResponse<AddOn>> => {
    try {
      return await putData<ApiResponse<AddOn>>(
        `/becomeamember/admin/addons/${id}`,
        data,
      );
    } catch (error) {
      console.error("Error updating add-on:", error);
      throw error;
    }
  },

  deleteAddOn: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/addons/${id}`,
      );
    } catch (error) {
      console.error("Error deleting add-on:", error);
      throw error;
    }
  },

  // ==================== STATS ====================
  getAllStats: async (): Promise<ApiResponse<Stat[]>> => {
    try {
      return await fetchData<ApiResponse<Stat[]>>("/becomeamember/admin/stats");
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  createStat: async (
    data: Omit<Stat, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Stat>> => {
    try {
      return await postData<ApiResponse<Stat>>(
        "/becomeamember/admin/stats",
        data,
      );
    } catch (error) {
      console.error("Error creating stat:", error);
      throw error;
    }
  },

  updateStat: async (
    id: string,
    data: Partial<Stat>,
  ): Promise<ApiResponse<Stat>> => {
    try {
      return await putData<ApiResponse<Stat>>(
        `/becomeamember/admin/stats/${id}`,
        data,
      );
    } catch (error) {
      console.error("Error updating stat:", error);
      throw error;
    }
  },

  deleteStat: async (id: string): Promise<ApiResponse<any>> => {
    try {
      return await deleteData<ApiResponse<any>>(
        `/becomeamember/admin/stats/${id}`,
      );
    } catch (error) {
      console.error("Error deleting stat:", error);
      throw error;
    }
  },

  // ==================== DASHBOARD STATS ====================
  getDashboardStats: async (): Promise<
    ApiResponse<{
      totalApplications: number;
      pendingApplications: number;
      activeSubscriptions: number;
      cancelledApplications: number;
      recentApplications: MembershipApplication[];
      plansDistribution: Array<{ plan: string; count: number }>;
    }>
  > => {
    try {
      const applications = await membershipAdminApi.getAllApplications({
        limit: 100,
      });
      if (applications.success && applications.data) {
        const stats = applications.stats;
        const recent = applications.data.slice(0, 10);

        const plansDistribution = applications.data.reduce(
          (acc, app) => {
            acc[app.plan] = (acc[app.plan] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        return {
          success: true,
          data: {
            totalApplications: stats?.total || 0,
            pendingApplications: stats?.pending || 0,
            activeSubscriptions: stats?.active || 0,
            cancelledApplications: stats?.cancelled || 0,
            recentApplications: recent,
            plansDistribution: Object.entries(plansDistribution).map(
              ([plan, count]) => ({ plan, count }),
            ),
          },
        };
      }
      throw new Error("Failed to fetch dashboard stats");
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },
};
