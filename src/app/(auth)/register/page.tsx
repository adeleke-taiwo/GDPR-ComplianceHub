'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CONSENT_LABELS, CONSENT_DESCRIPTIONS } from '@/utils/constants';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

const consentPurposes = ['marketing', 'analytics', 'third_party_sharing', 'profiling', 'newsletter'] as const;

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [consents, setConsents] = useState<Record<string, boolean>>({
    marketing: false,
    analytics: false,
    third_party_sharing: false,
    profiling: false,
    newsletter: false,
  });
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        consents,
      });
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Registration failed');
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
          <h2 className="text-3xl font-bold text-white mb-4">Join Us</h2>
          <p className="text-primary-100 text-lg">
            Take control of your data privacy. Create your account and manage your GDPR compliance preferences.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-primary-50/40 px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <HiOutlineShieldCheck className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join the GDPR-ComplianceHub</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join the GDPR-ComplianceHub</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input id="reg-firstName" type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label htmlFor="reg-lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input id="reg-lastName" type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="reg-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Min 8 characters" />
            </div>
            <div>
              <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input id="reg-confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Consent Preferences</h3>
              <div className="space-y-3">
                {consentPurposes.map((purpose) => (
                  <label key={purpose} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={consents[purpose]} onChange={(e) => setConsents({ ...consents, [purpose]: e.target.checked })} className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{CONSENT_LABELS[purpose]}</p>
                      <p className="text-xs text-gray-500">{CONSENT_DESCRIPTIONS[purpose]}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
