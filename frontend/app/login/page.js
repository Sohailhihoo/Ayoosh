'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      router.push(redirect);
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex text-gray-800 font-sans">

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-xl w-full">

          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-5xl font-bold text-[#f9cb19] mb-4" style={{ fontFamily: "'Tan Pearl', serif" }}>Welcome Back</h1>
            <p className="text-gray-400 text-lg font-light">
              Please enter your details below to access the system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-base">
              <label className="flex items-center text-gray-400 font-light hover:text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-3 w-5 h-5 rounded border-gray-300 text-[#f9cb19] focus:ring-[#f9cb19]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-bold text-gray-700 hover:text-[#f9cb19] transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-10 text-base text-gray-400 font-light">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#f9cb19] font-bold hover:underline ml-1">
                Sign up
              </Link>
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-[#f4f2f0] p-0 border-none">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769770501/Group_49_1_hsbwkx.png"
            alt="Ayoosh Beauty"
            className="w-full h-full object-contain object-left-bottom"
          />

        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#f9cb19]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
