"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Star,
  Moon,
  Sun,
  Zap,
  Package,
  Calendar,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { fetchData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

// Dashboard data structure with INR values
export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  customerSatisfaction: number;
  popularProducts: {
    id: number;
    name: string;
    category: string;
    sales: number;
    growth: number;
  }[];
  recentOrders: {
    id: number;
    customerName: string;
    product: string;
    amount: number;
    status: 'pending' | 'completed' | 'shipped';
    date: string;
  }[];
  salesOverTime: {
    month: string;
    sales: number;
  }[];
  productCategories: {
    category: string;
    value: number;
    color: string;
  }[];
  astrologyServices: {
    service: string;
    bookings: number;
    revenue: number;
  }[];
}

// Updated mock data with INR values
export const dashboardData: DashboardData = {
  totalRevenue: 4523189,
  totalOrders: 2345,
  activeUsers: 5678,
  customerSatisfaction: 4.8,
  popularProducts: [
    { id: 1, name: "Personal Horoscope Report", category: "Reports", sales: 456, growth: 12 },
    { id: 2, name: "Zodiac Birthstone Ring", category: "Jewelry", sales: 389, growth: 8 },
    { id: 3, name: "Tarot Card Deck (Premium)", category: "Divination Tools", sales: 321, growth: 23 },
    { id: 4, name: "Astrology E-book Bundle", category: "Digital", sales: 287, growth: 5 },
    { id: 5, name: "Planetary Alignment Pendant", category: "Jewelry", sales: 265, growth: 15 },
  ],
  recentOrders: [
    { id: 1001, customerName: "Alex Johnson", product: "Yearly Horoscope", amount: 8999, status: "completed", date: "2023-10-15" },
    { id: 1002, customerName: "Maria Garcia", product: "Tarot Reading", amount: 4999, status: "pending", date: "2023-10-14" },
    { id: 1003, customerName: "David Smith", product: "Birth Chart Analysis", amount: 12999, status: "shipped", date: "2023-10-14" },
    { id: 1004, customerName: "Lisa Wong", product: "Zodiac Bracelet", amount: 6550, status: "completed", date: "2023-10-13" },
    { id: 1005, customerName: "Robert Chen", product: "Astrology Course", amount: 19999, status: "completed", date: "2023-10-12" },
    { id: 1006, customerName: "Sarah Miller", product: "Celestial Candle Set", amount: 4299, status: "pending", date: "2023-10-12" },
    { id: 1007, customerName: "James Wilson", product: "Moon Phase Calendar", amount: 2999, status: "shipped", date: "2023-10-11" },
  ],
  salesOverTime: [
    { month: "Jan", sales: 1200000 },
    { month: "Feb", sales: 1900000 },
    { month: "Mar", sales: 1500000 },
    { month: "Apr", sales: 2200000 },
    { month: "May", sales: 1800000 },
    { month: "Jun", sales: 2400000 },
    { month: "Jul", sales: 2100000 },
    { month: "Aug", sales: 2800000 },
    { month: "Sep", sales: 3200000 },
    { month: "Oct", sales: 4523189 },
  ],
  productCategories: [
    { category: "Reports", value: 35, color: "#8B5CF6" },
    { category: "Jewelry", value: 25, color: "#F59E0B" },
    { category: "Divination Tools", value: 20, color: "#10B981" },
    { category: "Digital", value: 15, color: "#3B82F6" },
    { category: "Courses", value: 5, color: "#EF4444" },
  ],
  astrologyServices: [
    { service: "Birth Chart Reading", bookings: 342, revenue: 2565000 },
    { service: "Tarot Reading", bookings: 567, revenue: 2835000 },
    { service: "Yearly Forecast", bookings: 289, revenue: 2601000 },
    { service: "Compatibility Analysis", bookings: 178, revenue: 1602000 },
    { service: "Career Guidance", bookings: 231, revenue: 2079000 },
  ],
};

const Dashboard = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(dashboardData);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    satisfaction: 0,
  });

  // Fetch real statistics from backend
  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const response = await fetchData<{ success: boolean; data: DashboardData }>('/admin/dashboard-stats');
        if (response && response.success && response.data) {
          setData(response.data);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard statistics:", error);
        if (error.response?.status === 401) {
          toast.error("Please login to view dashboard");
          router.push("/login");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Admin privileges required.");
          router.push("/login");
        } else {
          toast.error("Failed to connect to backend server. Showing offline data.");
        }
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [router]);

  // Animation for counter values
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    
    const counters = {
      revenue: data.totalRevenue,
      orders: data.totalOrders,
      users: data.activeUsers,
      satisfaction: data.customerSatisfaction,
    };
    
    const incrementValues = {
      revenue: counters.revenue / steps,
      orders: Math.ceil(counters.orders / steps),
      users: Math.ceil(counters.users / steps),
      satisfaction: counters.satisfaction / steps,
    };
    
    const currentValues = {
      revenue: 0,
      orders: 0,
      users: 0,
      satisfaction: 0,
    };
    
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      currentValues.revenue += incrementValues.revenue;
      currentValues.orders += incrementValues.orders;
      currentValues.users += incrementValues.users;
      currentValues.satisfaction += incrementValues.satisfaction;
      
      setAnimatedValues({
        revenue: Math.min(currentValues.revenue, counters.revenue),
        orders: Math.min(currentValues.orders, counters.orders),
        users: Math.min(currentValues.users, counters.users),
        satisfaction: Math.min(currentValues.satisfaction, counters.satisfaction),
      });
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          revenue: counters.revenue,
          orders: counters.orders,
          users: counters.users,
          satisfaction: counters.satisfaction,
        });
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [data]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency in Indian Rupees with Indian numbering system
  const formatRupees = (amount: number) => {
    // For large amounts, show in lakhs or crores
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    
    // Indian numbering system: 1,23,456 instead of 123,456
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format rupees with full precision (for tables)
  const formatRupeesFull = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format numbers in Indian style (1,23,456)
  const formatIndianNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Calculate max sales for chart scaling
  const maxSales = data.salesOverTime && data.salesOverTime.length > 0
    ? Math.max(...data.salesOverTime.map(item => item.sales))
    : 100000;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        <p className="text-purple-900 font-medium animate-pulse">Connecting to Cosmic energy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Cosmic Insights Dashboard</h1>
              <p className="text-gray-600 mt-2">Your astrology e-commerce analytics & management portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Oct 15, 2023</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">{formatRupees(animatedValues.revenue)}</h3>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="text-sm">+12.5% from last month</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <IndianRupee className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">{formatIndianNumber(animatedValues.orders)}</h3>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="text-sm">+8.2% from last month</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <ShoppingCart className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cyan-100">Active Users</p>
                <h3 className="text-3xl font-bold mt-2">{formatIndianNumber(animatedValues.users)}</h3>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="text-sm">+15.3% from last month</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Satisfaction Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100">Customer Satisfaction</p>
                <h3 className="text-3xl font-bold mt-2">{animatedValues.satisfaction.toFixed(1)}/5.0</h3>
                <div className="flex items-center mt-4">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="text-sm">Based on 1,245 reviews</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Star className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-lg">Monthly</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Quarterly</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Yearly</button>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-2 mt-8">
              {data.salesOverTime.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ 
                      height: `${(item.sales / maxSales) * 80}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  ></div>
                  <span className="text-sm text-gray-600 mt-2">{item.month}</span>
                  <span className="text-xs text-gray-500">{formatRupees(item.sales)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Categories Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Categories</h2>
            <div className="space-y-4">
              {data.productCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${category.value}%`,
                          backgroundColor: category.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Astrology Services Performance</h3>
              {data.astrologyServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    {index % 2 === 0 ? (
                      <Moon className="h-4 w-4 text-purple-500 mr-2" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    <span className="text-gray-700 text-sm">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-medium">{formatIndianNumber(service.bookings)} bookings</div>
                    <div className="text-gray-500 text-xs">{formatRupees(service.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Orders and Popular Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-600 font-medium">Order ID</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Customer</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Amount</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">#{order.id}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.product}</div>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-gray-900">{formatRupeesFull(order.amount)}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Popular Products</h2>
              <button className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {data.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-300">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${product.category === 'Reports' ? 'bg-purple-100 text-purple-600' : 
                      product.category === 'Jewelry' ? 'bg-amber-100 text-amber-600' : 
                      product.category === 'Divination Tools' ? 'bg-emerald-100 text-emerald-600' : 
                      product.category === 'Digital' ? 'bg-blue-100 text-blue-600' : 
                      'bg-red-100 text-red-600'}`}>
                      {product.category === 'Reports' ? <Star className="h-5 w-5" /> : 
                       product.category === 'Jewelry' ? <Zap className="h-5 w-5" /> : 
                       product.category === 'Divination Tools' ? <Moon className="h-5 w-5" /> : 
                       product.category === 'Digital' ? <Sun className="h-5 w-5" /> : 
                       <Package className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatIndianNumber(product.sales)} sales</div>
                    <div className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{product.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Avg. Order Value</div>
                    <div className="text-xl font-bold text-gray-900">{formatRupees(7842)}</div>
                  </div>
                  <IndianRupee className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                    <div className="text-xl font-bold text-gray-900">4.8%</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Cosmic Insights Dashboard • Data updates in real-time • Last updated: Today at 14:30</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;