'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE_URL = 'https://www.ayooshonline.com/products';

const StatusBadge = ({ status }) => {
    const colours = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        suspended: 'bg-red-100 text-red-800',
        rejected: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colours[status] || colours.pending}`}>
            {status}
        </span>
    );
};

const ReferralStatusBadge = ({ status }) => {
    const colours = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        void: 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colours[status] || colours.pending}`}>
            {status}
        </span>
    );
};

export default function AdminAffiliatesPage() {
    const [affiliates, setAffiliates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newAffiliate, setNewAffiliate] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(null);

    useEffect(() => { fetchAffiliates(); }, []);

    const fetchAffiliates = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getAffiliates({ limit: 100 });
            setAffiliates(data.data || []);
        } catch {
            toast.error('Failed to load affiliates');
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (aff) => {
        setSelected(aff);
        setReferrals([]);
        setPayoutAmount('');
        try {
            setDetailLoading(true);
            const { data } = await adminAPI.getAffiliate(aff._id);
            setReferrals(data.data.referrals || []);
        } catch {
            toast.error('Failed to load referrals');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await adminAPI.updateAffiliateStatus(id, { status });
            toast.success(`Affiliate ${status}`);
            fetchAffiliates();
            if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleMarkPaid = async () => {
        const amount = parseFloat(payoutAmount);
        if (!amount || amount <= 0) return toast.error('Enter a valid amount');
        try {
            setPayoutLoading(true);
            const { data } = await adminAPI.markAffiliatePaid(selected._id, amount);
            toast.success(data.message);
            setPayoutAmount('');
            fetchAffiliates();
            openDetail(selected);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Payout failed');
        } finally {
            setPayoutLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            const { data } = await adminAPI.createAffiliate(newAffiliate);
            toast.success(`Affiliate created: ${data.data.affiliateCode}`);
            setShowCreate(false);
            setNewAffiliate({ firstName: '', lastName: '', email: '', phone: '' });
            fetchAffiliates();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to create affiliate');
        } finally {
            setCreating(false);
        }
    };

    const copyLink = (code) => {
        navigator.clipboard.writeText(`${BASE_URL}?ref=${code}`);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const unpaid = (aff) => (aff.totalCommission || 0) - (aff.paidCommission || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
                    <p className="text-sm text-gray-500 mt-1">{affiliates.length} total · 5% commission on subtotal</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    + New Affiliate
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Create Affiliate</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'firstName', label: 'First Name', required: true },
                            { key: 'lastName', label: 'Last Name', required: true },
                            { key: 'email', label: 'Email', required: true, type: 'email' },
                            { key: 'phone', label: 'Phone', required: false },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                                <input
                                    type={f.type || 'text'}
                                    required={f.required}
                                    value={newAffiliate[f.key]}
                                    onChange={e => setNewAffiliate(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                        ))}
                        <div className="col-span-2 flex gap-3">
                            <button type="submit" disabled={creating} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50">
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Affiliate List */}
                <div className="lg:col-span-1 space-y-3">
                    {affiliates.map(aff => (
                        <div
                            key={aff._id}
                            onClick={() => openDetail(aff)}
                            className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-gray-400 transition-colors ${selected?._id === aff._id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{aff.firstName} {aff.lastName}</p>
                                    <p className="text-xs text-gray-500 font-mono">{aff.affiliateCode}</p>
                                </div>
                                <StatusBadge status={aff.status} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center mt-3">
                                <div>
                                    <p className="text-xs text-gray-400">Clicks</p>
                                    <p className="font-semibold text-sm">{aff.totalClicks || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Orders</p>
                                    <p className="font-semibold text-sm">{aff.totalOrders || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Unpaid</p>
                                    <p className="font-semibold text-sm text-green-600">R{unpaid(aff).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="lg:col-span-2 space-y-4">
                        {/* Affiliate Header */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selected.firstName} {selected.lastName}</h2>
                                    <p className="text-sm text-gray-500">{selected.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    {selected.status !== 'approved' && (
                                        <button onClick={() => handleStatusChange(selected._id, 'approved')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                                            Approve
                                        </button>
                                    )}
                                    {selected.status === 'approved' && (
                                        <button onClick={() => handleStatusChange(selected._id, 'suspended')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">
                                            Suspend
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {[
                                    { label: 'Clicks', value: selected.totalClicks || 0 },
                                    { label: 'Orders', value: selected.totalOrders || 0 },
                                    { label: 'Total Commission', value: `R${(selected.totalCommission || 0).toFixed(2)}` },
                                    { label: 'Unpaid', value: `R${unpaid(selected).toFixed(2)}`, highlight: true },
                                ].map(s => (
                                    <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                                        <p className={`font-bold text-sm ${s.highlight ? 'text-green-600' : 'text-gray-900'}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Affiliate Link */}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                                <span className="text-xs text-gray-500 flex-1 truncate font-mono">{BASE_URL}?ref={selected.affiliateCode}</span>
                                <button
                                    onClick={() => copyLink(selected.affiliateCode)}
                                    className="px-3 py-1 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-700 shrink-0"
                                >
                                    {copied === selected.affiliateCode ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* Mark Paid */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Record Payout</h3>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder={unpaid(selected).toFixed(2)}
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <button
                                    onClick={handleMarkPaid}
                                    disabled={payoutLoading}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {payoutLoading ? 'Saving...' : 'Mark Paid'}
                                </button>
                            </div>
                        </div>

                        {/* Referrals Table */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">Referrals</h3>
                            </div>
                            {detailLoading ? (
                                <div className="flex items-center justify-center h-24">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800" />
                                </div>
                            ) : referrals.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">No referrals yet</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {['Order', 'Date', 'Order Amount', 'Commission', 'Status'].map(h => (
                                                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {referrals.map(r => (
                                                <tr key={r._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                                        {r.order?.orderNumber || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {new Date(r.createdAt).toLocaleDateString('en-ZA')}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">R{(r.orderAmount || 0).toFixed(2)}</td>
                                                    <td className="px-4 py-3 font-semibold text-green-600">R{(r.commissionAmount || 0).toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <ReferralStatusBadge status={r.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!selected && (
                    <div className="lg:col-span-2 flex items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">Select an affiliate to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
