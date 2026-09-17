import type { DashboardRole, RoleKey } from '@/types/dashboard';

type RegionScopeControlProps = {
  role: DashboardRole;
  roleKey: RoleKey;
  scopedRegion: string;
  onRegionChange: (region: string) => void;
};

export function RegionScopeControl({
  role,
  scopedRegion,
  onRegionChange,
}: RegionScopeControlProps) {
  return (
    <div className="student-controls">
      <span className="api-pill">{role.label}</span>
      <label className="role-select">
        <span>Region</span>
        <select
          value={scopedRegion}
          onChange={(event) => onRegionChange(event.target.value)}
        >
          {role.allowedRegions.map((region) => (
            <option key={region} value={region}>
              {region === 'all' ? 'All Regions' : region}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
