import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { fetchData } from "@/utils/api";
import { FiMenu } from "react-icons/fi";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserData {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

interface ApiUser {
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
}

interface ApiResponse {
  success: boolean;
  user: ApiUser;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchData<ApiResponse>("/auth/profile");

      if (response && response.success && response.user) {
        const apiUser = response.user;

        // Create UserData object from API response
        const userInfo: UserData = {
          _id: apiUser.id,
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: "",
          role: apiUser.type,
          type: apiUser.type,
          createdAt: apiUser.createdAt || new Date().toISOString(),
          updatedAt: apiUser.updatedAt || new Date().toISOString(),
          isVerified: apiUser.isVerified,
          avatar: apiUser.avatar,
        };

        setUserData(userInfo);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user profile:", error);
      const axiosError = error as { response?: { status?: number } };

      if (axiosError?.response?.status === 401) {
        localStorage.clear();
        window.location.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetchData("/auth/logout", { method: "POST" });
    } catch (error: unknown) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format user role for display - Direct from backend (no static mapping)
  const formatRole = (role?: string) => {
    if (!role) return "User";
    // Just capitalize the first letter and return as is from backend
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return "U";

    const name = userData.name.trim();
    if (name.length === 0) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get year from date safely
  const getYearFromDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return "N/A";
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (!userData?.name) return "User";
    return userData.name;
  };

  // Get display email
  const getDisplayEmail = () => {
    if (!userData?.email) return "user@example.com";
    return userData.email;
  };

  // Get display role - Shows exact role from backend
  const getDisplayRole = () => {
    const role = userData?.role || userData?.type;
    return formatRole(role);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left Section - Brand/Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OO</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white hidden md:block">
              OsheenOracle
            </h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, orders, reports..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-sm text-gray-800 dark:text-gray-200"
            />
          </form>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              {/* Avatar with loading state */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials()}
                  </span>
                )}
              </div>

              {/* User info with loading state */}
              <div className="hidden md:block text-left">
                {loading ? (
                  <>
                    <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[120px]">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {getDisplayRole()}
                    </p>
                  </>
                )}
              </div>

              {/* Dropdown arrow */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                } ${loading ? "opacity-50" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && !loading && userData && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40">
                  {/* User info in dropdown */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {getDisplayEmail()}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            {getDisplayRole()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            • Joined {getYearFromDate(userData.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <a
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <div>
                        <p>View Profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Personal details & settings
                        </p>
                      </div>
                    </a>

                    {userData.phone && (
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                        <p className="font-medium mb-1">Contact Info</p>
                        <p className="truncate">{userData.phone}</p>
                        <p className="truncate">{userData.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Logout button */}
                  <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
