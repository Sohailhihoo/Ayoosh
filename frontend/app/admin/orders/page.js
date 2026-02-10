'use client';

import { useEffect, useState, Fragment } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-teal-100 text-teal-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_COLORS = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllOrders({ limit: 200 });
            const ordersData = response.data.data?.orders || response.data.data || [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, { status: newStatus });
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(prev => prev === orderId ? null : orderId);
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Manage and view customer orders. Click any order row to expand full details.</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Orders</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const customerName = order.user
                                        ? `${order.user.firstName} ${order.user.lastName}`
                                        : `${order.customerDetails?.firstName || 'Guest'} ${order.customerDetails?.lastName || ''}`;

                                    const customerEmail = order.user?.email || order.customerDetails?.email || 'No email';
                                    const isExpanded = expandedOrder === order._id;

                                    return (
                                        <Fragment key={order._id}>
                                            {/* Main Row */}
                                            <tr
                                                onClick={() => toggleExpand(order._id)}
                                                className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        {order.orderNumber || order._id.substring(0, 8)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{customerName}</div>
                                                    <div className="text-sm text-gray-500">{customerEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                                                    <div className="truncate">
                                                        {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ') || 'No items'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${PAYMENT_COLORS[order.paymentStatus] || 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.paymentStatus || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    R{(order.total || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                    >
                                                        {STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status}>
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>

                                            {/* Expanded Detail Row */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="7" className="px-6 py-6">
                                                        <OrderDetail order={order} />
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
            </div>
        </div>
    );
}

function OrderDetail({ order }) {
    const sa = order.shippingAddress || {};
    const cd = order.customerDetails || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer
                </h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="text-gray-500">Name:</span>{' '}
                        <span className="text-gray-900 font-medium">{cd.firstName || ''} {cd.lastName || ''}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Email:</span>{' '}
                        <a href={`mailto:${cd.email}`} className="text-blue-600 hover:underline">{cd.email || 'N/A'}</a>
                    </div>
                    <div>
                        <span className="text-gray-500">Phone:</span>{' '}
                        <a href={`tel:${cd.phone}`} className="text-blue-600 hover:underline">{cd.phone || 'N/A'}</a>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Shipping Address
                </h3>
                <div className="space-y-1 text-sm">
                    <p className="text-gray-900 font-medium">{sa.firstName || ''} {sa.lastName || ''}</p>
                    <p className="text-gray-700">{sa.street || 'N/A'}</p>
                    <p className="text-gray-700">{sa.city || ''}{sa.state ? `, ${sa.state}` : ''} {sa.zipCode || ''}</p>
                    <p className="text-gray-700">{sa.country || ''}</p>
                    {sa.phone && (
                        <p className="text-gray-500 mt-2">
                            Phone: <a href={`tel:${sa.phone}`} className="text-blue-600 hover:underline">{sa.phone}</a>
                        </p>
                    )}
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment
                </h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="text-gray-500">Method:</span>{' '}
                        <span className="text-gray-900 font-medium uppercase">{order.paymentMethod || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${PAYMENT_COLORS[order.paymentStatus] || 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus || 'pending'}
                        </span>
                    </div>
                    {order.paymentId && (
                        <div>
                            <span className="text-gray-500">Payment ID:</span>{' '}
                            <span className="text-gray-900 font-mono text-xs">{order.paymentId}</span>
                        </div>
                    )}
                    {order.paidAt && (
                        <div>
                            <span className="text-gray-500">Paid:</span>{' '}
                            <span className="text-gray-900">{format(new Date(order.paidAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Items ({order.items?.length || 0})
                </h3>
                <div className="space-y-3">
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                                    {item.variant && typeof item.variant === 'object' && (
                                        <p className="text-xs text-gray-500">
                                            {Object.entries(item.variant).filter(([k]) => k !== 'sku').map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-gray-900 font-medium">R{(item.total || item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{item.quantity} x R{item.price?.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Summary
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">R{(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Shipping ({order.shippingMethod || 'standard'})</span>
                        <span className="text-gray-900">R{(order.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span className="text-gray-900">R{(order.tax || 0).toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                            <span>-R{order.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">R{(order.total || 0).toFixed(2)}</span>
                    </div>
                    {order.customerNote && (
                        <div className="pt-2 mt-2 border-t border-gray-200">
                            <span className="text-gray-500">Customer Note:</span>
                            <p className="text-gray-700 mt-1 italic">{order.customerNote}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
