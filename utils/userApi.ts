// utils/userApi.ts
import { fetchData, putData, deleteData } from "./api";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  type: "user" | "admin";
  loginMethod: "email" | "google";
  isVerified: boolean;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalUsers: number;
  };
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const getUsers = async (
  params?: GetUsersParams,
): Promise<UsersResponse> => {
  try {
    const response = await fetchData<UsersResponse>("/admin/users", params);
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserRole = async (
  id: string,
  role: "user" | "admin",
): Promise<User | null> => {
  try {
    const response = await putData<UserResponse>(`/admin/users/${id}/role`, {
      type: role,
    });
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error updating role for user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await deleteData<DeleteResponse>(`/admin/users/${id}`);
    return response.success;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return false;
  }
};

const userAPI = {
  getUsers,
  updateUserRole,
  deleteUser,
};

export default userAPI;
