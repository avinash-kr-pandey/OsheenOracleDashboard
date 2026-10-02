"use client";

import React, { useState, useEffect } from "react";
import {
  membershipAdminApi,
  MembershipApplication,
} from "@/utils/becomeamember.api";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  Search,
  Calendar,
  Clock,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function MembershipAdminPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expiringFilter, setExpiringFilter] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    totalRevenue: 0,
  });

  // Modal State
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await membershipAdminApi.getAllApplications({
        search: searchTerm,
        status: statusFilter !== "all" && statusFilter !== "expiring" ? statusFilter : undefined,
        expiringSoon: statusFilter === "expiring" || expiringFilter ? "true" : undefined,
        limit: 100,
      });

      if (res.success && res.data) {
        const rawData = res.data as any[];
        setApplications(rawData);

        // Calculate stats
        let activeCount = 0;
        let expiringCount = 0;
        let totalRev = 0;

        rawData.forEach((item: any) => {
          if (item.status === "active") activeCount++;
          if (item.isExpiringSoon) expiringCount++;
          if (item.amountPaid) totalRev += Number(item.amountPaid);
        });

        setStats({
          total: res.pagination?.total || rawData.length,
          active: activeCount,
          expiringSoon: expiringCount,
          totalRevenue: totalRev,
        });
      } else {
        setError(res.message || "Failed to load membership records.");
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, expiringFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await membershipAdminApi.updateApplicationStatus(id, {
        status: newStatus as any,
        notes: statusNote || `Status updated to ${newStatus} by Admin`,
      });

      if (res.success) {
        if (selectedMember && selectedMember._id === id) {
          setSelectedMember({ ...selectedMember, status: newStatus });
        }
        fetchApplications();
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 inline-flex items-center justify-center">
                <Users className="h-6 w-6" />
              </span>
              Membership Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track subscribers, payment amounts, validities, and 5-day renewal warnings.
            </p>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-purple-600 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Expiring Soon Banner Warning if any member is expiring within 5 days */}
        {stats.expiringSoon > 0 && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm sm:text-base">
                  {stats.expiringSoon} {stats.expiringSoon === 1 ? "Member Expiring" : "Members Expiring"} Within 5 Days!
                </h3>
                <p className="text-xs sm:text-sm text-amber-700/90 mt-0.5">
                  These members will lose their active subscription benefits soon. Please review and send renewal reminders.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("expiring")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow hover:shadow-md cursor-pointer flex-shrink-0"
            >
              View Expiring Members ({stats.expiringSoon})
            </button>
          </div>
        )}

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Applications */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Total Applications
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                  {stats.total}
                </h3>
                <span className="text-xs text-gray-400 mt-1 block">All-time subscribers</span>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl border border-blue-100">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Active Subscriptions
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-emerald-600 transition-colors">
                  {stats.active}
                </h3>
                <span className="text-xs text-emerald-600 mt-1 block font-medium">Currently active users</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Expiring Soon (≤5 Days)
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-amber-600 transition-colors">
                  {stats.expiringSoon}
                </h3>
                <span className="text-xs text-amber-600 mt-1 block font-medium">Requires renewal attention</span>
              </div>
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl border border-amber-100">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Total Revenue
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-600 transition-colors">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </h3>
                <span className="text-xs text-purple-600 mt-1 block font-medium">From active plans</span>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3.5 rounded-xl border border-purple-100">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {[
              { id: "all", label: "All Members" },
              { id: "active", label: "Active" },
              { id: "expiring", label: "⚠️ Expiring (≤5 Days)" },
              { id: "pending", label: "Pending" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 min-w-full sm:min-w-[320px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow cursor-pointer flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
              <p className="text-sm font-medium">Loading membership records...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50/50">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">No membership applications found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Member Details</th>
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Days Remaining</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {applications.map((app) => {
                    const isExpiring = app.isExpiringSoon;
                    return (
                      <tr
                        key={app._id}
                        className={`hover:bg-purple-50/30 transition-colors ${
                          isExpiring ? "bg-amber-50/40" : ""
                        }`}
                      >
                        <td className="p-4 font-medium">
                          <div className="font-bold text-gray-900 text-sm">{app.name}</div>
                          <div className="text-gray-500 text-[11px]">{app.email}</div>
                          <div className="text-gray-400 text-[10px]">
                            {app.countryCode} {app.phone}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-block text-xs">
                            {app.planName || app.plan}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-emerald-700 text-sm">
                            {app.amountPaid ? `₹${Number(app.amountPaid).toLocaleString("en-IN")}` : app.planPrice || "N/A"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                              app.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        <td className="p-4">
                          {app.daysRemaining !== null && app.daysRemaining !== undefined ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                                isExpiring
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                  : app.daysRemaining === 0
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {isExpiring ? `⚠️ ${app.daysRemaining} Days Left` : `${app.daysRemaining} Days Left`}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="p-4 text-gray-500 font-mono text-[11px]">
                          {app.subscriptionEndDate
                            ? new Date(app.subscriptionEndDate).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedMember(app)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-purple-600 text-gray-700 hover:text-white rounded-lg font-semibold transition cursor-pointer text-xs"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Member Details & Status Management Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-5 text-gray-800 relative shadow-2xl">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Member Details</h3>
                  <p className="text-xs text-gray-500">View and update membership subscription status</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl space-y-2.5 border border-gray-200 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="font-bold text-gray-900">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <span className="font-semibold text-purple-600">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="text-gray-800">{selectedMember.countryCode} {selectedMember.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Plan:</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {selectedMember.planName || selectedMember.plan}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedMember.amountPaid ? `₹${Number(selectedMember.amountPaid).toLocaleString("en-IN")}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Days Remaining:</span>
                  <span className="font-bold text-amber-700">
                    {selectedMember.daysRemaining !== null ? `${selectedMember.daysRemaining} Days` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 font-medium">Validity Expiry:</span>
                  <span className="font-mono text-gray-700">
                    {selectedMember.subscriptionEndDate
                      ? new Date(selectedMember.subscriptionEndDate).toLocaleDateString("en-IN")
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Quick Status Update */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block">
                  Update Subscription Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["active", "pending", "cancelled"].map((st) => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusUpdate(selectedMember._id, st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                        selectedMember.status === st
                          ? st === "active"
                            ? "bg-emerald-600 text-white shadow-md"
                            : st === "pending"
                            ? "bg-amber-600 text-white shadow-md"
                            : "bg-red-600 text-white shadow-md"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}