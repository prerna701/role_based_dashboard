'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

const links = [
  { label: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Course Catalog', href: '/courses', icon: GraduationCap },
  { label: 'Student Roster', href: '/students', icon: Users },
  { label: 'Revenue Reports', href: '/revenue', icon: TrendingUp },
  { label: 'Role Permissions', href: '/permissions', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

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
