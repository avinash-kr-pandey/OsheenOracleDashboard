"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Reading Service type definition (aligned with your Add page)
interface ReadingService {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  features: string[];
  isActive: boolean;
  imageUrl?: string;
  popular?: boolean;
  whatsIncluded?: string[];
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const ViewReadingServices = () => {
  const router = useRouter();
  const [services, setServices] = useState<ReadingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created' | 'popular'>('created');
  
  // For editing
  const [editingService, setEditingService] = useState<ReadingService | null>(null);
  const [editFeatureInput, setEditFeatureInput] = useState('');
  const [editWhatsIncludedInput, setEditWhatsIncludedInput] = useState('');
  const [editBenefitsInput, setEditBenefitsInput] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Categories for filtering
  const categories = [
    'All',
    'Tarot Reading',
    'Love & Relationships',
    'Career & Finance',
    'Health & Wellness',
    'Spiritual Guidance',
    'Numerology',
    'Palm Reading',
    'Birth Chart Analysis',
    'Past Life Reading',
    'Dream Interpretation',
    'Other'
  ];

  // Fetch all services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await fetchData<ReadingService[]>('/reading-services');
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Get service ID (handles both _id and id)
  const getServiceId = (service: ReadingService): string => {
    return service._id || service.id || '';
  };

  // Handle service deletion
  const handleDelete = async (service: ReadingService) => {
    const serviceId = getServiceId(service);
    if (!serviceId) {
      toast.error('Service ID not found');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;

    try {
      await deleteData(`/reading-services/${serviceId}`);
      toast.success('Service deleted successfully');
      fetchServices(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  // Handle service update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const serviceId = getServiceId(editingService);
    if (!serviceId) {
      toast.error('Service ID not found');
      return;
    }

    try {
      setEditLoading(true);
      
      // Prepare payload
      const payload = {
        ...editingService,
        _id: undefined, // Remove _id from payload
        id: undefined,  // Remove id from payload
        whatsIncluded: editingService.whatsIncluded?.filter(item => item.trim()),
        benefits: editingService.benefits?.filter(item => item.trim()),
        features: editingService.features.filter(item => item.trim()),
      };

      await putData(`/reading-services/${serviceId}`, payload);
      toast.success('Service updated successfully');
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast.error(error.response?.data?.message || 'Failed to update service');
    } finally {
      setEditLoading(false);
    }
  };

  // Edit handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingService) return;
    const { name, value, type } = e.target;
    setEditingService(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    } : null);
  };

  const handleEditFeatureAdd = () => {
    if (!editingService) return;
    if (editFeatureInput.trim() && !editingService.features.includes(editFeatureInput.trim())) {
      setEditingService(prev => prev ? {
        ...prev,
        features: [...prev.features, editFeatureInput.trim()]
      } : null);
      setEditFeatureInput('');
    }
  };

  const handleEditFeatureRemove = (index: number) => {
    if (!editingService) return;
    setEditingService(prev => prev ? {
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    } : null);
  };

  const handleEditWhatsIncludedAdd = () => {
    if (!editingService) return;
    if (editWhatsIncludedInput.trim() && editingService.whatsIncluded && !editingService.whatsIncluded.includes(editWhatsIncludedInput.trim())) {
      setEditingService(prev => prev ? {
        ...prev,
        whatsIncluded: [...(prev.whatsIncluded || []), editWhatsIncludedInput.trim()]
      } : null);
      setEditWhatsIncludedInput('');
    }
  };

  const handleEditWhatsIncludedRemove = (index: number) => {
    if (!editingService) return;
    setEditingService(prev => prev ? {
      ...prev,
      whatsIncluded: prev.whatsIncluded?.filter((_, i) => i !== index)
    } : null);
  };

  const handleEditBenefitsAdd = () => {
    if (!editingService) return;
    if (editBenefitsInput.trim() && editingService.benefits && !editingService.benefits.includes(editBenefitsInput.trim())) {
      setEditingService(prev => prev ? {
        ...prev,
        benefits: [...(prev.benefits || []), editBenefitsInput.trim()]
      } : null);
      setEditBenefitsInput('');
    }
  };

  const handleEditBenefitsRemove = (index: number) => {
    if (!editingService) return;
    setEditingService(prev => prev ? {
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index)
    } : null);
  };

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      
      // Active filter
      const matchesActive = activeFilter === 'all' || 
        (activeFilter === 'active' && service.isActive) ||
        (activeFilter === 'inactive' && !service.isActive);
      
      return matchesSearch && matchesCategory && matchesActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
          return priceA - priceB;
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        case 'created':
        default:
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    popular: services.filter(s => s.popular).length,
    categories: new Set(services.map(s => s.category)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Service</h2>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingService.name}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={editingService.category}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editingService.description}
                    onChange={handleEditChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={editingService.price}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={editingService.duration}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editingService.imageUrl || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Features
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editFeatureInput}
                      onChange={(e) => setEditFeatureInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Add a key feature..."
                    />
                    <button
                      type="button"
                      onClick={handleEditFeatureAdd}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingService.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg"
                      >
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleEditFeatureRemove(index)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* What's Included */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's Included
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editWhatsIncludedInput}
                      onChange={(e) => setEditWhatsIncludedInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="e.g., Detailed PDF report"
                    />
                    <button
                      type="button"
                      onClick={handleEditWhatsIncludedAdd}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingService.whatsIncluded?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-lg"
                      >
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleEditWhatsIncludedRemove(index)}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benefits
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editBenefitsInput}
                      onChange={(e) => setEditBenefitsInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="e.g., Gain clarity on life decisions"
                    />
                    <button
                      type="button"
                      onClick={handleEditBenefitsAdd}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingService.benefits?.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg"
                      >
                        <span className="text-sm">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleEditBenefitsRemove(index)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editingService.isActive}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={editingService.popular}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Popular</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                      editLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {editLoading ? 'Updating...' : 'Update Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Reading Services</h1>
              <p className="text-gray-600 mt-2">Manage all astrology reading services</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchServices}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Refresh
              </button>
              <Link
                href="/dashboard/reading/readingservice/add"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg font-medium"
              >
                + Add New Service
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total Services</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Popular</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.popular}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Categories</div>
            <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="created">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price (Low to High)</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or add a new service</p>
            <Link
              href="/reading-services/add"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add Your First Service
            </Link>
          </div>
        ) : (
          <>
            {/* Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredServices.map((service) => (
                <div
                  key={getServiceId(service)}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                    service.popular ? 'border-yellow-300' : 'border-gray-200'
                  }`}
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 absolute top-4 right-4 rounded-full">
                      POPULAR
                    </div>
                  )}
                  
                  {/* Service Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{service.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                            {service.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            service.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{service.price}</div>
                        <div className="text-xs text-gray-500">{service.duration}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                  </div>
                  
                  {/* Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="p-5 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
                      <div className="space-y-1">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 3 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{service.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setEditingService(service)}
                        className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                      >
                        Edit
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/reading-services/${getServiceId(service)}`)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table View */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Services Table</h2>
                <span className="text-sm text-gray-500">
                  Showing {filteredServices.length} of {services.length} services
                </span>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredServices.map((service) => (
                        <tr key={getServiceId(service)} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                              </div>
                              {service.popular && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Popular
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                              {service.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {service.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {service.features?.length || 0} features
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingService(service)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(service)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => router.push(`/reading-services/${getServiceId(service)}`)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewReadingServices;