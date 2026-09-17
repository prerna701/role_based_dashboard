import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegionScopeControl } from './region-scope-control';
import type { DashboardRole, RoleKey } from '@/types/dashboard';

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  role?: DashboardRole;
  roleKey?: RoleKey;
  scopedRegion?: string;
  onRegionChange?: (region: string) => void;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  role,
  roleKey,
  scopedRegion,
  onRegionChange,
}: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        <Button className="back-link" href="/" variant="ghost">
          <ArrowLeft size={16} /> Back to dashboard
        </Button>
        <p className="card-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {role && roleKey && scopedRegion && onRegionChange && (
        <RegionScopeControl
          role={role}
          roleKey={roleKey}
          scopedRegion={scopedRegion}
          onRegionChange={onRegionChange}
        />
      )}
    </div>
  );
}
