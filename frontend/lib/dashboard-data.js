export const roles = {
  admin: {
    key: 'admin',
    label: 'Administrator',
    name: 'Elena Vance',
    initials: 'EV',
    scopeLabel: 'Global Consortium',
    allowedRegions: ['all', 'north', 'south', 'east'],
  },
  north: {
    key: 'north',
    label: 'North Manager',
    name: 'Marcus Holloway',
    initials: 'MH',
    scopeLabel: 'North Region',
    allowedRegions: ['north'],
  },
  south: {
    key: 'south',
    label: 'South Manager',
    name: 'Aria Thorne',
    initials: 'AT',
    scopeLabel: 'South Region',
    allowedRegions: ['south'],
  },
};

export function canAccessRegion(roleKey, regionKey) {
  const role = roles[roleKey] ?? roles.admin;
  return role.allowedRegions.includes(regionKey);
}

export function resolveRegionForRole(roleKey, requestedRegion) {
  if (canAccessRegion(roleKey, requestedRegion)) {
    return requestedRegion;
  }

  const role = roles[roleKey] ?? roles.admin;
  return role.allowedRegions[0];
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
