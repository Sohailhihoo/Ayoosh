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
            // Fetch orders to derive customer list (includes guests)
            const response = await adminAPI.getAllOrders({ limit: 1000 }); // Fetch enough orders to build list
            const orders = response.data.data?.orders || [];

            // Process orders to get unique customers
            const customerMap = new Map();

            orders.forEach(order => {
                const email = order.user?.email || order.customerDetails?.email;
                if (!email) return;

                if (!customerMap.has(email)) {
                    customerMap.set(email, {
                        _id: order.user?._id || `guest-${email}`,
                        name: order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : `${order.customerDetails?.firstName || 'Guest'} ${order.customerDetails?.lastName || ''}`,
                        email: email,
                        orderCount: 0,
                        totalSpent: 0,
                        lastOrderDate: order.createdAt,
                        type: order.user ? 'Registered' : 'Guest'
                    });
                }

                const customer = customerMap.get(email);
                customer.orderCount += 1;
                customer.totalSpent += (order.total || 0);
                if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
                    customer.lastOrderDate = order.createdAt;
                }
            });

            setCustomers(Array.from(customerMap.values()));
        } catch (error) {
            console.error('Error fetching customers:', error);
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {customer.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{customer.email}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.type === 'Registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {customer.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{customer.orderCount}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">R{customer.totalSpent.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
