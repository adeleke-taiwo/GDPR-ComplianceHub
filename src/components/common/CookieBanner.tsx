'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { consentService } from '@/services/consentService';
import toast from 'react-hot-toast';

export default function CookieBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('cookieBannerDismissed');
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAcceptAll = async () => {
    if (user) {
      try {
        await consentService.updateConsent({
          marketing: true,
          analytics: true,
          third_party_sharing: true,
          profiling: true,
          newsletter: true,
        });
        toast.success('All cookies accepted');
      } catch {
        toast.error('Failed to save preferences');
      }
    }
    localStorage.setItem('cookieBannerDismissed', 'true');
    setVisible(false);
  };

  const handleRejectOptional = async () => {
    if (user) {
      try {
        await consentService.updateConsent({
          marketing: false,
          analytics: false,
          third_party_sharing: false,
          profiling: false,
          newsletter: false,
        });
        toast.success('Optional cookies rejected');
      } catch {
        toast.error('Failed to save preferences');
      }
    }
    localStorage.setItem('cookieBannerDismissed', 'true');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">Cookie Preferences</p>
          <p>We use cookies to enhance your experience. You can manage your preferences in the consent settings.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleRejectOptional}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Reject Optional
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
