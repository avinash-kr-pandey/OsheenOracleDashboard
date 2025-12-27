"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// FAQ type definition
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ViewFAQs = () => {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<FAQ | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  // GET request to fetch all FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await fetchData<FAQ[]>('/faqs');
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditFormData({ ...faq });
    setExpandedId(faq.id);
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                (name === 'order' ? parseInt(value) || 0 : value)
      });
    }
  };

  // PUT request to update FAQ
  const handleUpdate = async () => {
    if (!editFormData) return;

    try {
      setLoading(true);
      
      // PUT request to update FAQ
      const updatedFAQ = await putData<FAQ>(`/faqs/${editFormData.id}`, editFormData);
      
      // Update local state
      setFaqs(prev => 
        prev.map(faq => 
          faq.id === editFormData.id ? updatedFAQ : faq
        )
      );
      
      setEditingId(null);
      setEditFormData(null);
      setExpandedId(null);
      toast.success('FAQ updated successfully!');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
    setExpandedId(null);
  };

  // DELETE request to remove FAQ
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteData(`/faqs/${id}`);
      
      // Remove from local state
      setFaqs(prev => prev.filter(faq => faq.id !== id));
      setShowDeleteConfirm(null);
      toast.success('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    } finally {
      setLoading(false);
    }
  };

  // Toggle FAQ expansion
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get unique categories from FAQs
  const categories = ['all', ...new Set(faqs.filter(f => f.category).map(f => f.category))] as string[];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      (selectedCategory === 'uncategorized' && !faq.category) ||
      faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort FAQs by order (if available)
  const sortedFaqs = [...filteredFaqs].sort((a, b) => {
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
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">FAQ Management</h1>
              <p className="text-gray-600">Manage frequently asked questions</p>
            </div>
            <button
              onClick={() => router.push('/faqs/add')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              + Add New FAQ
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total FAQs</h3>
            <p className="text-3xl font-bold">{faqs.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Active FAQs</h3>
            <p className="text-3xl font-bold">
              {faqs.filter(f => f.isActive).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Categories</h3>
            <p className="text-3xl font-bold">
              {categories.length - 1}
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Avg. Length</h3>
            <p className="text-3xl font-bold">
              {faqs.length > 0 
                ? Math.round(faqs.reduce((sum, f) => sum + f.answer.length, 0) / faqs.length / 100) + 'k'
                : '0'
              }
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQs by question, answer, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : 
                     category === 'uncategorized' ? 'Uncategorized' : category}
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchFAQs}
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
        {loading && faqs.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* FAQs List */
          <div className="space-y-4">
            {sortedFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No FAQs Found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try changing your search or filter criteria' 
                    : 'Add your first FAQ to get started'}
                </p>
              </div>
            ) : (
              sortedFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow overflow-hidden">
                  {editingId === faq.id ? (
                    // Edit Mode
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                          <input
                            type="text"
                            name="question"
                            value={editFormData?.question || ''}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>
                          <textarea
                            name="answer"
                            value={editFormData?.answer || ''}
                            onChange={handleEditChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                              name="category"
                              value={editFormData?.category || ''}
                              onChange={handleEditChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                              <option value="">Select category</option>
                              <option value="General">General</option>
                              <option value="Billing">Billing</option>
                              <option value="Technical">Technical</option>
                              <option value="Account">Account</option>
                              <option value="Services">Services</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                            <input
                              type="number"
                              name="order"
                              value={editFormData?.order || 0}
                              onChange={handleEditChange}
                              min="0"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          
                          <div className="flex items-center justify-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={editFormData?.isActive || false}
                                onChange={handleEditChange}
                                className="h-5 w-5 text-indigo-600 rounded mr-2"
                              />
                              <span className="text-gray-700">Active</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => toggleExpand(faq.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">Q</span>
                              </div>
                              <h3 className="font-bold text-gray-800 text-lg">{faq.question}</h3>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 ml-14 mb-3">
                              {faq.category && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {faq.category}
                                </span>
                              )}
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                faq.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {faq.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {faq.order !== undefined && faq.order > 0 && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                  Order: {faq.order}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500 ml-14">
                              Last updated: {formatDate(faq.updatedAt)} • ID: {faq.id}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(faq);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(faq.id);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(faq.id);
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <svg 
                                className={`w-5 h-5 transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Answer */}
                      {expandedId === faq.id && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-lg">A</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-700 mb-3">Answer:</h4>
                              <div className="prose max-w-none">
                                <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this FAQ? This action cannot be undone.
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

export default ViewFAQs;