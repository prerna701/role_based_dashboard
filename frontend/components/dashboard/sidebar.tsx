import { Globe2, GraduationCap, LayoutDashboard, ShieldCheck, TrendingUp, Users } from 'lucide-react';

const links = [
  ['Overview Dashboard', LayoutDashboard],
  ['Course Catalog', GraduationCap],
  ['Student Roster', Users],
  ['Revenue Reports', TrendingUp],
  ['Role Permissions', ShieldCheck],
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="telemetry-card">
          <span>Active Telemetry</span>
          <strong>AY 2024-25 Q3</strong>
        </div>
        <nav>
          {links.map(([label, Icon], index) => (
            <a
              key={label}
              className={index === 0 ? 'active' : ''}
              href={label === 'Student Roster' ? '/students' : '#'}
            >
              <Icon size={19} />
              {label}
            </a>
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
