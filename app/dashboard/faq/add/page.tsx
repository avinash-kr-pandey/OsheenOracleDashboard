"use client"

import React, { useState } from 'react';
import { postData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// FAQ type definition
interface FAQ {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive: boolean;
}

const AddFAQ = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FAQ>({
    question: '',
    answer: '',
    category: '',
    order: 0,
    isActive: true,
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'order' ? parseInt(value) || 0 : value)
    }));
  };

  // POST request to create new FAQ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and Answer are required');
      return;
    }

    try {
      setLoading(true);
      
      // POST request to create new FAQ
      const newFAQ = await postData<FAQ>('/faqs', formData);
      console.log('FAQ added successfully:', newFAQ);
      
      toast.success('FAQ added successfully!');
      
      // Reset form
      setFormData({
        question: '',
        answer: '',
        category: '',
        order: 0,
        isActive: true,
      });
      
      // Redirect to view page after success
      setTimeout(() => {
        router.push('/faqs/view');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error adding FAQ:', error);
      
      // Show detailed error
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to add FAQ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Add New FAQ</h1>
          <p className="text-gray-600">Create a new frequently asked question</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="e.g., What is your refund policy?"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Provide a detailed answer..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select a category</option>
                <option value="General">General</option>
                <option value="Billing">Billing & Payments</option>
                <option value="Technical">Technical Support</option>
                <option value="Account">Account Management</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-sm text-gray-500">
                FAQs with lower order numbers appear first
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
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-3 text-gray-700">
                <span className="font-medium">Active FAQ</span>
                <p className="text-sm text-gray-500">FAQ will be visible to users</p>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition ${
                  loading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Adding FAQ...
                  </span>
                ) : 'Add FAQ'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/faqs/view')}
                className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                View All FAQs
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FAQ Preview</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">Q</span>
                    </div>
                    <h4 className="font-bold text-lg text-gray-800">
                      {formData.question || 'Your question will appear here...'}
                    </h4>
                  </div>
                  
                  <div className="ml-11">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">A</span>
                      </div>
                      <h5 className="font-semibold text-gray-700">Answer:</h5>
                    </div>
                    <p className="text-gray-600 ml-11">
                      {formData.answer || 'Your answer will appear here...'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6 ml-11">
                    {formData.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {formData.category}
                      </span>
                    )}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                    {formData.order !== undefined && formData.order > 0 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
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
    </div>
  );
};

export default AddFAQ;