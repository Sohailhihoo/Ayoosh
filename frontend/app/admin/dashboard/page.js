'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

// Inline SVG icons to avoid react-icons module issues
const CurrencyDollarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShoppingCartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

/**
 * Admin Dashboard Overview Page
 * 
 * Displays key metrics, charts, and recent activity
 * 
 * @returns {JSX.Element}
 */
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data
            const [statsRes, salesRes, productsRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getSalesData({ days: 30 }),
                adminAPI.getTopProducts({ limit: 5 }),
            ]);

            const statsData = statsRes.data.data || {};
            setStats({
                totalRevenue: statsData.overview?.totalRevenue || 0,
                totalOrders: statsData.overview?.totalOrders || 0,
                totalProducts: statsData.overview?.totalProducts || 0,
                totalCustomers: statsData.overview?.totalCustomers || 0,
                revenueTrend: statsData.month?.revenueGrowth || 0,
                ordersTrend: statsData.month?.ordersGrowth || 0,
                productsTrend: 0,
                customersTrend: 0,
            });

            setSalesData(salesRes.data.data || []);

            // Map top products data
            const products = productsRes.data.data || [];
            setTopProducts(products.map(p => ({
                name: p.name,
                sales: p.totalSold,
                revenue: p.revenue
            })));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Show zeros when no data or error
            setStats({
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalCustomers: 0,
                revenueTrend: 0,
                ordersTrend: 0,
                productsTrend: 0,
                customersTrend: 0,
            });
            setSalesData([]);
            setTopProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`R${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={CurrencyDollarIcon}
                    trend={stats?.revenueTrend}
                    bgColor="bg-green-500"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCartIcon}
                    trend={stats?.ordersTrend}
                    bgColor="bg-blue-500"
                />
                <StatsCard
                    title="Products"
                    value={stats?.totalProducts || 0}
                    icon={ShoppingBagIcon}
                    trend={stats?.productsTrend}
                    bgColor="bg-purple-500"
                />
                <StatsCard
                    title="Customers"
                    value={stats?.totalCustomers || 0}
                    icon={UsersIcon}
                    trend={stats?.customersTrend}
                    bgColor="bg-orange-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview (Last 30 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#8b5cf6" name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Top Products by Revenue</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sales
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topProducts.map((product, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.sales} units
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        R{product.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
