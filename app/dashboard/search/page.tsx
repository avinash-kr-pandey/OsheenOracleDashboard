"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchData } from "@/utils/api";
import { FiUser, FiShoppingCart, FiSearch, FiArrowLeft, FiClock, FiMail, FiPhone } from "react-icons/fi";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
  phone?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  productName: string;
  price: number;
  status: string;
  quantity?: number;
  totalAmount?: number;
  createdAt?: string;
  phone?: string;
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"all" | "users" | "orders">("all");
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users and orders in parallel
      const [usersRes, ordersRes] = await Promise.allSettled([
        fetchData<any>("/admin/users"),
        fetchData<any>("/orders"),
      ]);

      let allUsers: User[] = [];
      let allOrders: Order[] = [];

      if (usersRes.status === "fulfilled" && usersRes.value?.success && Array.isArray(usersRes.value.data)) {
        allUsers = usersRes.value.data;
      }

      if (ordersRes.status === "fulfilled") {
        const responseObj = ordersRes.value;
        if (Array.isArray(responseObj)) {
          allOrders = responseObj;
        } else if (responseObj && typeof responseObj === "object") {
          const res = responseObj as any;
          if (Array.isArray(res.orders)) {
            allOrders = res.orders;
          } else if (Array.isArray(res.data)) {
            allOrders = res.data;
          }
        }
      }

      // Filter locally by search query
      const lowerQuery = query.toLowerCase();

      const filteredUsers = allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(lowerQuery) ||
          u.email?.toLowerCase().includes(lowerQuery) ||
          u.phone?.toLowerCase().includes(lowerQuery)
      );

      const filteredOrders = allOrders.filter(
        (o) =>
          o._id?.toLowerCase().includes(lowerQuery) ||
          o.productName?.toLowerCase().includes(lowerQuery) ||
          o.phone?.toLowerCase().includes(lowerQuery) ||
          o.shippingAddress?.name?.toLowerCase().includes(lowerQuery) ||
          o.shippingAddress?.phone?.toLowerCase().includes(lowerQuery)
      );

      setUsers(filteredUsers);
      setOrders(filteredOrders);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to execute search query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back and Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 transition"
              title="Go back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FiSearch className="text-blue-500" />
                Search Results
              </h1>
              <p className="text-gray-500 mt-1">
                Showing results for &ldquo;<span className="font-semibold text-gray-800">{query}</span>&rdquo;
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
              {[
                { id: "all" as const, label: "All Results", count: users.length + orders.length },
                { id: "users" as const, label: "Users", count: users.length, icon: <FiUser /> },
                { id: "orders" as const, label: "Orders", count: orders.length, icon: <FiShoppingCart /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="bg-white rounded-b-xl border-x border-b border-gray-200 p-6 min-h-[300px]">
              {/* Empty State */}
              {users.length === 0 && orders.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">No matches found</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    We couldn&apos;t find any users or orders matching &ldquo;{query}&rdquo;. Check spelling or try a different term.
                  </p>
                </div>
              )}

              {/* Users Results */}
              {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
                <div className="mb-10 last:mb-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <FiUser className="text-green-500" />
                    Matching Users ({users.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((u) => (
                      <Link
                        key={u._id}
                        href="/dashboard/users"
                        className="block bg-gray-50 border border-gray-100 hover:border-blue-300 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 truncate max-w-[180px]">{u.name}</h3>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                              {u.type || "User"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <p className="flex items-center gap-1.5 truncate">
                            <FiMail className="flex-shrink-0" />
                            {u.email}
                          </p>
                          {u.phone && (
                            <p className="flex items-center gap-1.5">
                              <FiPhone className="flex-shrink-0" />
                              {u.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-1.5 text-gray-400">
                            <FiClock className="flex-shrink-0" />
                            Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Results */}
              {(activeTab === "all" || activeTab === "orders") && orders.length > 0 && (
                <div className="mb-10 last:mb-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <FiShoppingCart className="text-orange-500" />
                    Matching Orders ({orders.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((o) => (
                      <Link
                        key={o._id}
                        href="/dashboard/orders"
                        className="block bg-gray-50 border border-gray-100 hover:border-blue-300 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div>
                            <h3 className="font-bold text-gray-800 line-clamp-1">{o.productName}</h3>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {o._id.slice(0, 10)}...</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              o.status === "completed" || o.status === "delivered"
                                ? "bg-green-50 text-green-600"
                                : o.status === "cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs text-gray-600">
                          <p className="flex justify-between font-bold text-gray-900 mt-2 border-t pt-2">
                            <span>Amount:</span>
                            <span className="text-blue-600">₹{o.totalAmount || o.price}</span>
                          </p>
                          {o.shippingAddress?.name && (
                            <p className="flex items-center gap-1.5 truncate">
                              <FiUser className="flex-shrink-0" />
                              Customer: {o.shippingAddress.name}
                            </p>
                          )}
                          {(o.phone || o.shippingAddress?.phone) && (
                            <p className="flex items-center gap-1.5">
                              <FiPhone className="flex-shrink-0" />
                              Phone: {o.phone || o.shippingAddress?.phone}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
