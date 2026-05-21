'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import cloudinaryLoader from '@/lib/cloudinary-loader';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      // Session cookie is automatically set by browser
      setUser(data.data);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex text-gray-800 font-sans">

      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-xl w-full">

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-5xl font-bold text-[#f9cb19] mb-4" style={{ fontFamily: "'Tan Pearl', serif" }}>Create Account</h1>
            <p className="text-gray-400 text-lg font-light">
              Join the Ayoosh community and start your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-3">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-3">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                  placeholder="Last name"
                />
              </div>
            </div>

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
                minLength={6}
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                placeholder="Create a password"
              />
              <p className="text-sm text-gray-400 font-light mt-2">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Terms */}
            <p className="text-sm text-gray-400 font-light text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[#f9cb19] font-bold hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#f9cb19] font-bold hover:underline">Privacy Policy</Link>
            </p>

            {/* Sign In Link */}
            <div className="text-center mt-8 text-base text-gray-400 font-light">
              Already have an account?{' '}
              <Link href="/login" className="text-[#f9cb19] font-bold hover:underline ml-1">
                Sign in
              </Link>
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-[#f4f2f0] p-0 border-none">
        <div className="absolute inset-0">
          <Image
            loader={cloudinaryLoader}
            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769770501/Group_49_1_hsbwkx.png"
            alt="Ayoosh Beauty"
            fill
            sizes="50vw"
            className="object-contain object-left-bottom"
          />
        </div>
      </div>

    </div>
  );
}
