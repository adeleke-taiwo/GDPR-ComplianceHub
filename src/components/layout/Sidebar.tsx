'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineCircleStack,
  HiOutlineExclamationTriangle,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineListBullet,
  HiOutlineSquares2X2,
  HiOutlineBuildingOffice2,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { href: '/profile', label: 'Profile', icon: HiOutlineUser },
  { href: '/consent', label: 'Consent', icon: HiOutlineShieldCheck },
  { href: '/my-data', label: 'My Data', icon: HiOutlineCircleStack },
  { href: '/breach-alerts', label: 'Breach Alerts', icon: HiOutlineExclamationTriangle },
];

const adminLinks = [
  { href: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { href: '/admin/data-requests', label: 'Data Requests', icon: HiOutlineClipboardDocumentList },
  { href: '/admin/processing-records', label: 'Processing Records', icon: HiOutlineDocumentText },
  { href: '/admin/cookies', label: 'Cookie Management', icon: HiOutlineSquares2X2 },
  { href: '/admin/vendors', label: 'Vendor Management', icon: HiOutlineBuildingOffice2 },
  { href: '/admin/dpias', label: 'DPIAs', icon: HiOutlineShieldExclamation },
  { href: '/admin/audit-log', label: 'Audit Log', icon: HiOutlineListBullet },
];

const dpoLinks = [
  { href: '/admin/breaches', label: 'Breaches', icon: HiOutlineExclamationTriangle },
  { href: '/admin/retention', label: 'Retention Policies', icon: HiOutlineClock },
];

interface Props {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: Props) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin' || user?.role === 'dpo';
  const isDpo = user?.role === 'dpo';

  const linkClass = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 border-l-[3px] border-primary-600 pl-[9px] pr-3'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 pl-3 pr-3'
    }`;
  };

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 hidden lg:flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary-700">GDPR-ComplianceHub</h1>
        <p className="text-xs text-gray-500 mt-1">Compliance Management</p>
      </div>

      <nav className="space-y-1 flex-1">
        {userLinks.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={handleClick}>
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={handleClick}>
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </>
        )}

        {isDpo && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                DPO
              </p>
            </div>
            {dpoLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={handleClick}>
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
