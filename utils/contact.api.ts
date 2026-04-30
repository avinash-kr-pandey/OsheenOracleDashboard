import api, { fetchData, putData, patchData, deleteData } from "./api";

export interface Astrologer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  avatar?: string;
}

export interface ContactConsultation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  desiredDate: string;
  desiredTime: string;
  additionalMessage?: string;
  preferredAstrologer?: string;
  astrologerSpecialization?: string;
  assignedAstrologer?: Astrologer;
  consultationType: "chat" | "call" | "video" | "in_person";
  consultationDuration: number;
  userId?: string;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rescheduled";
  adminNotes?: string;
  astrologerNotes?: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentAmount?: number;
  transactionId?: string;
  meetingLink?: string;
  callScheduledTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  inProgress: number;
  todaysConsultations: number;
  monthlyConsultations: number;
  totalRevenue: number;
  statusDistribution: Array<{ _id: string; count: number }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetAllConsultationsParams {
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get all consultations (Admin only)
export const getAllConsultations = async (
  params?: GetAllConsultationsParams,
): Promise<ApiResponse<ContactConsultation[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.search) queryParams.append("search", params.search);

  const endpoint = `/contact${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response =
    await fetchData<ApiResponse<ContactConsultation[]>>(endpoint);
  return response;
};

// Update consultation status
export const updateConsultationStatus = async (
  id: string,
  status: string,
): Promise<ApiResponse<ContactConsultation>> => {
  const response = await patchData<ApiResponse<ContactConsultation>>(
    `/contact/${id}/status`,
    { status },
  );
  return response;
};

// Delete consultation
export const deleteConsultation = async (id: string): Promise<ApiResponse> => {
  const response = await deleteData<ApiResponse>(`/contact/${id}`);
  return response;
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<
  ApiResponse<DashboardStats>
> => {
  const response = await fetchData<ApiResponse<DashboardStats>>(
    "/contact/stats/dashboard",
  );
  return response;
};
