"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiEdit,
  FiSave,
  FiX,
  FiLock,
  FiShield,
  FiServer,
  FiKey,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiShoppingBag,
  FiHeart,
  FiTrendingUp,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";
import { fetchData, putData } from "@/utils/api";
import { Toaster, toast } from "react-hot-toast";

// Types
interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  reviews: number;
}

interface UserPreferences {
  language: string;
  timezone: string;
  notifications: boolean;
}

interface UserProfile {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  loginMethod: string;
  addresses: Address[];
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

interface ApiProfileResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    avatar?: string;
    isVerified: boolean;
    loginMethod: string;
    addresses: Address[];
    createdAt?: string;
    updatedAt?: string;
  };
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Activity {
  action: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

// Mock activity data
const mockActivities: Activity[] = [
  { action: "Logged in", time: "2 hours ago", icon: FiUser, color: "blue" },
  {
    action: "Updated profile",
    time: "Yesterday",
    icon: FiEdit,
    color: "green",
  },
  {
    action: "Viewed dashboard",
    time: "3 days ago",
    icon: FiActivity,
    color: "purple",
  },
  {
    action: "Checked analytics",
    time: "1 week ago",
    icon: FiTrendingUp,
    color: "orange",
  },
];

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "activity" | "addresses"
  >("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchData<ApiProfileResponse>("/auth/profile");

      // Transform API response to UserProfile
      const apiUser = response.user;
      const transformedUser: UserProfile = {
        id: apiUser.id,
        _id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: "",
        type: apiUser.type,
        role: apiUser.type,
        avatar: apiUser.avatar,
        isVerified: apiUser.isVerified,
        loginMethod: apiUser.loginMethod,
        addresses: apiUser.addresses || [],
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
        lastLogin: new Date().toISOString(),
        preferences: {
          language: "English",
          timezone: "UTC+5:30",
          notifications: true,
        },
        stats: {
          totalOrders: 24,
          totalSpent: 12500,
          reviews: 8,
        },
      };

      setUser(transformedUser);
      setEditData({
        name: transformedUser.name,
        email: transformedUser.email,
        phone: transformedUser.phone,
      });

      toast.success("Profile loaded successfully");
    } catch (error: unknown) {
      console.error("Failed to fetch profile:", error);
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else if (axiosError?.response?.status === 403) {
        toast.error("Please verify your email first");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setChangingPassword(false);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editData.name?.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!editData.email?.trim()) {
        toast.error("Email is required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await putData<{ success: boolean; user: UserProfile }>(
        "/auth/profile",
        {
          name: editData.name,
          email: editData.email,
          phone: editData.phone || "",
        },
      );

      if (user && response.user) {
        setUser({
          ...user,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone || "",
        });
      }

      setEditing(false);
      toast.success("Profile updated successfully!");

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            name: editData.name,
            email: editData.email,
          }),
        );
      }
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message || "Failed to update profile",
      );
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwordData.currentPassword) {
        toast.error("Current password is required");
        return;
      }

      if (!passwordData.newPassword) {
        toast.error("New password is required");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      await putData("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError?.response?.data?.message || "Failed to change password",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await fetchData("/auth/logout");
      localStorage.clear();
      toast.success("Logged out successfully");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      router.push("/login");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-400 mb-4">Unable to load user profile</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account information and security
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700/50 pb-4">
          {[
            { id: "profile" as const, label: "Profile Info", icon: FiUser },
            { id: "security" as const, label: "Security", icon: FiShield },
            { id: "activity" as const, label: "Activity", icon: FiActivity },
            { id: "addresses" as const, label: "Addresses", icon: FiMapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-800/40 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-blue-500/30">
                    {getUserInitials()}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div
                      className={`w-4 h-4 rounded-full ${user.isVerified ? "bg-green-500" : "bg-yellow-500"} ring-2 ring-gray-800`}
                    ></div>
                  </div>
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm font-medium">
                    {user.type}
                  </span>
                  {user.isVerified && (
                    <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <FiCheckCircle size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-3 flex items-center gap-1 justify-center">
                  <FiClock size={14} />
                  Member since{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).getFullYear()
                    : "2024"}
                </p>

                {/* Stats */}
                <div className="w-full mt-6 pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <FiShoppingBag className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Orders</p>
                      <p className="text-white font-bold text-lg">
                        {user.stats.totalOrders}
                      </p>
                    </div>
                    <div className="text-center">
                      <FiHeart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Reviews</p>
                      <p className="text-white font-bold text-lg">
                        {user.stats.reviews}
                      </p>
                    </div>
                    <div className="text-center">
                      <FiTrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-gray-400 text-xs">Spent</p>
                      <p className="text-white font-bold text-lg">
                        ₹{user.stats.totalSpent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setChangingPassword(true);
                    setEditing(false);
                    setActiveTab("security");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-white group"
                >
                  <FiKey className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="flex-1 text-left">Change Password</span>
                  <FiEdit size={14} className="text-gray-500" />
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-white group"
                >
                  <FiActivity className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="flex-1 text-left">Go to Dashboard</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-900/20 hover:bg-red-900/30 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 group"
                >
                  <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-blue-500" />
                    Personal Information
                  </h3>
                  {!editing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FiEdit size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                      >
                        <FiX size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl transition-all shadow-lg"
                      >
                        <FiSave size={16} />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiUser size={14} />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editData.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500 transition-all"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiMail size={14} />
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={editData.email || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500 transition-all"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="text-white">{user.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiPhone size={14} />
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editData.phone || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500 transition-all"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="text-white">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiShield size={14} />
                      Account Type
                    </label>
                    <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-white font-medium capitalize">
                        {user.type}
                      </p>
                    </div>
                  </div>

                  {/* Login Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiServer size={14} />
                      Login Method
                    </label>
                    <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-white capitalize">
                        {user.loginMethod}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      {user.isVerified ? (
                        <FiCheckCircle size={14} />
                      ) : (
                        <FiAlertCircle size={14} />
                      )}
                      Verification Status
                    </label>
                    <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p
                        className={`font-medium ${user.isVerified ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {user.isVerified
                          ? "Verified Account"
                          : "Email not verified"}
                      </p>
                    </div>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiCalendar size={14} />
                      Account Created
                    </label>
                    <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-white">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FiClock size={14} />
                      Last Updated
                    </label>
                    <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-white">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FiLock className="w-5 h-5 text-green-500" />
                    Security Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Change Password Section */}
                  <div className="border border-gray-700/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-semibold">
                          Change Password
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Update your password regularly to keep your account
                          secure
                        </p>
                      </div>
                      {!changingPassword && (
                        <button
                          onClick={() => setChangingPassword(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                          Change Password
                        </button>
                      )}
                    </div>

                    {changingPassword && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-gray-700/50">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full pl-4 pr-12 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showCurrentPassword ? (
                                <FiEyeOff size={18} />
                              ) : (
                                <FiEye size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                  })
                                }
                                className="w-full pl-4 pr-12 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showNewPassword ? (
                                  <FiEyeOff size={18} />
                                ) : (
                                  <FiEye size={18} />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className="w-full pl-4 pr-12 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-500"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showConfirmPassword ? (
                                  <FiEyeOff size={18} />
                                ) : (
                                  <FiEye size={18} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handlePasswordChange}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all shadow-lg"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => {
                              setChangingPassword(false);
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border border-gray-700/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                  <FiActivity className="w-5 h-5 text-purple-500" />
                  Recent Activity
                </h3>

                <div className="space-y-4">
                  {mockActivities.map((activity, idx) => {
                    const IconComponent = activity.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-gray-700/20 rounded-xl border border-gray-700/30 hover:bg-gray-700/30 transition-all"
                      >
                        <div
                          className={`w-10 h-10 bg-${activity.color}-900/30 rounded-full flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`w-5 h-5 text-${activity.color}-400`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {activity.action}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {activity.time}
                          </p>
                        </div>
                        <FiClock className="text-gray-500 text-sm" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-yellow-500" />
                    Saved Addresses
                  </h3>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2">
                    <FiEdit size={14} />
                    Add New Address
                  </button>
                </div>

                {user.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-700/20 rounded-xl border border-gray-700/30"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-medium">
                            Address {index + 1}
                          </p>
                          <button className="text-gray-400 hover:text-blue-400 text-sm">
                            Edit
                          </button>
                        </div>
                        <p className="text-gray-300">
                          {address.street}, {address.city}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {address.state}, {address.zipCode}
                        </p>
                        {address.country && (
                          <p className="text-gray-400 text-sm mt-1">
                            {address.country}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMapPin className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-gray-400">No addresses added yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Add your first address for faster checkout
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
};

export default Profile;
