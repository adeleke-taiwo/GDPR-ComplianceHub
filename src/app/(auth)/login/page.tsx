'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden items-center justify-center">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500/20" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-primary-400/10" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-primary-300/10" />
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
            <HiOutlineShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">GDPR-ComplianceHub</h2>
          <p className="text-primary-100 text-lg">
            Your all-in-one platform for GDPR compliance management, data protection, and privacy governance.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-primary-50/40 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <HiOutlineShieldCheck className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GDPR-ComplianceHub</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg px-3 py-2.5 mb-4">
            <p className="text-[10px] font-bold text-primary-800 mb-1.5 flex items-center gap-1">
              <span className="text-xs">&#127919;</span> Demo Accounts
            </p>
            {[
              { role: 'DPO', email: 'dpo@gdpr-compliance.com', pass: 'User123!' },
              { role: 'Admin', email: 'admin@gdpr-compliance.com', pass: 'Admin123!' },
              { role: 'User', email: 'user@gdpr-compliance.com', pass: 'User123!' },
            ].map((account) => (
              <div key={account.role} className="flex items-center justify-between py-1 border-b border-primary-200/40 last:border-b-0">
                <p className="text-[11px] text-gray-700">
                  <span className="font-semibold text-primary-800">{account.role}</span>
                  <span className="text-gray-400 mx-1">&mdash;</span>
                  {account.email}
                </p>
                <button
                  type="button"
                  onClick={() => { setEmail(account.email); setPassword(account.pass); }}
                  className="text-[10px] px-2 py-0.5 rounded bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex-shrink-0 ml-2"
                >
                  Use
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4 animate-fade-in">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
