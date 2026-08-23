"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { fetchData, putData, deleteData, patchData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Session Request Type definition (matches backend ServiceRequest)
interface SessionRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  categoryName: string;
  subcategoryName: string;
  price: number;
  communicationMode: "voice_call" | "video_call" | "voice_note";
  description: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  preferredDate?: string;
  preferredTimeSlot?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success?: boolean;
  data?: SessionRequest[];
  message?: string;
}

const SessionsManagement = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [adminNotesUpdate, setAdminNotesUpdate] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null);

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetchData<ApiResponse>('/services/requests');
      console.log('Sessions API Response:', response);

      let requestsArray: SessionRequest[] = [];
      if (Array.isArray(response)) {
        requestsArray = response;
      } else if (response && typeof response === 'object') {
        const resObj = response as any;
        if (Array.isArray(resObj.data)) {
          requestsArray = resObj.data;
        } else if (Array.isArray(resObj.requests)) {
          requestsArray = resObj.requests;
        } else if (resObj.success && Array.isArray(resObj.data)) {
          requestsArray = resObj.data;
        }
      }

      setRequests(requestsArray);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view sessions');
        router.push('/login');
        return;
      }
      toast.error('Failed to load sessions');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (requestId: string) => {
    if (!statusUpdate.trim()) {
      toast.error('Please select a status');
      return;
    }

    try {
      setLoading(true);
      await patchData(`/services/requests/${requestId}/status`, {
        status: statusUpdate,
        adminNotes: adminNotesUpdate,
      });

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req._id === requestId
            ? { ...req, status: statusUpdate as any, adminNotes: adminNotesUpdate }
            : req
        )
      );

      setEditingId(null);
      toast.success('Session booking updated successfully!');
      fetchSessions(); // Refresh data
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session booking');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete booking
  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this session booking?')) return;
    try {
      setLoading(true);
      await deleteData(`/services/requests/${requestId}`);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success('Session booking deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session booking');
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions based on search term and status filter
  const filteredRequests = requests.filter(req => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchesSearch =
      cleanSearch === '' ||
      req.name?.toLowerCase().includes(cleanSearch) ||
      req.email?.toLowerCase().includes(cleanSearch) ||
      req.phone?.includes(cleanSearch) ||
      req.subcategoryName?.toLowerCase().includes(cleanSearch);

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort sessions by date (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Calculate statistics
  const totalSessions = requests.length;
  const totalRevenue = requests.reduce((sum, req) => sum + (req.price || 0), 0);
  const pendingSessions = requests.filter(r => r.status === 'pending').length;
  const completedSessions = requests.filter(r => r.status === 'completed' || r.status === 'confirmed').length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-4 md:p-6 text-left">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Book a Session Management</h1>
            <p className="text-gray-600">View and manage all customer booked spiritual & reading sessions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Sessions</h3>
            <p className="text-3xl font-bold">{totalSessions}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Pending</h3>
            <p className="text-3xl font-bold">{pendingSessions}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Completed / Confirmed</h3>
            <p className="text-3xl font-bold">{completedSessions}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sessions by customer name, email, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchSessions}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-5 rounded-lg transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 mt-2">Loading sessions...</p>
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No session bookings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{req.name}</p>
                        <p className="text-xs text-gray-500">{req.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium">{req.phone}</p>
                        <p className="text-xs text-gray-400">{req.communicationMode?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 font-semibold">{req.subcategoryName}</p>
                        <p className="text-xs text-gray-500">{req.categoryName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">{formatCurrency(req.price || 0)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold leading-5 ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setEditingId(req._id);
                              setStatusUpdate(req.status);
                              setAdminNotesUpdate(req.adminNotes || '');
                            }}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-lg transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Status & Notes Modal (styled like orders management) */}
      {editingId && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-100 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Update Session Status</h2>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">Customer Name</label>
                <div className="text-gray-800 font-semibold bg-gray-50 p-2.5 rounded-lg border">{selectedRequest.name}</div>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">Booked Service</label>
                <div className="text-gray-800 font-semibold bg-gray-50 p-2.5 rounded-lg border">{selectedRequest.subcategoryName}</div>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">Internal Admin Notes</label>
                <textarea
                  value={adminNotesUpdate}
                  onChange={(e) => setAdminNotesUpdate(e.target.value)}
                  placeholder="Add session link, time updates, or other notes..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleStatusUpdate(editingId)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <SessionsManagement />
    </Suspense>
  );
}
