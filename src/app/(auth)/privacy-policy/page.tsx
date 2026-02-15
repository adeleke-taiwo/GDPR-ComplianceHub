'use client';

import Link from 'next/link';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-primary-50/40 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            &larr; Back to Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <HiOutlineShieldCheck className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-1">How we collect, use, and protect your personal data</p>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction &amp; Data Controller</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>This Privacy Policy explains how the GDPR-ComplianceHub (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, stores, and protects your personal data in accordance with the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;).</p>
              <p>The data controller responsible for your personal data is the organisation operating this platform. For contact details, see the &quot;Contact &amp; Data Protection Officer&quot; section below.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>We collect and process the following categories of personal data:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-medium text-gray-700">Account information</span> — name, email address, and hashed password provided during registration.</li>
                <li><span className="font-medium text-gray-700">Consent records</span> — your choices regarding marketing, analytics, third-party sharing, profiling, and newsletters, along with timestamps.</li>
                <li><span className="font-medium text-gray-700">Usage data</span> — audit logs of actions you perform on the platform.</li>
                <li><span className="font-medium text-gray-700">Technical data</span> — IP address, browser type, and session information collected for security purposes.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Legal Basis for Processing</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>We process your personal data under the following legal bases as defined in GDPR Article 6(1):</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-medium text-gray-700">Consent (Art. 6(1)(a))</span> — for optional processing such as marketing communications, analytics, and newsletter subscriptions.</li>
                <li><span className="font-medium text-gray-700">Contractual necessity (Art. 6(1)(b))</span> — to provide and maintain your account and the platform&apos;s core services.</li>
                <li><span className="font-medium text-gray-700">Legal obligation (Art. 6(1)(c))</span> — to maintain audit logs and consent records as required by GDPR.</li>
                <li><span className="font-medium text-gray-700">Legitimate interest (Art. 6(1)(f))</span> — for platform security, fraud prevention, and service improvement.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. How We Use Your Data</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>Your personal data is used to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Create and manage your user account.</li>
                <li>Record and honour your consent preferences.</li>
                <li>Respond to data subject access, export, and erasure requests.</li>
                <li>Maintain audit logs for compliance and accountability.</li>
                <li>Send communications you have opted into (e.g., newsletters, marketing).</li>
                <li>Detect and prevent unauthorised access or security incidents.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>Under the GDPR, you have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-medium text-gray-700">Right of access</span> — request a copy of the data we hold about you.</li>
                <li><span className="font-medium text-gray-700">Right to rectification</span> — correct inaccurate or incomplete data.</li>
                <li><span className="font-medium text-gray-700">Right to erasure</span> — request deletion of your personal data.</li>
                <li><span className="font-medium text-gray-700">Right to data portability</span> — receive your data in a portable format.</li>
                <li><span className="font-medium text-gray-700">Right to withdraw consent</span> — change your consent preferences at any time.</li>
                <li><span className="font-medium text-gray-700">Right to lodge a complaint</span> — contact your local supervisory authority.</li>
              </ul>
              <p className="mt-3">
                You can exercise these rights directly through the platform. Log in and visit{' '}
                <Link href="/consent" className="text-primary-600 hover:text-primary-700 font-medium">Consent Management</Link>{' '}
                to update your preferences, or{' '}
                <Link href="/my-data" className="text-primary-600 hover:text-primary-700 font-medium">My Data</Link>{' '}
                to export or request erasure of your data.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy, or as required by law.</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Account data is retained while your account is active and deleted upon an approved erasure request.</li>
                <li>Consent records are retained for the duration required to demonstrate compliance with GDPR.</li>
                <li>Audit logs are retained according to the platform&apos;s configurable retention policies.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Security Measures</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>We implement appropriate technical and organisational measures to protect your personal data, including:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Passwords are hashed using industry-standard algorithms and are never stored in plain text.</li>
                <li>Access controls ensure only authorised personnel can view or process personal data.</li>
                <li>All data transmissions are encrypted in transit.</li>
                <li>Regular security assessments are conducted, and any data breaches are handled in accordance with GDPR Articles 33 and 34.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Contact &amp; Data Protection Officer</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact our Data Protection Officer (DPO):</p>
              <ul className="list-none space-y-1 ml-2">
                <li><span className="font-medium text-gray-700">Email:</span> dpo@example.com</li>
                <li><span className="font-medium text-gray-700">Address:</span> Data Protection Officer, GDPR-ComplianceHub, 123 Privacy Street, Dublin, Ireland</li>
              </ul>
              <p>You also have the right to lodge a complaint with your local data protection supervisory authority.</p>
            </div>
          </section>

          <div className="text-center text-xs text-gray-400 pb-4">
            Last updated: February 2026
          </div>
        </div>
      </div>
    </div>
  );
}
