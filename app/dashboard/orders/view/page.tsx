"use client"

import React, { useState, useEffect } from 'react';
import { fetchData, putData, deleteData } from '@/utils/api';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Order type definition
interface Order {
  _id: string;
  productName: string;
  price: number;
  status: string;
  image?: string;
  quantity?: number;
  description?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API response type (because backend might return object instead of array)
interface ApiResponse {
  success?: boolean;
  data?: Order[];
  orders?: Order[];
  message?: string;
}

const ViewOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // GET request to fetch all orders (protected route)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchData<ApiResponse>('/orders');
      
      // DEBUG: Log the response to see structure
      console.log('Orders API Response:', response);
      
      // Extract orders array from different possible response structures
      let ordersArray: Order[] = [];
      
      if (Array.isArray(response)) {
        // Case 1: Direct array response
        ordersArray = response;
      } else if (response && typeof response === 'object') {
        // Case 2: Object with data/orders property
        if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (Array.isArray(response.orders)) {
          ordersArray = response.orders;
        } else if (response.success && response.data) {
          // Try to parse if data is string
          ordersArray = Array.isArray(response.data) ? response.data : [];
        }
      }
      
      console.log('Extracted orders:', ordersArray);
      
      if (!Array.isArray(ordersArray)) {
        console.error('Orders is not an array:', ordersArray);
        toast.error('Invalid data format received from server');
        setOrders([]);
        return;
      }
      
      setOrders(ordersArray);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // Check for authentication error
      if (error.response?.status === 401) {
        toast.error('Please login to view orders');
        router.push('/login');
        return;
      }
      
      toast.error('Failed to load orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string) => {
    if (!statusUpdate.trim()) {
      toast.error('Please select a status');
      return;
    }

    try {
      setLoading(true);
      
      // PUT request to update order status (protected route)
      await putData(`/orders/${orderId}/status`, { status: statusUpdate });
      
      // Update local state
      setOrders(prev => 
        Array.isArray(prev) ? 
        prev.map(order => 
          order._id === orderId ? { ...order, status: statusUpdate } : order
        ) : []
      );
      
      setEditingId(null);
      setStatusUpdate('');
      toast.success('Order status updated successfully!');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please login to update orders');
        router.push('/login');
        return;
      }
      
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // DELETE request to remove order (protected route)
  const handleDelete = async (orderId: string) => {
    try {
      setLoading(true);
      await deleteData(`/orders/${orderId}`);
      
      // Remove from local state
      setOrders(prev => 
        Array.isArray(prev) ? 
        prev.filter(order => order._id !== orderId) : []
      );
      setShowDeleteConfirm(null);
      toast.success('Order deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please login to delete orders');
        router.push('/login');
        return;
      }
      
      toast.error('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Calculate statistics (with safety checks)
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalRevenue = Array.isArray(orders) ? 
    orders.reduce((sum, order) => sum + (order.price * (order.quantity || 1)), 0) : 0;
  const pendingOrders = Array.isArray(orders) ? 
    orders.filter(o => o.status === 'pending').length : 0;
  const deliveredOrders = Array.isArray(orders) ? 
    orders.filter(o => o.status === 'delivered').length : 0;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Order Management</h1>
              <p className="text-gray-600">View and manage all customer orders</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/orders/add')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              + Create New Order
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Pending</h3>
            <p className="text-3xl font-bold">{pendingOrders}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <h3 className="text-sm font-semibold opacity-90 mb-1">Delivered</h3>
            <p className="text-3xl font-bold">{deliveredOrders}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by product name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <button
                onClick={fetchOrders}
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          /* Orders Table or Empty State */
          <div>
            {!Array.isArray(orders) ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Data Format Error</h3>
                <p className="text-red-600 mb-4">
                  The server returned data in an unexpected format.
                </p>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No orders found matching your criteria' 
                    : 'No orders found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try changing your search or filter criteria' 
                    : 'Create your first order to get started'}
                </p>
                <button
                  onClick={() => router.push('/dashboard/orders/add')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition"
                >
                  + Create New Order
                </button>
              </div>
            ) : (
              /* Orders Table */
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-amber-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {order.image ? (
                                <img 
                                  src={order.image} 
                                  alt={order.productName}
                                  className="h-12 w-12 rounded-lg object-cover mr-4"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mr-4">
                                  <span className="text-amber-600 font-bold">
                                    {order.productName?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.productName || 'Unnamed Product'}
                                </div>
                                {order.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {order.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900">
                                {formatCurrency(order.price || 0)} × {order.quantity || 1}
                              </div>
                              <div className="text-gray-500 mt-1">
                                ID: {order._id?.substring(0, 8) || 'N/A'}...
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {editingId === order._id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={statusUpdate}
                                  onChange={(e) => setStatusUpdate(e.target.value)}
                                  className="px-3 py-1.5 border rounded text-sm"
                                >
                                  <option value="">Select Status</option>
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleStatusUpdate(order._id)}
                                  disabled={loading || !statusUpdate}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setStatusUpdate('');
                                  }}
                                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || '')}`}>
                                  {(order.status || 'unknown').toUpperCase()}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingId(order._id);
                                    setStatusUpdate(order.status || '');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  title="Edit status"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency((order.price || 0) * (order.quantity || 1))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // View order details
                                  router.push(`/orders/${order._id}`);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(order._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this order? This action cannot be undone.
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
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOrders;