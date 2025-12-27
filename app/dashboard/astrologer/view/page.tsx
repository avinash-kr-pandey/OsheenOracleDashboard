"use client"
import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Astrologer type definition
interface Astrologer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  languages: string;
  consultationFee: string;
  rating: string;
  bio: string;
  profileImage: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ViewAstrologers = () => {
  const router = useRouter();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Astrologer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch astrologers on component mount
  useEffect(() => {
    fetchAstrologers();
  }, []);

  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      const data = await fetchData<Astrologer[]>('/astrologers');
      setAstrologers(data);
    } catch (error) {
      console.error('Error fetching astrologers:', error);
      toast.error('Failed to load astrologers');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEditClick = (astrologer: Astrologer) => {
    setEditingId(astrologer.id);
    setEditFormData({ ...astrologer });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: name === 'isActive' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  const handleUpdate = async () => {
    if (!editFormData) return;

    try {
      // PUT request to update astrologer
      await putData(`/astrologers/${editFormData.id}`, editFormData);
      
      // Update local state
      setAstrologers(prev => 
        prev.map(astro => 
          astro.id === editFormData.id ? editFormData : astro
        )
      );
      
      setEditingId(null);
      setEditFormData(null);
      toast.success('Astrologer updated successfully!');
    } catch (error) {
      console.error('Error updating astrologer:', error);
      toast.error('Failed to update astrologer');
    }
  };

  // Handle delete
  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      // DELETE request
      await deleteData(`/astrologers/${id}`);
      
      // Remove from local state
      setAstrologers(prev => prev.filter(astro => astro.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Astrologer deleted successfully!');
    } catch (error) {
      console.error('Error deleting astrologer:', error);
      toast.error('Failed to delete astrologer');
    }
  };

  // Filter astrologers based on search
  const filteredAstrologers = astrologers.filter(astro =>
    astro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    astro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    astro.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Astrologers Directory</h1>
              <p className="text-gray-600">Manage and view all astrologers in the system</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/astrologer/add')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              + Add New Astrologer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90">Total Astrologers</h3>
            <p className="text-3xl font-bold">{astrologers.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90">Active Now</h3>
            <p className="text-3xl font-bold">{astrologers.filter(a => a.isActive).length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90">Avg. Rating</h3>
            <p className="text-3xl font-bold">
              {astrologers.length > 0 
                ? (astrologers.reduce((sum, a) => sum + parseFloat(a.rating || '0'), 0) / astrologers.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90">Avg. Experience</h3>
            <p className="text-3xl font-bold">
              {astrologers.length > 0 
                ? (astrologers.reduce((sum, a) => sum + parseFloat(a.experience || '0'), 0) / astrologers.length).toFixed(1) + ' yrs'
                : '0 yrs'
              }
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={fetchAstrologers}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Astrologers Table */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Astrologer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAstrologers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No astrologers found. Add your first astrologer!
                      </td>
                    </tr>
                  ) : (
                    filteredAstrologers.map((astro) => (
                      <tr key={astro.id} className="hover:bg-gray-50 transition">
                        {editingId === astro.id ? (
                          // Edit Mode
                          <>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name="name"
                                value={editFormData?.name || ''}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name="email"
                                value={editFormData?.email || ''}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded mb-2"
                              />
                              <input
                                type="text"
                                name="phone"
                                value={editFormData?.phone || ''}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name="specialization"
                                value={editFormData?.specialization || ''}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded mb-2"
                              />
                              <input
                                type="text"
                                name="experience"
                                value={editFormData?.experience || ''}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="isActive"
                                  checked={editFormData?.isActive || false}
                                  onChange={handleEditChange}
                                  className="mr-2"
                                />
                                Active
                              </label>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdate}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditFormData(null);
                                  }}
                                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-4">
                                  {astro.profileImage ? (
                                    <img src={astro.profileImage} alt={astro.name} className="h-12 w-12 rounded-full object-cover" />
                                  ) : (
                                    <span className="text-xl font-bold text-blue-600">
                                      {astro.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{astro.name}</div>
                                  <div className="text-sm text-gray-500">ID: {astro.id}</div>
                                  {astro.bio && (
                                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{astro.bio}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{astro.email}</div>
                              <div className="text-sm text-gray-500">{astro.phone}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Languages: {astro.languages || 'Not specified'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{astro.specialization}</div>
                                <div className="text-gray-600">{astro.experience} years experience</div>
                                <div className="flex items-center mt-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="ml-1 text-gray-700">{astro.rating || 'N/A'}</span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-gray-600">${astro.consultationFee}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                astro.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {astro.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="text-xs text-gray-500 mt-2">
                                {formatDate(astro.updatedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(astro)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(astro.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this astrologer? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAstrologers;