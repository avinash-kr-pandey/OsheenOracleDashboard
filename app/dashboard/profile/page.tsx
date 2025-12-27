"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiEdit,
  FiSave,
  FiX,
  FiLock,
  FiShield,
  FiGlobe,
  FiCreditCard,
  FiBell,
  FiStar,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiPackage
} from 'react-icons/fi';
import { fetchData } from '@/utils/api';
import { Toaster, toast } from 'react-hot-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;  // Optional
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'suspended';  // Optional
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    darkMode: boolean;
    language: string;
  };
  subscription?: {
    plan: string;
    status: 'active' | 'expired' | 'cancelled';
    expiresAt: string;
    features: string[];
  };
  stats?: {
    totalOrders: number;
    totalSpent: number;
    joinedDaysAgo: number;
    lastActivity: string;
  };
}

interface Address {
  _id?: string;  // Optional
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
  type?: 'home' | 'work' | 'other';
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchData<UserProfile>('/auth/profile');
      setUser(data);
      setEditData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
      
      // Set default data for testing
      const defaultUser: UserProfile = {
        _id: 'demo-id',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'User',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addresses: [],
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          joinedDaysAgo: 1,
          lastActivity: new Date().toISOString()
        }
      };
      setUser(defaultUser);
      setEditData({
        name: defaultUser.name,
        email: defaultUser.email,
        phone: defaultUser.phone || '',
      });
      
      // Redirect to login if unauthorized
      if (error?.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = await fetchData<UserProfile>('/auth/profile', {
        method: 'PUT',
        data: editData,
      });
      setUser(updatedData);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Safe format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  // Safe format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Safe get status color
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-green-500';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  // Safe get status text
  const getStatusText = (status?: string) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Safe get role text
  const getRoleText = (role?: string) => {
    if (!role) return 'User';
    return role;
  };

  // Safe get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  // Safe get year from date
  const getYearFromDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load user profile</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-xl">
                    {getUserInitials()}
                  </div>
                  <div className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    {getRoleText(user.role)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    user.status === 'inactive' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {getStatusText(user.status)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  Member since {getYearFromDate(user.createdAt)}
                </p>

          
              </div>
            </div>


          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-500" />
                  Personal Information
                </h3>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-800 dark:text-white">{user.name}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-800 dark:text-white">{user.email}</p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-800 dark:text-white">{user.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Role
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-white font-medium">{getRoleText(user.role)}</p>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Account Created
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Updated
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-800 dark:text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-green-500" />
                  Saved Addresses
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address, index) => (
                    <div 
                      key={address._id || index}
                      className={`p-4 rounded-lg border ${
                        address.isDefault 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            address.type === 'home' ? 'bg-green-500' :
                            address.type === 'work' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></span>
                          <span className="font-medium text-gray-800 dark:text-white capitalize">
                            {address.type || 'Address'} {address.isDefault && '(Default)'}
                          </span>
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{address.street || 'No street'}</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {address.city || 'No city'}, {address.state || 'No state'} {address.zipCode || ''}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">{address.country || 'No country'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-end">
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
};

export default Profile;