"use client";

import React, { useState, useEffect } from "react";
import {
  membershipAdminApi,
  MembershipApplication,
} from "@/utils/becomeamember.api";

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span>🔮</span> Membership Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track subscribers, payment amounts, validities, and 5-day renewal warnings.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-gray-700 cursor-pointer"
        >
          <span>🔄</span> Refresh Data
        </button>
      </div>

      {/* Expiring Soon Banner Warning if any member is expiring within 5 days */}
      {stats.expiringSoon > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                {stats.expiringSoon} {stats.expiringSoon === 1 ? "Member Expiring" : "Members Expiring"} Within 5 Days!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                These members will lose their active subscription benefits soon. Please review and send renewal reminders.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("expiring")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm rounded-xl transition shadow cursor-pointer"
          >
            View Expiring Members ({stats.expiringSoon})
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/60 border border-gray-800 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Total Applications</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          <span className="text-[10px] text-gray-500 mt-2 block">All time subscribers</span>
        </div>

        <div className="p-5 bg-gray-900/60 border border-emerald-900/40 rounded-2xl">
          <p className="text-xs text-emerald-400 font-medium">Active Subscriptions</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
          <span className="text-[10px] text-emerald-500/80 mt-2 block">Currently active users</span>
        </div>

        <div className="p-5 bg-gray-900/60 border border-amber-900/40 rounded-2xl">
          <p className="text-xs text-amber-400 font-medium">Expiring Soon (≤5 Days)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.expiringSoon}</p>
          <span className="text-[10px] text-amber-500/80 mt-2 block">Requires renewal attention</span>
        </div>

        <div className="p-5 bg-gray-900/60 border border-purple-900/40 rounded-2xl">
          <p className="text-xs text-purple-400 font-medium">Total Membership Revenue</p>
          <p className="text-2xl font-bold text-purple-300 mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-purple-400/80 mt-2 block">Collected from active plans</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-gray-900/40 p-4 border border-gray-800 rounded-2xl">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 min-w-[280px]">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
            Loading membership records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No membership applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-800/60 border-b border-gray-700 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Member Details</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Days Remaining</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {applications.map((app) => {
                  const isExpiring = app.isExpiringSoon;
                  return (
                    <tr
                      key={app._id}
                      className={`hover:bg-gray-800/40 transition ${
                        isExpiring ? "bg-amber-950/10" : ""
                      }`}
                    >
                      <td className="p-4 font-medium">
                        <div className="font-bold text-white text-sm">{app.name}</div>
                        <div className="text-gray-400 text-[11px]">{app.email}</div>
                        <div className="text-gray-500 text-[10px]">
                          {app.countryCode} {app.phone}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-purple-300 text-xs">
                          {app.planName || app.plan}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-emerald-400">
                          {app.amountPaid ? `₹${app.amountPaid.toLocaleString("en-IN")}` : app.planPrice || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            app.status === "active"
                              ? "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50"
                              : app.status === "pending"
                              ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50"
                              : "bg-red-900/50 text-red-400 border border-red-700/50"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {app.daysRemaining !== null && app.daysRemaining !== undefined ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              isExpiring
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse"
                                : app.daysRemaining === 0
                                ? "bg-red-950 text-red-400"
                                : "bg-purple-950 text-purple-300"
                            }`}
                          >
                            {isExpiring ? `⚠️ ${app.daysRemaining} Days Left` : `${app.daysRemaining} Days Left`}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      <td className="p-4 text-gray-400 font-mono text-[11px]">
                        {app.subscriptionEndDate
                          ? new Date(app.subscriptionEndDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedMember(app)}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-purple-300 hover:text-white rounded-lg font-medium transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-lg w-full space-y-5 text-gray-200 relative shadow-2xl">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span> Member Details
            </h3>

            <div className="bg-gray-800/50 p-4 rounded-2xl space-y-2 border border-gray-700/50 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="font-bold text-white">{selectedMember.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-purple-300">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span>{selectedMember.countryCode} {selectedMember.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="font-bold text-purple-400">{selectedMember.planName || selectedMember.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400">
                  {selectedMember.amountPaid ? `₹${selectedMember.amountPaid.toLocaleString("en-IN")}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Days Remaining:</span>
                <span className="font-bold text-amber-400">
                  {selectedMember.daysRemaining !== null ? `${selectedMember.daysRemaining} Days` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Validity Expiry:</span>
                <span>
                  {selectedMember.subscriptionEndDate
                    ? new Date(selectedMember.subscriptionEndDate).toLocaleDateString("en-IN")
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Quick Status Update */}
            <div className="space-y-3 pt-2 border-t border-gray-800">
              <label className="text-xs font-bold text-gray-300 block">
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
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}