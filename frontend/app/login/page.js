'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import cloudinaryLoader from '@/lib/cloudinary-loader';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, confirmTotpSetup, verifyTotp } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Step control: 'credentials' | 'setup' | 'verify'
  const [step, setStep] = useState('credentials');
  const [pendingToken, setPendingToken] = useState('');

  // Setup step state
  const [qrUri, setQrUri] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [savedCodes, setSavedCodes] = useState(false);
  const [setupCode, setSetupCode] = useState(['', '', '', '', '', '']);
  const setupRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Verify step state
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const verifyRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1 — email + password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result?.totpSetupRequired) {
        setPendingToken(result.pendingToken);
        setQrUri(result.qrUri);
        setRecoveryCodes(result.recoveryCodes);
        setStep('setup');
      } else if (result?.totpRequired) {
        setPendingToken(result.pendingToken);
        setStep('verify');
      } else {
        toast.success('Welcome back!');
        const destination = result?.role === 'admin' ? '/admin' : redirect;
        router.push(destination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // OTP digit helpers (shared between setup and verify)
  const makeOtpHandlers = (otp, setOtp, refs) => ({
    onChange: (index, value) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...otp];
      next[index] = value.slice(-1);
      setOtp(next);
      if (value && index < 5) refs[index + 1].current?.focus();
    },
    onKeyDown: (index, e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        refs[index - 1].current?.focus();
      }
    },
    onPaste: (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;
      const next = [...otp];
      pasted.split('').forEach((d, i) => { next[i] = d; });
      setOtp(next);
      refs[Math.min(pasted.length, 5)].current?.focus();
    },
  });

  const setupHandlers = makeOtpHandlers(setupCode, setSetupCode, setupRefs);
  const verifyHandlers = makeOtpHandlers(verifyCode, setVerifyCode, verifyRefs);

  // Step 2a — confirm TOTP setup
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    const code = setupCode.join('');
    if (code.length < 6) return toast.error('Enter the full 6-digit code from your authenticator app');
    setLoading(true);
    try {
      const setupUser = await confirmTotpSetup(pendingToken, code);
      toast.success('Two-factor authentication enabled!');
      router.push(setupUser?.role === 'admin' ? '/admin' : redirect);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect code. Please try again.');
      setSetupCode(['', '', '', '', '', '']);
      setupRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Step 2b — verify TOTP on login
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const code = useRecovery ? recoveryInput.trim() : verifyCode.join('');
    if (!useRecovery && code.length < 6) return toast.error('Enter the full 6-digit code');
    if (useRecovery && !code) return toast.error('Enter your recovery code');
    setLoading(true);
    try {
      const verifiedUser = await verifyTotp(pendingToken, code);
      toast.success('Welcome back!');
      router.push(verifiedUser?.role === 'admin' ? '/admin' : redirect);
    } catch (error) {
      const data = error.response?.data;
      if (data?.totpResetRequired) {
        toast.error('Authenticator not configured. Please log in again to re-scan the QR code.');
        setStep('credentials');
        setVerifyCode(['', '', '', '', '', '']);
        setRecoveryInput('');
      } else {
        toast.error(data?.message || 'Incorrect code');
        if (!useRecovery) {
          setVerifyCode(['', '', '', '', '', '']);
          verifyRefs[0].current?.focus();
        } else {
          setRecoveryInput('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast.success('Recovery codes copied!');
  };

  const rightPanel = (
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
  );

  // Step 2a: First-time TOTP setup
  if (step === 'setup') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex text-gray-800 font-sans">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="max-w-xl w-full py-8">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-[#f9cb19] mb-3" style={{ fontFamily: "'Tan Pearl', serif" }}>
                Set Up Authenticator
              </h1>
              <p className="text-gray-400 text-base font-light leading-relaxed">
                Scan this QR code with Microsoft Authenticator or Google Authenticator, then enter the 6-digit code to confirm.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center lg:justify-start mb-8">
              {qrUri && (
                <img src={qrUri} alt="TOTP QR Code" className="w-48 h-48 rounded-lg border border-gray-200" />
              )}
            </div>

            {/* Recovery Codes */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">Recovery Codes</p>
                <button
                  type="button"
                  onClick={copyAllCodes}
                  className="text-xs font-semibold text-[#f9cb19] hover:underline"
                >
                  Copy all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, i) => (
                  <code key={i} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 font-mono text-gray-600">
                    {code}
                  </code>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Store these somewhere safe. Each code can only be used once. You won&apos;t see them again.
              </p>
            </div>

            <form onSubmit={handleSetupSubmit} className="space-y-6">
              {/* Saved codes checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedCodes}
                  onChange={e => setSavedCodes(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#f9cb19] focus:ring-[#f9cb19]"
                />
                <span className="text-sm text-gray-600 font-light">
                  I&apos;ve saved my recovery codes somewhere safe
                </span>
              </label>

              {/* 6-digit confirm input */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-4">
                  Enter Code from App
                </label>
                <div className="flex gap-3" onPaste={setupHandlers.onPaste}>
                  {setupCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={setupRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => setupHandlers.onChange(i, e.target.value)}
                      onKeyDown={e => setupHandlers.onKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f9cb19] focus:ring-2 focus:ring-[#f9cb19]/30 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !savedCodes || setupCode.join('').length < 6}
                className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {loading ? 'Confirming...' : 'Enable Two-Factor Auth'}
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // Step 2b: TOTP verify on subsequent logins
  if (step === 'verify') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex text-gray-800 font-sans">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="max-w-xl w-full">
            <div className="mb-12 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-[#f9cb19] mb-4" style={{ fontFamily: "'Tan Pearl', serif" }}>
                Two-Factor Auth
              </h1>
              <p className="text-gray-400 text-base font-light leading-relaxed">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-8">
              {!useRecovery ? (
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-4">
                    Authenticator Code
                  </label>
                  <div className="flex gap-3" onPaste={verifyHandlers.onPaste}>
                    {verifyCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={verifyRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => verifyHandlers.onChange(i, e.target.value)}
                        onKeyDown={e => verifyHandlers.onKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f9cb19] focus:ring-2 focus:ring-[#f9cb19]/30 transition-all"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Recovery Code
                  </label>
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={e => setRecoveryInput(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx"
                    className="w-full px-5 py-4 text-lg font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9cb19]/50 focus:border-[#f9cb19] transition-all placeholder:text-gray-300"
                    autoFocus
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!useRecovery && verifyCode.join('').length < 6) || (useRecovery && !recoveryInput.trim())}
                className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="hover:text-gray-700 transition-colors"
                >
                  ← Back to login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseRecovery(r => !r);
                    setVerifyCode(['', '', '', '', '', '']);
                    setRecoveryInput('');
                  }}
                  className="font-semibold text-gray-600 hover:text-[#f9cb19] transition-colors"
                >
                  {useRecovery ? 'Use authenticator app' : 'Use a recovery code'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // Step 1: Credentials
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
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">Email</label>
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

            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">Password</label>
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

            <div className="flex items-center justify-between text-base">
              <label className="flex items-center text-gray-400 font-light hover:text-gray-600 cursor-pointer">
                <input type="checkbox" className="mr-3 w-5 h-5 rounded border-gray-300 text-[#f9cb19] focus:ring-[#f9cb19]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-bold text-gray-700 hover:text-[#f9cb19] transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f9cb19] text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-[#e5b817] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center mt-10 text-base text-gray-400 font-light">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#f9cb19] font-bold hover:underline ml-1">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
      {rightPanel}
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
