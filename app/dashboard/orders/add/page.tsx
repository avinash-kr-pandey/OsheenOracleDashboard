"use client"

import React, { useState } from 'react';
import { postData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Order type definition
interface Order {
  productName: string;
  price: number;
  status: string;
  image?: string;
  quantity?: number;
  description?: string;
}

const AddOrder = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Order>({
    productName: '',
    price: 0,
    status: 'pending',
    image: '',
    quantity: 1,
    description: '',
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // POST request to create new order (JWT token required)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || formData.price <= 0) {
      toast.error('Product name and valid price are required');
      return;
    }

    try {
      setLoading(true);
      
      // POST request to create new order (protected route)
      const newOrder = await postData<Order>('/orders', formData);
      console.log('Order created successfully:', newOrder);
      
      toast.success('Order created successfully!');
      
      // Reset form
      setFormData({
        productName: '',
        price: 0,
        status: 'pending',
        image: '',
        quantity: 1,
        description: '',
      });
      
      // Redirect to view page after success
      setTimeout(() => {
        router.push('/orders/view');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Check for authentication error
      if (error.response?.status === 401) {
        toast.error('Please login to create orders');
        router.push('/login');
        return;
      }
      
      // Show detailed error
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Create New Order</h1>
          <p className="text-gray-600">Add a new order to the system</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="e.g., iPhone 15 Pro Max"
              />
            </div>

            {/* Price and Quantity */}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="https://example.com/product-image.jpg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="Add any additional details about the order..."
              />
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-3">Order Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Product:</div>
                <div className="font-medium">{formData.productName || 'N/A'}</div>
                
                <div className="text-gray-600">Quantity:</div>
                <div className="font-medium">{formData.quantity}</div>
                
                <div className="text-gray-600">Price per unit:</div>
                <div className="font-medium">${formData.price.toFixed(2)}</div>
                
                <div className="text-gray-600">Total Amount:</div>
                <div className="font-bold text-lg text-green-600">
                  ${((formData.price || 0) * (formData.quantity || 1)).toFixed(2)}
                </div>
                
                <div className="text-gray-600">Status:</div>
                <div className="font-medium capitalize">{formData.status}</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition ${
                  loading 
                    ? 'bg-amber-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating Order...
                  </span>
                ) : 'Create Order'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/orders/view')}
                className="py-3 px-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                View All Orders
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;