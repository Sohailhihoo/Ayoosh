'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import {
    HiOutlineCurrencyDollar,
    HiOutlineShoppingCart,
    HiOutlineShoppingBag,
    HiOutlineUsers
} from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

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
                    icon={HiOutlineCurrencyDollar}
                    trend={stats?.revenueTrend}
                    bgColor="bg-green-500"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon={HiOutlineShoppingCart}
                    trend={stats?.ordersTrend}
                    bgColor="bg-blue-500"
                />
                <StatsCard
                    title="Products"
                    value={stats?.totalProducts || 0}
                    icon={HiOutlineShoppingBag}
                    trend={stats?.productsTrend}
                    bgColor="bg-purple-500"
                />
                <StatsCard
                    title="Customers"
                    value={stats?.totalCustomers || 0}
                    icon={HiOutlineUsers}
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
