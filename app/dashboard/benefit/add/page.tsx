"use client"

import React, { useState } from 'react';
import { postData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Benefit type definition
interface Benefit {
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
  order?: number;
}

const AddBenefit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Benefit>({
    title: '',
    description: '',
    icon: '',
    isActive: true,
    order: 0,
  });

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
      
      // POST request to create new benefit
      const newBenefit = await postData<Benefit>('/benefits', formData);
      console.log('Benefit added successfully:', newBenefit);
      
      toast.success('Benefit added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        icon: '',
        isActive: true,
        order: 0,
      });
      
      // Redirect to view page after success
      setTimeout(() => {
        router.push('/benefits/view');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error adding benefit:', error);
      
      // Show detailed error
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to add benefit');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Add New Benefit</h1>
          <p className="text-gray-600">Create a new benefit for your platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
                placeholder="e.g., 24/7 Customer Support"
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
                placeholder="e.g., fa-support or https://example.com/icon.svg"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">fa-user</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">fa-star</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">fa-check</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">fa-shield</span>
              </div>
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
              <p className="mt-1 text-sm text-gray-500">
                Benefits with lower order numbers appear first
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="ml-3 text-gray-700">
                <span className="font-medium">Active Benefit</span>
                <p className="text-sm text-gray-500">Benefit will be visible to users</p>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition ${
                  loading 
                    ? 'bg-purple-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Adding Benefit...
                  </span>
                ) : 'Add Benefit'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/benefit/view')}
                className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                View All Benefits
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Benefit Preview</h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-start gap-4">
              {formData.icon && (
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow">
                  {formData.icon.startsWith('http') ? (
                    <img src={formData.icon} alt="icon" className="h-6 w-6" />
                  ) : (
                    <span className="text-purple-600 text-xl">
                      <i className={formData.icon}></i>
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-800 mb-1">
                  {formData.title || 'Benefit Title'}
                </h4>
                <p className="text-gray-600">
                  {formData.description || 'Benefit description will appear here...'}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    formData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                  {formData.order !== undefined && formData.order > 0 && (
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      Order: {formData.order}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBenefit;