"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiBarChart2,
  FiHelpCircle,
  FiStar,
  FiSettings,
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";
import { fetchData, setAuthToken } from "@/utils/api";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  addresses?: any[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
interface NavSubItem {
  name: string;
  href: string;
  submenu?: NavSubItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  submenu?: NavSubItem[];
}

const getProfile = async (): Promise<UserProfile> => {
  try {
    return await fetchData<UserProfile>("/auth/profile");
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};

function ProfileModal({
  user,
  isOpen,
  onClose,
  onLogout,
}: {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden z-10">
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Profile Details
                </h2>
                <p className="text-gray-400 text-sm">
                  View and manage your account
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Full Name</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {user.name || "Not provided"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Email Address</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {user.email || "Not provided"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">User ID</p>
              <div className="text-white font-mono text-sm p-3 bg-gray-800/50 rounded-lg border border-gray-700 truncate">
                {user._id || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Role</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {user.role || "User"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Account Created</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Last Updated</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {formatDate(user.updatedAt)}
              </div>
            </div>
          </div>

          {user.phone && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Phone Number</p>
              <div className="text-white font-medium p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {user.phone}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Addresses</h3>
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((address: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                  >
                    <p className="text-white">
                      {address.street || "No street"},{" "}
                      {address.city || "No city"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {address.state || "No state"},{" "}
                      {address.zipCode || "No zip"}
                    </p>
                    {address.country && (
                      <p className="text-gray-400 text-xs mt-1">
                        {address.country}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-center">
                  No addresses added yet
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FiX /> Close
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900/50 text-center">
          <p className="text-gray-500 text-sm">
            User ID:{" "}
            <span className="text-gray-400 font-mono">
              {user._id?.slice(0, 12)}...
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: <FiHome />, color: "text-blue-400" },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <FiBarChart2 />,
      color: "text-purple-400",
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <FiUsers />,
      color: "text-green-400",
    },
    {
      name: "Products",
      href: "/dashboard/products",
      icon: <FiPackage />,
      color: "text-yellow-400",
      submenu: [
        { name: "Add Product", href: "/dashboard/products/add" },
        { name: "View Product", href: "/dashboard/products/view" },
      ],
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: <FiShoppingCart />,
      color: "text-orange-400",
      submenu: [
        { name: "Add Orders", href: "/dashboard/orders/add" },
        { name: "View Orders", href: "/dashboard/orders/view" },
      ],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: <FiBarChart2 />,
      color: "text-pink-400",
    },
    {
      name: "FAQ",
      href: "/dashboard/faq",
      icon: <FiHelpCircle />,
      color: "text-cyan-400",
      submenu: [
        { name: "Add FAQ", href: "/dashboard/faq/add" },
        { name: "View FAQ", href: "/dashboard/faq/view" },
      ],
    },
    {
      name: "Horoscope",
      href: "/dashboard/horoscope",
      icon: <FiCalendar />,
      color: "text-indigo-400",
    },
    {
      name: "Astrologer",
      href: "/dashboard/astrologer",
      icon: <FiStar />,
      color: "text-yellow-300",
      submenu: [
        { name: "Add Astrologer", href: "/dashboard/astrologer/add" },
        { name: "View Astrologer", href: "/dashboard/astrologer/view" },
      ],
    },
    {
      name: "Zodiacs",
      href: "/dashboard/zodiacs",
      icon: <FiStar />,
      color: "text-purple-300",
    },
    {
      name: "Testimonial",
      href: "/dashboard/testimonial",
      icon: <FiUsers />,
      color: "text-green-300",
      submenu: [
        { name: "Add Testimonial", href: "/dashboard/testimonial/add" },
        { name: "View Testimonial", href: "/dashboard/testimonial/view" },
      ],
    },
    {
      name: "Membership",
      href: "/dashboard/membership",
      icon: <FiSettings />,
      color: "text-red-400",
      submenu: [
        { name: "Add Membership", href: "/dashboard/membership/add" },
        { name: "View Membership", href: "/dashboard/membership/view" },
      ],
    },
    {
      name: "Reading",
      href: "/dashboard/reading",
      icon: <FiPackage />,
      color: "text-teal-400",
      submenu: [
        {
          name: "Reading Service",
          href: "/dashboard/reading/readingservice",
          submenu: [
            {
              name: "Add",
              href: "/dashboard/reading/readingservice/add",
            },
            {
              name: "View",
              href: "/dashboard/reading/readingservice/view",
            },
          ],
        },
        {
          name: "Reading Package",
          href: "/dashboard/reading/readingPackage",
          submenu: [
            {
              name: "Add",
              href: "/dashboard/reading/readingPackage/add",
            },
            {
              name: "View",
              href: "/dashboard/reading/readingPackage/view",
            },
          ],
        },
      ],
    },
    {
      name: "Benefit",
      href: "/dashboard/benefit",
      icon: <FiSettings />,
      color: "text-blue-300",
      submenu: [
        { name: "Add Benefit", href: "/dashboard/benefit/add" },
        { name: "View Benefit", href: "/dashboard/benefit/view" },
      ],
    },
    {
      name: "Rashi",
      href: "/dashboard/rashi",
      icon: <FiStar />,
      color: "text-pink-300",
      submenu: [
        { name: "Add Rashi", href: "/dashboard/rashi/add" },
        { name: "View Rashi", href: "/dashboard/rashi/view" },
      ],
    },
  ];

  const isActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;

    if (item.submenu) {
      const hasActiveSubmenu = item.submenu.some((sub) => {
        if (pathname === sub.href) return true;

        if (sub.submenu) {
          return sub.submenu.some((child) => pathname === child.href);
        }

        return false;
      });

      if (hasActiveSubmenu) return true;
    }

    return false;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setUser({
          _id: "694a82e83d22a29abf6776ab",
          name: "Dummy User",
          email: "dummy@gmail.com",
          addresses: [],
          createdAt: "2025-12-23T11:54:16.111Z",
          updatedAt: "2025-12-23T11:54:16.111Z",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetchData("/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      setAuthToken(null);
      setUser(null);
      setShowProfileModal(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      router.push("/login");
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  return (
    <>
      <aside
        className={`
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          h-screen text-white transition-all duration-300 
          border-r border-gray-700
          fixed lg:static z-30
          ${isCollapsed ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}


          flex flex-col
        `}
      >
        <div className="md:py-5 p-0 md:p-5 py-5 pl-2 mt-10 md:mt-0 flex items-center justify-between border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 pt-12 mb-4">
         
          <div className="flex items-center justify-between md:justify-start flex-1 gap-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="font-bold text-white text-xl">A</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    AstroDash
                  </h1>
                  <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <span className="font-bold text-white text-xl">A</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors hidden lg:block"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <FiChevronRight size={20} />
              ) : (
                <FiChevronRight size={20} className="rotate-180" />
              )}
            </button>
          </div>
           <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="mb-4">
            {!isCollapsed && (
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-3 px-3">
                Main Menu
              </p>
            )}
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const itemActive = isActive(item);

              if (item.submenu && item.submenu.length > 0) {
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`
                        flex items-center justify-between w-full gap-3 px-3 py-3 rounded-xl
                        transition-all duration-200 group
                        ${
                          itemActive
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
                            : "hover:bg-gray-700/50 border border-transparent"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`text-lg ${item.color} transition-transform group-hover:scale-110`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="font-medium text-sm text-gray-200 group-hover:text-white">
                            {item.name}
                          </span>
                        )}
                      </span>
                      {!isCollapsed && (
                        <span
                          className={`transition-transform ${
                            openDropdown === item.name ? "rotate-180" : ""
                          }`}
                        >
                          <FiChevronDown size={16} className="text-gray-400" />
                        </span>
                      )}
                    </button>

                    {openDropdown === item.name && !isCollapsed && (
                      <ul className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-3">
                        {item.submenu.map((sub) => {
                          const hasChild =
                            sub.submenu && sub.submenu.length > 0;

                          return (
                            <li key={sub.name}>
                              <button
                                onClick={() =>
                                  hasChild
                                    ? setOpenSubDropdown(
                                        openSubDropdown === sub.name
                                          ? null
                                          : sub.name
                                      )
                                    : router.push(sub.href)
                                }
                                className={`flex w-full items-center justify-between
                                  px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                                  text-gray-300 hover:bg-gray-700 hover:text-white`}
                              >
                                <span className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                  {sub.name}
                                </span>

                                {hasChild &&
                                  (openSubDropdown === sub.name ? (
                                    <FiChevronDown size={14} />
                                  ) : (
                                    <FiChevronRight size={14} />
                                  ))}
                              </button>

                              {hasChild && openSubDropdown === sub.name && (
                                <ul className="ml-5 mt-1 space-y-1 border-l border-gray-700 pl-3">
                                  {sub.submenu?.map((child) => (
                                    <li key={child.name}>
                                      <Link
                                        href={child.href}
                                        onClick={onClose}
                                        className={`block px-3 py-2 rounded-md text-xs transition-all
                                          ${
                                            pathname === child.href
                                              ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white ml-2"
                                              : "text-gray-400 hover:bg-gray-700 hover:text-white hover:ml-2"
                                          }`}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 group
                      ${
                        itemActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "hover:bg-gray-700/50 text-gray-200 hover:text-white"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <span
                      className={`${
                        item.color
                      } text-lg transition-transform group-hover:scale-110 ${
                        itemActive ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="font-medium text-sm flex-1">
                        {item.name}
                      </span>
                    )}
                    {itemActive && !isCollapsed && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-md">
              {loading ? (
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
              ) : (
                <span className="text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                {loading ? (
                  <>
                    <div className="h-4 bg-gray-700 rounded w-24 mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded w-32 animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="font-medium text-white truncate">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </>
                )}
              </div>
            )}

            {!isCollapsed && !loading && (
              <FiChevronRight className="text-gray-400 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </aside>

      <ProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </>
  );
}
