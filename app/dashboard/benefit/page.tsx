"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, postData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';

// Benefit type definition
interface Benefit {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
  order?: number;
}

const BenefitPage = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Benefit>({
    title: '',
    description: '',
    icon: '',
    isActive: true,
    order: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch benefits on component mount
  useEffect(() => {
    fetchBenefits();
  }, []);

  // GET request to fetch benefits
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'order' ? parseInt(value) || 0 : value)
    }));
  };

  // POST request to create new benefit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // PUT request to update benefit
        await putData(`/benefits/${editingId}`, formData);
        toast.success('Benefit updated successfully!');
        
        // Update local state
        setBenefits(prev => 
          prev.map(benefit => 
            benefit.id === editingId ? { ...formData, id: editingId } : benefit
          )
        );
        
        setEditingId(null);
      } else {
        // POST request to create new benefit
        const newBenefit = await postData<Benefit>('/benefits', formData);
        toast.success('Benefit added successfully!');
        
        // Add to local state
        setBenefits(prev => [...prev, newBenefit]);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        icon: '',
        isActive: true,
        order: 0,
      });
      
    } catch (error) {
      console.error('Error saving benefit:', error);
      toast.error('Failed to save benefit');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (benefit: Benefit) => {
    setEditingId(benefit.id || null);
    setFormData({
      title: benefit.title,
      description: benefit.description,
      icon: benefit.icon || '',
      isActive: benefit.isActive,
      order: benefit.order || 0,
    });
    
    // Scroll to form
    document.getElementById('benefit-form')?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Benefits Management</h1>
          <p className="text-gray-600">Add, edit, and manage benefits for your platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Add/Edit Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8" id="benefit-form">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId ? 'Edit Benefit' : 'Add New Benefit'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefit Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 24/7 Support"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Describe the benefit in detail..."
                  />
                </div>

                {/* Icon (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Optional)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., fa-support, https://example.com/icon.svg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can use Font Awesome classes or image URLs
                  </p>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Benefit is active and visible
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-white transition ${
                      loading 
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        {editingId ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      editingId ? 'Update Benefit' : 'Add Benefit'
                    )}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          description: '',
                          icon: '',
                          isActive: true,
                          order: 0,
                        });
                      }}
                      className="w-full mt-3 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-purple-700 mb-1">Total Benefits</h3>
                <p className="text-2xl font-bold text-gray-800">{benefits.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-green-700 mb-1">Active Benefits</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {benefits.filter(b => b.isActive).length}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits List */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Benefits</h2>
                <button
                  onClick={fetchBenefits}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {loading && benefits.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : benefits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Benefits Yet</h3>
                  <p className="text-gray-500">Add your first benefit using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className={`p-4 rounded-lg border transition ${
                        benefit.isActive 
                          ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {benefit.icon && (
                              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                {benefit.icon.startsWith('http') ? (
                                  <img src={benefit.icon} alt="" className="h-5 w-5" />
                                ) : (
                                  <span className="text-purple-600 text-sm">
                                    <i className={benefit.icon}></i>
                                  </span>
                                )}
                              </div>
                            )}
                            <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              benefit.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {benefit.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {benefit.order !== undefined && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Order: {benefit.order}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                          <div className="text-xs text-gray-500">
                            ID: {benefit.id}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(benefit)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(benefit.id || '')}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
  );
};

export default BenefitPage;