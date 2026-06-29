'use client';

import { useEffect, useState } from 'react';
import { affiliateAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE_URL = 'https://www.ayooshonline.com/products';

const StatCard = ({ label, value, sub, highlight }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
);

const StatusBadge = ({ status }) => {
    const colours = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-blue-100 text-blue-700',
        paid: 'bg-green-100 text-green-700',
        void: 'bg-gray-100 text-gray-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colours[status] || colours.pending}`}>
            {status}
        </span>
    );
};

export default function AffiliateDashboard() {
    const [affiliate, setAffiliate] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [affRes, refRes] = await Promise.all([
                    affiliateAPI.getMe(),
                    affiliateAPI.getMyReferrals({ limit: 50 }),
                ]);
                setAffiliate(affRes.data.data);
                setReferrals(refRes.data.data || []);
            } catch {
                toast.error('Failed to load your dashboard');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const copyLink = () => {
        if (!affiliate) return;
        navigator.clipboard.writeText(`${BASE_URL}?ref=${affiliate.affiliateCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!affiliate) return null;

    const unpaid = (affiliate.totalCommission || 0) - (affiliate.paidCommission || 0);
    const affiliateLink = `${BASE_URL}?ref=${affiliate.affiliateCode}`;

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {affiliate.firstName} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Your code is <span className="font-mono font-semibold text-gray-800">{affiliate.affiliateCode}</span> · 5% commission on every order you refer
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Clicks" value={affiliate.totalClicks || 0} />
                <StatCard label="Orders" value={affiliate.totalOrders || 0} />
                <StatCard
                    label="Total Earned"
                    value={`R${(affiliate.totalCommission || 0).toFixed(2)}`}
                    sub="All time"
                />
                <StatCard
                    label="Pending Payout"
                    value={`R${unpaid.toFixed(2)}`}
                    sub="Will be paid out manually"
                    highlight
                />
            </div>

            {/* Affiliate Link */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">Your Affiliate Link</h2>
                <p className="text-xs text-gray-400 mb-4">Share this link on social media. Anyone who buys within 7 days earns you a commission.</p>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="text-sm font-mono text-gray-700 flex-1 truncate">{affiliateLink}</span>
                    <button
                        onClick={copyLink}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 shrink-0 transition-colors"
                    >
                        {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">How it works</h2>
                <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex gap-2">
                        <span className="text-amber-500 font-bold shrink-0">1.</span>
                        <span>Share your unique link in your bio, stories, or posts.</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-amber-500 font-bold shrink-0">2.</span>
                        <span>Your follower visits Ayoosh and places an order within 7 days.</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-amber-500 font-bold shrink-0">3.</span>
                        <span>You earn 5% of their order value (excluding shipping). Payouts are processed manually each month.</span>
                    </div>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Your Referrals</h2>
                </div>
                {referrals.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-400">No referrals yet — start sharing your link!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Order', 'Date', 'Order Amount', 'Your Commission', 'Status'].map(h => (
                                        <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {referrals.map(r => (
                                    <tr key={r._id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 font-mono text-xs text-gray-500">
                                            {r.order?.orderNumber || '—'}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500">
                                            {new Date(r.createdAt).toLocaleDateString('en-ZA')}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-800">
                                            R{(r.orderAmount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-green-600">
                                            R{(r.commissionAmount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={r.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <p className="text-xs text-gray-500">
                                Total earned: <span className="font-semibold text-gray-800">R{(affiliate.totalCommission || 0).toFixed(2)}</span>
                                &nbsp;·&nbsp;
                                Paid out: <span className="font-semibold text-gray-800">R{(affiliate.paidCommission || 0).toFixed(2)}</span>
                                &nbsp;·&nbsp;
                                Pending: <span className="font-semibold text-green-600">R{unpaid.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
