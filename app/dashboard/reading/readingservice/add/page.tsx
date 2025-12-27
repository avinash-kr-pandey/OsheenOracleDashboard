"use client"

import React, { useState } from 'react';
import { postData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Reading Service type definition
interface ReadingService {
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
}

const AddReadingService = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [whatsIncludedInput, setWhatsIncludedInput] = useState('');
  const [benefitsInput, setBenefitsInput] = useState('');
  const [formData, setFormData] = useState<ReadingService>({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    features: [],
    whatsIncluded: [],
    benefits: [],
    isActive: true,
    imageUrl: '',
    popular: false,
  });

  // Categories for reading services
  const categories = [
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle features array
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

  // Handle whatsIncluded array
  const handleWhatsIncludedAdd = () => {
    if (whatsIncludedInput.trim() && formData.whatsIncluded && !formData.whatsIncluded.includes(whatsIncludedInput.trim())) {
      setFormData(prev => ({
        ...prev,
        whatsIncluded: [...(prev.whatsIncluded || []), whatsIncludedInput.trim()]
      }));
      setWhatsIncludedInput('');
    }
  };

  const handleWhatsIncludedRemove = (index: number) => {
    if (formData.whatsIncluded) {
      setFormData(prev => ({
        ...prev,
        whatsIncluded: prev.whatsIncluded?.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle benefits array
  const handleBenefitsAdd = () => {
    if (benefitsInput.trim() && formData.benefits && !formData.benefits.includes(benefitsInput.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefitsInput.trim()]
      }));
      setBenefitsInput('');
    }
  };

  const handleBenefitsRemove = (index: number) => {
    if (formData.benefits) {
      setFormData(prev => ({
        ...prev,
        benefits: prev.benefits?.filter((_, i) => i !== index)
      }));
    }
  };

  // POST request to create new reading service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.category || !formData.price) {
      toast.error('Name, description, category, and price are required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload (remove empty arrays)
      const payload = {
        ...formData,
        whatsIncluded: formData.whatsIncluded?.filter(item => item.trim()),
        benefits: formData.benefits?.filter(item => item.trim()),
        features: formData.features.filter(item => item.trim()),
      };

      console.log('Creating service with payload:', payload);
      
      const newService = await postData<ReadingService>('/reading-services', payload);
      console.log('Service created successfully:', newService);
      
      toast.success('Reading service created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        features: [],
        whatsIncluded: [],
        benefits: [],
        isActive: true,
        imageUrl: '',
        popular: false,
      });
      setFeatureInput('');
      setWhatsIncludedInput('');
      setBenefitsInput('');
      
      // Redirect to view page after success
      setTimeout(() => {
        router.push('/reading-services/view');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating service:', error);
      
      // Show detailed error
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create reading service');
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Add New Reading Service</h1>
          <p className="text-gray-600">Create a new astrology reading service offering</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Tarot Card Reading"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
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
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Describe this reading service in detail..."
              />
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., ₹999, $49.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., 60 minutes, 30-45 mins"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="https://example.com/service-image.jpg"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Features
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="Add a key feature..."
                  />
                  <button
                    type="button"
                    onClick={handleFeatureAdd}
                    className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(index)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* What's Included */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={whatsIncludedInput}
                    onChange={(e) => setWhatsIncludedInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Detailed PDF report"
                  />
                  <button
                    type="button"
                    onClick={handleWhatsIncludedAdd}
                    className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {formData.whatsIncluded && formData.whatsIncluded.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.whatsIncluded.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleWhatsIncludedRemove(index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Gain clarity on life decisions"
                  />
                  <button
                    type="button"
                    onClick={handleBenefitsAdd}
                    className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                  >
                    Add
                  </button>
                </div>
                
                {formData.benefits && formData.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleBenefitsRemove(index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
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
                  <span className="font-medium">Active Service</span>
                  <p className="text-sm text-gray-500">Service will be available for booking</p>
                </label>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="popular" className="ml-3 text-gray-700">
                  <span className="font-medium">Popular Service</span>
                  <p className="text-sm text-gray-500">Mark as popular (will be highlighted)</p>
                </label>
              </div>
            </div>

            {/* Service Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-3">Service Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Service:</div>
                <div className="font-medium">{formData.name || 'Not set'}</div>
                
                <div className="text-gray-600">Category:</div>
                <div className="font-medium">{formData.category || 'Not set'}</div>
                
                <div className="text-gray-600">Price:</div>
                <div className="font-bold text-green-600">{formData.price || 'Not set'}</div>
                
                <div className="text-gray-600">Duration:</div>
                <div className="font-medium">{formData.duration || 'Not specified'}</div>
                
                <div className="text-gray-600">Features:</div>
                <div className="font-medium">{formData.features.length} added</div>
                
                <div className="text-gray-600">Status:</div>
                <div className="font-medium">{formData.isActive ? 'Active' : 'Inactive'}</div>
              </div>
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
                    Creating Service...
                  </span>
                ) : 'Create Service'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/reading/readingservice/view')}
                className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                View All Services
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Preview</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-2xl text-gray-800 mb-2">
                    {formData.name || 'Service Name'}
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                      {formData.category || 'Category'}
                    </span>
                    {formData.popular && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{formData.price || 'Price'}</div>
                  <div className="text-gray-500">{formData.duration || 'Duration'}</div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                {formData.description || 'Service description will appear here...'}
              </p>
              
              {formData.features.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Key Features:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.whatsIncluded && formData.whatsIncluded.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">What's Included:</h5>
                    <ul className="space-y-2">
                      {formData.whatsIncluded.map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {formData.benefits && formData.benefits.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">Benefits:</h5>
                    <ul className="space-y-2">
                      {formData.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
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

export default AddReadingService;