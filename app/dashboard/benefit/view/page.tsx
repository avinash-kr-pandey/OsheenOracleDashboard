"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Benefit type definition
interface Benefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ViewBenefits = () => {
  const router = useRouter();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Benefit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch benefits on component mount
  useEffect(() => {
    fetchBenefits();
  }, []);

  // GET request to fetch all benefits
  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const data = await fetchData<Benefit[]>('/benefits');
      setBenefits(data);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast.error('Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = (benefit: Benefit) => {
    setEditingId(benefit.id);
    setEditFormData({ ...benefit });
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                (name === 'order' ? parseInt(value) || 0 : value)
      });
    }
  };

  // PUT request to update benefit
  const handleUpdate = async () => {
    if (!editFormData) return;

    try {
      setLoading(true);
      
      // PUT request to update benefit
      const updatedBenefit = await putData<Benefit>(`/benefits/${editFormData.id}`, editFormData);
      
      // Update local state
      setBenefits(prev => 
        prev.map(benefit => 
          benefit.id === editFormData.id ? updatedBenefit : benefit
        )
      );
      
      setEditingId(null);
      setEditFormData(null);
      toast.success('Benefit updated successfully!');
    } catch (error) {
      console.error('Error updating benefit:', error);
      toast.error('Failed to update benefit');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  // DELETE request to remove benefit
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteData(`/benefits/${id}`);
      
      // Remove from local state
      setBenefits(prev => prev.filter(benefit => benefit.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Benefit deleted successfully!');
    } catch (error) {
      console.error('Error deleting benefit:', error);
      toast.error('Failed to delete benefit');
    } finally {
      setLoading(false);
    }
  };

  // Filter benefits based on search
  const filteredBenefits = benefits.filter(benefit =>
    benefit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    benefit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort benefits by order (if available)
  const sortedBenefits = [...filteredBenefits].sort((a, b) => {
    const orderA = a.order || 999;
    const orderB = b.order || 999;
    return orderA - orderB;
  });

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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Benefits Management</h1>
              <p className="text-gray-600">View, edit, and manage all benefits</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/benefit/add')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              + Add New Benefit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Benefits</h3>
            <p className="text-3xl font-bold">{benefits.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Active Benefits</h3>
            <p className="text-3xl font-bold">
              {benefits.filter(b => b.isActive).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Avg. Order</h3>
            <p className="text-3xl font-bold">
              {benefits.length > 0 
                ? Math.round(benefits.reduce((sum, b) => sum + (b.order || 0), 0) / benefits.length)
                : '0'
              }
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search benefits by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchBenefits}
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

        {/* Loading State */}
        {loading && benefits.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Benefits Table/List */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Benefit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBenefits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No benefits found matching your search' : 'No benefits found. Add your first benefit!'}
                      </td>
                    </tr>
                  ) : (
                    sortedBenefits.map((benefit) => (
                      <tr key={benefit.id} className="hover:bg-gray-50 transition">
                        {editingId === benefit.id ? (
                          // Edit Mode Row
                          <>
                            <td className="px-6 py-4">
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  name="title"
                                  value={editFormData?.title || ''}
                                  onChange={handleEditChange}
                                  className="w-full px-3 py-2 border rounded"
                                  placeholder="Benefit Title"
                                />
                                <textarea
                                  name="description"
                                  value={editFormData?.description || ''}
                                  onChange={handleEditChange}
                                  rows={2}
                                  className="w-full px-3 py-2 border rounded"
                                  placeholder="Description"
                                />
                                <input
                                  type="text"
                                  name="icon"
                                  value={editFormData?.icon || ''}
                                  onChange={handleEditChange}
                                  className="w-full px-3 py-2 border rounded"
                                  placeholder="Icon (optional)"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="isActive"
                                  checked={editFormData?.isActive || false}
                                  onChange={handleEditChange}
                                  className="mr-2 h-5 w-5"
                                />
                                Active
                              </label>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                name="order"
                                value={editFormData?.order || 0}
                                onChange={handleEditChange}
                                min="0"
                                className="w-20 px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {formatDate(benefit.updatedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdate}
                                  disabled={loading}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                                >
                                  {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode Row
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-start">
                                {benefit.icon && (
                                  <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    {benefit.icon.startsWith('http') ? (
                                      <img src={benefit.icon} alt="" className="h-5 w-5" />
                                    ) : (
                                      <span className="text-blue-600">
                                        <i className={benefit.icon}></i>
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                                  <div className="text-xs text-gray-400 mt-2">
                                    ID: {benefit.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                benefit.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {benefit.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {benefit.order || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {formatDate(benefit.updatedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(benefit)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(benefit.id)}
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
                Are you sure you want to delete this benefit? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
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

export default ViewBenefits;