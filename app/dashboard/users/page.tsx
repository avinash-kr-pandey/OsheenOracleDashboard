"use client";

import React, { useEffect, useState } from "react";
import userAPI, { User } from "@/utils/userApi";
import { toast, Toaster } from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Shield,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter, search & pagination states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  // Fetch users with current query params
  const loadUsers = async (page: number, search: string, role: string) => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        type: role !== "all" ? role : undefined,
      });

      if (response.success) {
        setUsers(response.data);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalUsers(response.pagination.totalUsers);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to load users";
      toast.error(`❌ ${msg}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger + filter updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(currentPage, searchTerm, roleFilter);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, roleFilter]);

  // Reset to page 1 on filter/search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRoleToggle = async (user: User) => {
    const newRole = user.type === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      )
    ) {
      return;
    }

    try {
      setUpdatingId(user._id);
      const updatedUser = await userAPI.updateUserRole(user._id, newRole);
      if (updatedUser) {
        toast.success(`🎉 Updated ${user.name} to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, type: newRole } : u)),
        );
      } else {
        toast.error("❌ Failed to update user role");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update role";
      toast.error(`❌ ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !window.confirm(
        `⚠️ WARNING: Are you sure you want to delete user "${user.name}"?\nThis action is permanent and cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(user._id);
      const success = await userAPI.deleteUser(user._id);
      if (success) {
        toast.success(`🗑️ Deleted user ${user.name}`);
        // Reload current page
        loadUsers(currentPage, searchTerm, roleFilter);
      } else {
        toast.error("❌ Failed to delete user");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to delete user";
      toast.error(`❌ ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate pagination page numbers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl font-semibold transition-all ${
            currentPage === i
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }

    return pageNumbers;
  };

  // Compute indices for showing records text
  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalUsers);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <Toaster position="top-right" />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-gray-500 mt-1">
            View, search, change roles, and manage all users registered in the system.
          </p>
        </div>
        <button
          onClick={() => loadUsers(currentPage, searchTerm, roleFilter)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-gray-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Registered</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Filter Matching</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.length} shown</p>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Page Index</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {currentPage}/{totalPages}
            </p>
          </div>
          <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
            <UserIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto relative">
            <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full md:w-48 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none font-medium text-gray-700"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin Only</option>
              <option value="user">User Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-3xl border border-gray-200/60 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading user catalog...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-12 text-center">
          <div className="max-w-sm mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              No Users Found
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "No registered users exist in the database."}
            </p>
            {(searchTerm || roleFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-blue-600 bg-blue-50 font-semibold rounded-xl hover:bg-blue-100 transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Auth Method
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    {/* User profile details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold relative overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : null}
                          <span>{getInitials(user.name)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-6">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          user.type === "admin"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}
                      >
                        {user.type === "admin" ? (
                          <>
                            <Shield className="h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-3 w-3" />
                            User
                          </>
                        )}
                      </div>
                    </td>

                    {/* Login method & verification state */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                          {user.loginMethod || "Email"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            user.isVerified
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Unverified
                            </>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId !== null}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        title="Delete user account"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="font-semibold text-gray-800">{startRecord}</span> to{" "}
              <span className="font-semibold text-gray-800">{endRecord}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalUsers}</span> users
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {renderPageNumbers()}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
