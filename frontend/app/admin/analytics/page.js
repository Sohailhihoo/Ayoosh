'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

/**
 * Admin Analytics Page
 * 
 * Detailed analytics and insights
 * 
 * @returns {JSX.Element}
 */
export default function AdminAnalytics() {
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [salesResponse, categoryResponse] = await Promise.all([
                adminAPI.getSalesData({ days: 30 }),
                adminAPI.getCategoryPerformance({ period: 30 })
            ]);

            setSalesData(salesResponse.data.data || []);

            // Format category data for charts
            const categories = categoryResponse.data.data || [];
            setCategoryData(categories.map(cat => ({
                name: cat.name,
                value: cat.percentage,
                sales: cat.revenue
            })));
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Show empty when no data
            setSalesData([]);
            setCategoryData([]);
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            {categoryData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h2>
                        <div className="space-y-4">
                            {categoryData.map((category, index) => (
                                <div key={category.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ${category.sales?.toLocaleString() || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
