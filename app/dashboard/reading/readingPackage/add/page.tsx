"use client"

import React, { useState } from 'react';
import { postData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Reading Package type definition
interface ReadingPackage {
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  discount?: number;
  popular?: boolean;
}

const AddReadingPackage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [formData, setFormData] = useState<ReadingPackage>({
    name: '',
    description: '',
    price: 0,
    duration: '',
    features: [],
    isActive: true,
    discount: 0,
    popular: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFeatureAdd = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleFeatureRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFeatureAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
      toast.error('Name, description, and valid price are required');
      return;
    }

    try {
      setLoading(true);
      
      const newPackage = await postData<ReadingPackage>('/reading-packages', formData);
      console.log('Package created successfully:', newPackage);
      
      toast.success('Reading package created successfully!');
      
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: '',
        features: [],
        isActive: true,
        discount: 0,
        popular: false,
      });
      setFeatureInput('');
      
      setTimeout(() => {
        router.push('/reading-packages/view');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating package:', error);
      
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create package');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (formData.discount && formData.discount > 0) {
      return formData.price - (formData.price * formData.discount) / 100;
    }
    return formData.price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Add New Reading Package</h1>
          <p className="text-gray-600">Create a new astrology reading package</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Basic Reading, Premium Horoscope"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Describe what this package includes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., 30 days, 6 months, 1 year"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (Add each feature separately)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={handleFeatureKeyPress}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Daily Horoscope, Career Prediction"
                  />
                  <button
                    type="button"
                    onClick={handleFeatureAdd}
                    className="px-4 py-3 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleFeatureRemove(index)}
                            className="text-teal-600 hover:text-teal-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="isActive" className="ml-3 text-gray-700">
                  <span className="font-medium">Active Package</span>
                  <p className="text-sm text-gray-500">Package will be available for purchase</p>
                </label>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleChange}
                  className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="popular" className="ml-3 text-gray-700">
                  <span className="font-medium">Popular Package</span>
                  <p className="text-sm text-gray-500">Mark as popular (will be highlighted)</p>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-800 mb-3">Price Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Original Price:</div>
                <div className="font-medium">${formData.price.toFixed(2)}</div>
                
                {formData.discount && formData.discount > 0 && (
                  <>
                    <div className="text-gray-600">Discount:</div>
                    <div className="font-medium text-red-600">{formData.discount}%</div>
                    
                    <div className="text-gray-600">Discounted Price:</div>
                    <div className="font-bold text-lg text-green-600">
                      ${calculateDiscountedPrice().toFixed(2)}
                    </div>
                    
                    <div className="text-gray-600">You Save:</div>
                    <div className="font-medium text-green-600">
                      ${(formData.price - calculateDiscountedPrice()).toFixed(2)}
                    </div>
                  </>
                )}
                
                <div className="text-gray-600">Duration:</div>
                <div className="font-medium">{formData.duration || 'Not set'}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition ${
                  loading 
                    ? 'bg-teal-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating Package...
                  </span>
                ) : 'Create Package'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/reading/readingPackage/view')}
                className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                View All Packages
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Preview</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-xl text-gray-800 mb-2">
                    {formData.name || 'Package Name'}
                  </h4>
                  <p className="text-gray-600">
                    {formData.description || 'Package description will appear here...'}
                  </p>
                </div>
                {formData.popular && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    POPULAR
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  {formData.discount && formData.discount > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        ${calculateDiscountedPrice().toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${formData.price.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                        {formData.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      ${formData.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-gray-500">/ {formData.duration || 'duration'}</span>
                </div>
              </div>
              
              {formData.features.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Features Included:</h5>
                  <ul className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReadingPackage;