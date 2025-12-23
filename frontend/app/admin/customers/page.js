'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';

/**
 * Admin Customers Page
 * 
 * Displays customer list and information
 * 
 * @returns {JSX.Element}
 */
export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getCustomers();
            // Handle paginated response structure
            const customersData = response.data.data?.users || response.data.data || [];
            setCustomers(customersData);
        } catch (error) {
            console.error('Error fetching customers:', error);
            // Show empty when no data
            setCustomers([]);
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
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600 mt-1">View and manage customer accounts</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {customer.firstName} {customer.lastName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{customer.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{customer.orderCount || 0}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
