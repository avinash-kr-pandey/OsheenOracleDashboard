"use client";

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  DollarSign,
  Smartphone,
  Globe,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

// Analytics data
const analyticsData = {
  monthlyRevenue: [
    { month: 'Jan', revenue: 12.5, growth: 5.2 },
    { month: 'Feb', revenue: 18.3, growth: 8.7 },
    { month: 'Mar', revenue: 15.8, growth: 3.4 },
    { month: 'Apr', revenue: 22.1, growth: 12.5 },
    { month: 'May', revenue: 18.7, growth: -2.1 },
    { month: 'Jun', revenue: 24.3, growth: 15.8 },
    { month: 'Jul', revenue: 21.2, growth: 9.3 },
    { month: 'Aug', revenue: 28.5, growth: 18.2 },
    { month: 'Sep', revenue: 32.4, growth: 22.7 },
    { month: 'Oct', revenue: 45.2, growth: 28.9 },
  ],
  trafficSources: [
    { source: 'Direct', visitors: 12500, percentage: 35 },
    { source: 'Organic Search', visitors: 9800, percentage: 28 },
    { source: 'Social Media', visitors: 7500, percentage: 21 },
    { source: 'Referral', visitors: 4200, percentage: 12 },
    { source: 'Email', visitors: 1800, percentage: 4 },
  ],
  userEngagement: [
    { time: '12AM', activeUsers: 450 },
    { time: '3AM', activeUsers: 320 },
    { time: '6AM', activeUsers: 780 },
    { time: '9AM', activeUsers: 2450 },
    { time: '12PM', activeUsers: 3890 },
    { time: '3PM', activeUsers: 3120 },
    { time: '6PM', activeUsers: 2780 },
    { time: '9PM', activeUsers: 1890 },
  ],
  productPerformance: [
    { product: 'Horoscope Reports', sales: 15600, returns: 320, rating: 4.8 },
    { product: 'Astrology Jewelry', sales: 12800, returns: 180, rating: 4.6 },
    { product: 'Tarot Readings', sales: 9800, returns: 95, rating: 4.9 },
    { product: 'Birth Charts', sales: 7500, returns: 120, rating: 4.7 },
    { product: 'Courses', sales: 5200, returns: 45, rating: 4.5 },
  ],
  platformUsage: [
    { platform: 'Desktop', sessions: 65, avgTime: '12:45' },
    { platform: 'Mobile', sessions: 28, avgTime: '08:20' },
    { platform: 'Tablet', sessions: 7, avgTime: '10:15' },
  ],
  astrologyServices: [
    { service: 'Vedic', users: 15600, satisfaction: 4.7 },
    { service: 'Western', users: 12800, satisfaction: 4.5 },
    { service: 'Chinese', users: 7800, satisfaction: 4.6 },
    { service: 'Numerology', users: 6500, satisfaction: 4.8 },
    { service: 'Tarot', users: 9200, satisfaction: 4.9 },
  ],
  revenueByCategory: [
    { category: 'Reports', revenue: 1560000 },
    { category: 'Consultations', revenue: 1280000 },
    { category: 'Products', revenue: 980000 },
    { category: 'Courses', revenue: 750000 },
    { category: 'Subscriptions', revenue: 520000 },
  ],
  conversionRates: [
    { channel: 'Website', rate: 4.8 },
    { channel: 'Mobile App', rate: 6.2 },
    { channel: 'Social Media', rate: 3.5 },
    { channel: 'Email', rate: 8.1 },
    { channel: 'Referral', rate: 9.3 },
  ],
};

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartType, setChartType] = useState('line');

  // Colors for charts
  const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];
  
  // Format currency in Indian Rupees
  const formatRupees = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${(amount / 1000).toFixed(1)}K`;
  };

  // Format lakhs for revenue
  const formatLakhs = (amount: number) => {
    return `₹${(amount / 100).toFixed(1)} L`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Deep insights into your astrology business performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatRupees(4523189)}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+28.9%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visitors</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">35,800</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.3%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Session Duration</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">10:45</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bounce Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">32.5%</h3>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-4.2%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-red-50 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                <p className="text-sm text-gray-600">Monthly revenue in lakhs</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <LineChartIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis 
                      stroke="#6b7280"
                      tickFormatter={(value) => `₹${value}L`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value} L`, 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis 
                      stroke="#6b7280"
                      tickFormatter={(value) => `₹${value}L`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value} L`, 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Traffic Sources</h2>
                <p className="text-sm text-gray-600">Where your visitors come from</p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {analyticsData.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row - User Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Engagement Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">User Engagement</h2>
                <p className="text-sm text-gray-600">Active users throughout the day</p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => [value, 'Active Users']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Usage Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Platform Usage</h2>
                <p className="text-sm text-gray-600">Sessions by device type</p>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analyticsData.platformUsage}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="platform" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Sessions %"
                    dataKey="sessions"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Third Row - Product Performance & Conversion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Product Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Product Performance</h2>
                <p className="text-sm text-gray-600">Sales and returns by product category</p>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="product" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => formatRupees(value)}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'sales') return [formatRupees(value as number), 'Sales'];
                      if (name === 'returns') return [value, 'Returns'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returns" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Conversion Rates</h2>
                <p className="text-sm text-gray-600">By marketing channel</p>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.conversionRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="channel" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Conversion Rate']}
                  />
                  <Legend />
                  <Bar dataKey="rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Astrology Services Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Astrology Services Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-600 font-medium">Service Type</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Users</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Satisfaction</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.astrologyServices.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{service.service}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{service.users.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                            <div 
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${(service.satisfaction / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-900">{service.satisfaction}/5.0</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          {index % 3 === 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-green-600">+{12 + index}%</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-red-600">-{3 + index}%</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue by Category</h2>
            <div className="space-y-4">
              {analyticsData.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(category.revenue / 5000000) * 100}%`,
                          backgroundColor: COLORS[index] 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium">{formatRupees(category.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">Avg. Revenue per User</div>
                <div className="text-xl font-bold text-gray-900">{formatRupees(4250)}</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">Customer Lifetime Value</div>
                <div className="text-xl font-bold text-gray-900">{formatRupees(25800)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Analytics Dashboard • Data updates in real-time • Last updated: Today at 14:30</p>
          <p className="mt-2">Powered by Cosmic Insights Analytics Engine</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;