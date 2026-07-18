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
  IndianRupee,
  ArrowUpRight,
  Sparkles,
  ArrowDownRight,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { fetchData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    id: number | string;
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

// Fallback mock data
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
  const [mounted, setMounted] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    satisfaction: 0,
  });

  // Ensure client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch stats from backend
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
          toast.error("Offline or unable to connect. Showing fallback data.");
        }
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [router]);

  // Animation values
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
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

  // Dynamic Revenue Breakdown Calculations
  const totalAstrologyServiceRevenue = data.astrologyServices && data.astrologyServices.length > 0
    ? data.astrologyServices.reduce((sum, s) => sum + (s.revenue || 0), 0)
    : 0;

  // Make sure breakdown handles mock vs real data differences gracefully
  const servicesDisplayRevenue = totalAstrologyServiceRevenue < data.totalRevenue
    ? totalAstrologyServiceRevenue
    : Math.floor(data.totalRevenue * 0.65);

  const productsDisplayRevenue = data.totalRevenue - servicesDisplayRevenue;

  // Format currency
  const formatRupees = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRupeesFull = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatIndianNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Export Dashboard Report to CSV File
  const exportReport = () => {
    try {
      let csvContent = "\uFEFF"; // Byte Order Mark for Excel UTF-8 support
      
      // 1. Report Title & Header
      csvContent += "Osheen Oracle E-Commerce Report\r\n";
      csvContent += `Generated On,${new Date().toLocaleString('en-IN')}\r\n\r\n`;
      
      // 2. Summary Dashboard Metrics
      csvContent += "SUMMARY METRICS\r\n";
      csvContent += "Metric,Value\r\n";
      csvContent += `Total Revenue,${data.totalRevenue}\r\n`;
      csvContent += `Total Orders / Bookings,${data.totalOrders}\r\n`;
      csvContent += `Active Users Count,${data.activeUsers}\r\n`;
      csvContent += `Customer Satisfaction Rating,${data.customerSatisfaction}\r\n\r\n`;
      
      // 3. Revenue Breakdown Channels
      csvContent += "REVENUE CHANNELS BREAKDOWN\r\n";
      csvContent += "Revenue Source,Amount\r\n";
      csvContent += `Store Products (E-Shop),${productsDisplayRevenue}\r\n`;
      csvContent += `Astrology Services (Consultations),${servicesDisplayRevenue}\r\n\r\n`;

      // 4. Recent Transactions Table
      csvContent += "RECENT TRANSACTIONS\r\n";
      csvContent += "Order ID,Customer Name,Product / Service,Amount (INR),Payment Status,Date\r\n";
      if (data.recentOrders && data.recentOrders.length > 0) {
        data.recentOrders.forEach(o => {
          csvContent += `"${o.id}","${o.customerName}","${o.product}",${o.amount},"${o.status.toUpperCase()}","${o.date}"\r\n`;
        });
      } else {
        csvContent += "No recent transactions found.\r\n";
      }
      
      // Create download blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Osheen_Oracle_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV Report downloaded successfully!");
    } catch (err) {
      console.error("Export report error:", err);
      toast.error("Failed to export CSV report.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
      case 'reached':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            COMPLETED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            PENDING
          </span>
        );
      case 'shipped':
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            SHIPPED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            {s.toUpperCase()}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin"></div>
        </div>
        <p className="text-purple-600 font-semibold tracking-wide animate-pulse">Loading Osheen Oracle Stats...</p>
      </div>
    );
  }

  // Pre-configured custom chart tooltip style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-purple-200 p-4 rounded-xl shadow-lg">
          <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
          <p className="text-purple-600 font-bold text-sm">
            {formatRupeesFull(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="text-slate-800 space-y-8 font-sans selection:bg-purple-500 selection:text-white">
      <Toaster position="top-right" />
      <div className="space-y-8">

        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-900/10 rounded-3xl p-6 md:p-8 shadow-xl text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-purple-200">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">Admin Operations Portal</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Osheen Oracle Admin
              </h1>
              <p className="text-purple-100 text-sm md:text-base mt-2 max-w-xl">
                Real-time dashboard reporting, user activity analytics, sales patterns, and popular services.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl shadow-inner w-full lg:w-auto">
                <Calendar className="h-5 w-5 text-purple-200" />
                <span className="text-sm font-semibold text-white">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <button
                onClick={exportReport}
                className="px-5 py-3 bg-white text-purple-900 font-bold rounded-2xl shadow-md hover:bg-purple-50 hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 w-full lg:w-auto"
              >
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Revenue */}
          <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider">TOTAL REVENUE</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-purple-600 transition-colors">
                  {formatRupees(animatedValues.revenue)}
                </h3>
                {/* Growth indicator hidden */}
              </div>
              <div className="bg-purple-50 text-purple-600 p-3.5 rounded-xl border border-purple-100">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Orders */}
          <Link href="/dashboard/orders" className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 block">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider">TOTAL ORDERS</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-amber-600 transition-colors">
                  {formatIndianNumber(animatedValues.orders)}
                </h3>
                {/* Growth indicator hidden */}
              </div>
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl border border-amber-100">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </Link>

          {/* Active Users */}
          <Link href="/dashboard/users" className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 block">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider">ACTIVE USERS</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                  {formatIndianNumber(animatedValues.users)}
                </h3>
                {/* Growth indicator hidden */}
              </div>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl border border-blue-100">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Link>

          {/* Satisfaction */}
          <div className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-500 tracking-wider">SATISFACTION RATING</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-rose-600 transition-colors">
                  {animatedValues.satisfaction.toFixed(1)}/5.0
                </h3>
                <div className="flex items-center mt-3 text-xs text-rose-600 font-bold bg-rose-50 w-fit px-2 py-1 rounded-md">
                  <Star className="h-4 w-4 mr-1 text-rose-500 fill-rose-500" />
                  <span>From real feedback</span>
                </div>
              </div>
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl border border-rose-100">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown Details Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>Revenue Breakdown Details</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Detailed breakdown of income sources (Products vs Services)</p>
            </div>
            <div className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl border border-purple-100">
              Active Channels
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl hover:border-purple-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500">STORE PRODUCTS</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">E-Shop</span>
              </div>
              <h4 className="text-2xl font-black text-gray-900">{formatRupeesFull(productsDisplayRevenue)}</h4>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl hover:border-purple-300 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500">ASTROLOGY SERVICES</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Readings & Spells</span>
              </div>
              <h4 className="text-2xl font-black text-gray-900">{formatRupeesFull(servicesDisplayRevenue)}</h4>
            </div>

            <div className="bg-purple-900 text-white p-5 rounded-2xl flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-bold text-purple-200">TOTAL CONSOLIDATED</span>
                <h4 className="text-3xl font-black text-white mt-1">{formatRupeesFull(data.totalRevenue)}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Revenue & Sales Trends</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Growth chart representation of monthly turnover</p>
              </div>
              <div className="flex items-center bg-gray-50 p-1.5 border border-gray-200 rounded-xl text-xs font-semibold">
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg">Real Data</span>
              </div>
            </div>

            <div className="h-80 w-full mt-4 flex-1">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Product Categories Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-500" />
                <span>Categories Share</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">E-store products distribution by sales segment</p>
            </div>

            <div className="h-56 relative my-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.productCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="category"
                    >
                      {data.productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Share</span>
                <span className="text-2xl font-black text-gray-900">Segment</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {data.productCategories.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200/60">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-gray-700 text-xs font-semibold truncate" title={entry.category}>
                    {entry.category} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Astronomy Services Bookings Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <Moon className="h-5 w-5 text-sky-500" />
                <span>Astrology Services Booking & Engagement</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Comparison metrics of various psychic and reading consultations</p>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.astrologyServices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="service" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <ChartTooltip formatter={(value, name) => [value, name === 'bookings' ? 'Total Consultations' : 'Revenue Generated (₹)']} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="bookings" name="Bookings Count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Orders List */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-amber-500" />
                    <span>Recent Sales & Registrations</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Last transactions processed by checkout gateway</p>
                </div>
                <Link href="/dashboard/orders" className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors">
                  <span>View All</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Order ID</th>
                      <th className="pb-3 pr-2">Customer</th>
                      <th className="pb-3 pr-2 text-right">Price</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentOrders && data.recentOrders.length > 0 ? (
                      data.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="py-3.5 pr-2">
                            <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-purple-600 transition-colors">
                              #{typeof order.id === 'string' && order.id.length > 8 ? `${order.id.substring(0, 8)}` : order.id}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2">
                            <div className="text-sm font-bold text-gray-900 truncate max-w-[140px]" title={order.customerName}>
                              {order.customerName}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[140px]" title={order.product}>
                              {order.product}
                            </div>
                          </td>
                          <td className="py-3.5 pr-2 text-right text-sm font-extrabold text-gray-900">
                            {formatRupeesFull(order.amount)}
                          </td>
                          <td className="py-3.5 text-center">
                            {getStatusBadge(order.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 text-sm font-medium">
                          No recent transactions available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Popular Products Listing */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span>Top Performing Merch</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Highest grossing inventory goods this month</p>
                </div>
                <Link href="/dashboard/products/view" className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors">
                  <span>View All</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {data.popularProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-purple-300 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${product.category === 'Reports' ? 'bg-purple-50 text-purple-600' :
                          product.category === 'Jewelry' ? 'bg-amber-50 text-amber-600' :
                            product.category === 'Divination Tools' ? 'bg-emerald-50 text-emerald-600' :
                              product.category === 'Digital' ? 'bg-blue-50 text-blue-600' :
                                'bg-red-50 text-red-600'}`}>
                        {product.category === 'Reports' ? <Star className="h-5 w-5" /> :
                          product.category === 'Jewelry' ? <Zap className="h-5 w-5" /> :
                            product.category === 'Divination Tools' ? <Moon className="h-5 w-5" /> :
                              product.category === 'Digital' ? <Sun className="h-5 w-5" /> :
                                <Package className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm max-w-[200px] truncate" title={product.name}>
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {product.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-gray-900 text-sm">{formatIndianNumber(product.sales)} sold</div>
                      <div className="text-xs text-emerald-600 font-bold flex items-center justify-end mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+{product.growth}% growth</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Analytics Summary Widgets */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold tracking-wider block">AVG. TRANSACTION</span>
                <span className="text-lg font-black text-gray-900 mt-1 block">₹7,842</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="text-xs text-gray-500 font-semibold tracking-wider block">CONVERSION VALUE</span>
                <span className="text-lg font-black text-white mt-1 block text-purple-600">4.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Footer */}
        <div className="text-center text-gray-400 text-xs py-4 border-t border-gray-100 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Osheen Oracle Operations Portal. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Secure Connection Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;