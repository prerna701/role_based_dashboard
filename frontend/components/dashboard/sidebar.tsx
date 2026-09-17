'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { logoutApi } from '@/lib/analytics-api';

const links = [
  { label: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Course Catalog', href: '/courses', icon: GraduationCap },
  { label: 'Student Roster', href: '/students', icon: Users },
  { label: 'Revenue Reports', href: '/revenue', icon: TrendingUp },
  { label: 'Role Permissions', href: '/permissions', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutApi();
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="telemetry-card">
          <span>Active Telemetry</span>
          <strong>AY 2024-25 Q3</strong>
        </div>
        <nav>
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              className={href === pathname ? 'active' : ''}
              href={href}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
          <button type="button" onClick={handleLogout}>
            <LogOut size={19} />
            Logout
          </button>
        </nav>
      </div>
      <div className="node-card">
        <Globe2 size={17} />
        <span>Node: East-Cluster-09</span>
        <b>ONLINE</b>
      </div>
    </aside>
  );
}
