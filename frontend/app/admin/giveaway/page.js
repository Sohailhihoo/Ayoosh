'use client';

import { useEffect, useState, useCallback } from 'react';
import { formSubmissionAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminGiveaway() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [total, setTotal] = useState(0);

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await formSubmissionAPI.getAll({ search, limit: 100 });
            setSubmissions(data.submissions || []);
            setTotal(data.total || 0);
        } catch {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this entry?')) return;
        try {
            await formSubmissionAPI.delete(id);
            toast.success('Entry deleted');
            fetchSubmissions();
        } catch {
            toast.error('Failed to delete entry');
        }
    };

    const handleExportCSV = () => {
        if (!submissions.length) return;
        const headers = ['Name', 'Email', 'Contact', 'Handle', 'Offers Consent', 'Terms Consent', 'Submitted At'];
        const rows = submissions.map((s) => [
            s.name,
            s.email,
            s.contact || '',
            s.handle || '',
            s.offersConsent ? 'Yes' : 'No',
            s.termsConsent ? 'Yes' : 'No',
            new Date(s.createdAt).toLocaleString('en-ZA'),
        ]);
        const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `giveaway-entries-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Giveaway Entries</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} total {total === 1 ? 'entry' : 'entries'}</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={!submissions.length}
                    className="px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Export CSV
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name, email or handle…"
                    className="flex-1 border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
                />
                <button type="submit" className="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                    Search
                </button>
                {search && (
                    <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                        className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                        Clear
                    </button>
                )}
            </form>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading entries…</div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No entries found.</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Name', 'Email', 'Contact', 'Handle', 'Offers', 'Terms', 'Submitted', ''].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {submissions.map((s) => (
                                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.email}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.contact || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {s.handle ? (
                                                <a href={`https://instagram.com/${s.handle.replace('@', '')}`} target="_blank" rel="noreferrer"
                                                    className="text-blue-600 hover:underline">
                                                    {s.handle.startsWith('@') ? s.handle : `@${s.handle}`}
                                                </a>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.offersConsent
                                                ? <span className="inline-block w-4 h-4 rounded-full bg-green-400" title="Yes" />
                                                : <span className="inline-block w-4 h-4 rounded-full bg-gray-200" title="No" />}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.termsConsent
                                                ? <span className="inline-block w-4 h-4 rounded-full bg-green-400" title="Yes" />
                                                : <span className="inline-block w-4 h-4 rounded-full bg-gray-200" title="No" />}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                                            {new Date(s.createdAt).toLocaleDateString('en-ZA', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDelete(s._id)}
                                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
