'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await api.post('/auth/totp/regenerate');
      toast.success('Authenticator reset. Re-scan the QR code on your next login.');
      setConfirming(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset authenticator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Active
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Your account is protected with an authenticator app. If you get a new phone or need to reset your authenticator, use the button below — you&apos;ll be prompted to re-scan a QR code on your next login.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Regenerate Authenticator
          </button>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium mb-4">
              Are you sure? Your current authenticator app will stop working immediately. You&apos;ll need to re-scan a QR code on your next login.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Resetting...' : 'Yes, Reset Authenticator'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
