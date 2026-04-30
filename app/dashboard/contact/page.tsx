"use client"

import React, { useState, useEffect, useCallback } from "react";
import {
  getAllConsultations,
  updateConsultationStatus,
  deleteConsultation,
  getDashboardStats,
  ContactConsultation,
  DashboardStats,
  GetAllConsultationsParams,
} from "@/utils/contact.api";

type StatusType = ContactConsultation["status"];
type PaymentStatusType = ContactConsultation["paymentStatus"];

const Contact: React.FC = () => {
  const [consultations, setConsultations] = useState<ContactConsultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedConsultation, setSelectedConsultation] =
    useState<ContactConsultation | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetAllConsultationsParams = {};
      if (filter !== "all") params.status = filter;
      if (search) params.search = search;

      const response = await getAllConsultations(params);
      if (response.success && response.data) {
        setConsultations(response.data);
      } else {
        setConsultations([]);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
    fetchStats();
  }, [fetchConsultations, fetchStats]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await updateConsultationStatus(id, newStatus);
      if (response.success) {
        await fetchConsultations();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this consultation?")) {
      try {
        const response = await deleteConsultation(id);
        if (response.success) {
          await fetchConsultations();
          await fetchStats();
        }
      } catch (error) {
        console.error("Error deleting consultation:", error);
      }
    }
  };

  const getStatusBadge = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      rescheduled: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadge = (status: PaymentStatusType): string => {
    const colors: Record<PaymentStatusType, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      refunded: "bg-red-100 text-red-800",
      failed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Contact Consultations
        </h1>
        <p className="text-gray-600 mt-1">Manage all consultation bookings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {stats.pending || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-semibold text-blue-600">
              {stats.confirmed || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.completed || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-2xl font-semibold text-purple-600">
              {stats.todaysConsultations || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchConsultations()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          <button
            onClick={fetchConsultations}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Search
          </button>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No consultations found
                  </td>
                </tr>
              ) : (
                consultations.map((consultation) => (
                  <tr key={consultation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {consultation.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {consultation.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {consultation.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {formatDate(consultation.desiredDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {consultation.desiredTime}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 capitalize">
                        {consultation.consultationType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {consultation.consultationDuration} min
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={consultation.status}
                        onChange={(e) =>
                          handleStatusChange(consultation._id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-1 focus:ring-gray-400 ${getStatusBadge(consultation.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPaymentBadge(consultation.paymentStatus)}`}
                      >
                        {consultation.paymentStatus}
                      </span>
                      {consultation.paymentAmount && (
                        <p className="text-xs text-gray-500 mt-1">
                          ${consultation.paymentAmount}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedConsultation(consultation);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(consultation._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Consultation Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    User Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    Name: {selectedConsultation.name}
                  </p>
                  <p className="text-sm text-gray-900">
                    Email: {selectedConsultation.email}
                  </p>
                  <p className="text-sm text-gray-900">
                    Phone: {selectedConsultation.phone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Consultation Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    Date: {formatDate(selectedConsultation.desiredDate)}
                  </p>
                  <p className="text-sm text-gray-900">
                    Time: {selectedConsultation.desiredTime}
                  </p>
                  <p className="text-sm text-gray-900 capitalize">
                    Type: {selectedConsultation.consultationType}
                  </p>
                  <p className="text-sm text-gray-900">
                    Duration: {selectedConsultation.consultationDuration}{" "}
                    minutes
                  </p>
                  {selectedConsultation.preferredAstrologer && (
                    <p className="text-sm text-gray-900">
                      Preferred: {selectedConsultation.preferredAstrologer}
                    </p>
                  )}
                </div>

                {selectedConsultation.additionalMessage && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Message
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedConsultation.additionalMessage}
                    </p>
                  </div>
                )}

                {selectedConsultation.adminNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Admin Notes
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedConsultation.adminNotes}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Assigned Astrologer
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedConsultation.assignedAstrologer?.name ||
                      "Not assigned yet"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
