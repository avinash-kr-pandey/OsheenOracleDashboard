import { fetchData, putData } from "./api";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getProfile = async (): Promise<UserProfile> => {
  try {
    return await fetchData<UserProfile>("/auth/profile");
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

export const updateProfile = async (
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    return await putData<UserProfile>("/auth/profile", data);
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};
