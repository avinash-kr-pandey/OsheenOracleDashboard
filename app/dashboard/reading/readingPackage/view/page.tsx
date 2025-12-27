"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Reading Package type definition based on your API response
interface ReadingPackage {
  _id: string;
  id: number;
  name: string;
  price: string;
  duration: string;
  features: string[];
  bestFor?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Helper function to safely extract array from API response
const extractArrayFromResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }
  
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    // Check for common response patterns
    const possibleKeys = ['data', 'packages', 'items', 'results', 'readingPackages'];
    
    for (const key of possibleKeys) {
      if (Array.isArray(obj[key])) {
        return obj[key] as T[];
      }
    }
  }
  
  console.warn('Could not extract array from response:', response);
  return [];
};

const ViewReadingPackages = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<ReadingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<ReadingPackage | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // GET request to fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      const response = await fetchData<unknown>('/reading-packages');
      
      console.log('API Response:', response);
      
      const packagesArray = extractArrayFromResponse<ReadingPackage>(response);
      
      console.log('Extracted packages:', packagesArray);
      
      setPackages(packagesArray);
      
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load reading packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = (pkg: ReadingPackage) => {
    setEditingId(pkg._id);
    setEditFormData({ ...pkg });
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  // Handle features in edit mode
  const handleEditFeatureAdd = () => {
    if (featureInput.trim() && editFormData && !editFormData.features.includes(featureInput.trim())) {
      setEditFormData({
        ...editFormData,
        features: [...editFormData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleEditFeatureRemove = (index: number) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        features: editFormData.features.filter((_, i) => i !== index)
      });
    }
  };

  // PUT request to update package
  const handleUpdate = async () => {
    if (!editFormData) return;

    try {
      setLoading(true);
      
      const updatedPackage = await putData<ReadingPackage>(
        `/reading-packages/${editFormData._id}`,
        editFormData
      );
      
      setPackages(prev => 
        prev.map(pkg => 
          pkg._id === editFormData._id ? updatedPackage : pkg
        )
      );
      
      setEditingId(null);
      setEditFormData(null);
      toast.success('Package updated successfully!');
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
    setFeatureInput('');
  };

  // DELETE request to remove package
  const handleDelete = async (packageId: string) => {
    try {
      setLoading(true);
      await deleteData(`/reading-packages/${packageId}`);
      
      setPackages(prev => prev.filter(pkg => pkg._id !== packageId));
      setShowDeleteConfirm(null);
      toast.success('Package deleted successfully!');
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    } finally {
      setLoading(false);
    }
  };

  // Filter packages based on search
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.bestFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.features.some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesSearch;
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Get package color based on price or ID
  const getPackageColor = (id: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-teal-500 to-teal-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
      'from-indigo-500 to-indigo-600',
      'from-emerald-500 to-emerald-600',
      'from-pink-500 to-pink-600'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Reading Packages</h1>
              <p className="text-gray-600">Professional astrology reading packages for your clients</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard/reading/readingPackage/add')}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
              >
                + Add New Package
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Packages</h3>
            <p className="text-3xl font-bold">{packages.length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Avg. Price</h3>
            <p className="text-3xl font-bold">
              {packages.length > 0 
                ? `₹${Math.round(packages.reduce((sum, p) => {
                    const priceNum = parseInt(p.price.replace('₹', '')) || 0;
                    return sum + priceNum;
                  }, 0) / packages.length)}`
                : '₹0'
              }
            </p>
          </div>
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Features</h3>
            <p className="text-3xl font-bold">
              {packages.reduce((sum, p) => sum + p.features.length, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Avg. Duration</h3>
            <p className="text-3xl font-bold">
              {packages.length > 0 
                ? packages[0].duration.split(' ')[0] + ' mins'
                : '0 mins'
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
                  placeholder="Search packages by name, features, or best for..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={fetchPackages}
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
        {loading && packages.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          /* Packages Display */
          <div>
            {filteredPackages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Packages Found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try changing your search criteria' 
                    : 'Add your first reading package to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    {/* Package Header with Gradient */}
                    <div className={`bg-gradient-to-r ${getPackageColor(pkg.id)} text-white p-6`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{pkg.price}</span>
                            <span className="text-white/80">• {pkg.duration}</span>
                          </div>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                          ID: {pkg.id}
                        </span>
                      </div>
                    </div>
                    
                    {/* Package Content */}
                    <div className="p-6">
                      {/* Best For */}
                      {pkg.bestFor && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-500 mb-1">Best For</h4>
                          <p className="text-gray-700">{pkg.bestFor}</p>
                        </div>
                      )}
                      
                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 mb-3">Features Included</h4>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Package Footer */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(pkg.updatedAt)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(pkg)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(pkg._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Left Section - Package Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${getPackageColor(pkg.id)} flex items-center justify-center`}>
                              <span className="text-white font-bold text-lg">₹</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-800 mb-1">{pkg.name}</h3>
                              <div className="flex items-center gap-4 text-gray-600">
                                <span className="font-semibold">{pkg.price}</span>
                                <span>•</span>
                                <span>{pkg.duration}</span>
                                <span>•</span>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">ID: {pkg.id}</span>
                              </div>
                              {pkg.bestFor && (
                                <p className="text-gray-600 mt-2">
                                  <span className="font-medium">Best for:</span> {pkg.bestFor}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Features in List View */}
                          <div className="ml-16">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Features:</h4>
                            <div className="flex flex-wrap gap-2">
                              {pkg.features.map((feature, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm"
                                >
                                  <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Section - Actions */}
                        <div className="flex flex-col gap-3">
                          <div className="text-xs text-gray-500 text-right">
                            Updated: {formatDate(pkg.updatedAt)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(pkg)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(pkg._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingId && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Package</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="text"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                      placeholder="₹499"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={editFormData.duration}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                      placeholder="30 minutes"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Best For</label>
                    <input
                      type="text"
                      name="bestFor"
                      value={editFormData.bestFor || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Quick insights and general guidance"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Add feature"
                    />
                    <button
                      type="button"
                      onClick={handleEditFeatureAdd}
                      className="px-4 py-3 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-lg"
                      >
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleEditFeatureRemove(index)}
                          className="text-teal-600 hover:text-teal-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6">
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
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this package? This action cannot be undone.
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
                  Delete Package
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReadingPackages;