'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FormPage() {
  const { token } = useParams();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      toast.success('Message sent!');
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-[#f4f2f0] px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#f9cb19]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#f9cb19]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            className="text-3xl font-bold text-[#f9cb19] mb-3"
            style={{ fontFamily: "'Tan Pearl', serif" }}
          >
            Thank You
          </h2>
          <p className="text-gray-400 font-light">
            Your message has been received. We&apos;ll be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-[#f4f2f0] px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-xl w-full">

        <div className="mb-10">
          <h1
            className="text-4xl font-bold text-[#f9cb19] mb-3"
            style={{ fontFamily: "'Tan Pearl', serif" }}
          >
            Get in Touch
          </h1>
          <p className="text-gray-400 font-light text-lg">
            Fill in your details below and we&apos;ll get back to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-base font-bold text-gray-700 mb-3">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
              placeholder="Your name"
            />
          </div>

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
              maxLength={320}
              className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-700 mb-3">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              maxLength={5000}
              rows={5}
              className="w-full px-5 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:font-light placeholder:text-gray-300 resize-none"
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>

        </form>
      </div>
    </div>
  );
}
