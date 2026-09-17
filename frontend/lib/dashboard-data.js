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

export const regions = [
  { key: 'all', label: 'All Regions', students: 50, enrollments: 119, revenue: 1245000 },
  { key: 'north', label: 'North', students: 24, enrollments: 57, revenue: 540000 },
  { key: 'south', label: 'South', students: 18, enrollments: 42, revenue: 425000 },
  { key: 'east', label: 'East', students: 8, enrollments: 20, revenue: 280000 },
];

export const categoryRevenue = [
  { category: 'Data & Analytics', enrollments: 32, revenue: 465000, share: 37.3, color: '#0284c7' },
  { category: 'Programming', enrollments: 29, revenue: 390000, share: 31.3, color: '#4f46e5' },
  { category: 'Business Strategy', enrollments: 22, revenue: 240000, share: 19.3, color: '#d97706' },
  { category: 'Design & UX', enrollments: 14, revenue: 150000, share: 12.1, color: '#9333ea' },
];

export const completionStatus = [
  { label: 'In Progress', value: 54, percent: 45, color: '#4f46e5' },
  { label: 'Completed', value: 49, percent: 41, color: '#059669' },
  { label: 'Dropped', value: 16, percent: 14, color: '#dc2626' },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 94000 },
  { month: 'Feb', revenue: 112000 },
  { month: 'Mar', revenue: 138000 },
  { month: 'Apr', revenue: 156000 },
  { month: 'May', revenue: 178000 },
  { month: 'Jun', revenue: 210000 },
  { month: 'Jul', revenue: 248000 },
  { month: 'Aug', revenue: 109000 },
];

export const popularCourses = [
  {
    rank: 1,
    title: 'Advanced Data Pipelines & Analytics',
    code: 'CRS-DATA-801',
    category: 'Data',
    enrollments: 18,
    rating: 4.2,
    fees: 270000,
    completionRate: 82,
  },
  {
    rank: 2,
    title: 'Full-Stack Modern Web Architectures',
    code: 'CRS-PROG-304',
    category: 'Programming',
    enrollments: 14,
    rating: 4.0,
    fees: 210000,
    completionRate: 79,
  },
  {
    rank: 3,
    title: 'Enterprise Financial Modeling & Strategy',
    code: 'CRS-BUSN-102',
    category: 'Business',
    enrollments: 11,
    rating: 3.7,
    fees: 165000,
    completionRate: 73,
  },
  {
    rank: 4,
    title: 'Design Systems & Human-Centered UX',
    code: 'CRS-DSGN-510',
    category: 'Design',
    enrollments: 9,
    rating: 4.5,
    fees: 135000,
    completionRate: 91,
  },
  {
    rank: 5,
    title: 'Cloud Infrastructure & Kubernetes',
    code: 'CRS-PROG-720',
    category: 'Programming',
    enrollments: 8,
    rating: 3.9,
    fees: 120000,
    completionRate: 75,
  },
];

export const dropOffRisks = [
  { course: 'Cloud Infrastructure & Kubernetes', dropped: 5, dropRate: 18.5, region: 'North' },
  { course: 'Enterprise Financial Modeling & Strategy', dropped: 4, dropRate: 15.4, region: 'South' },
  { course: 'Full-Stack Modern Web Architectures', dropped: 3, dropRate: 9.7, region: 'North' },
];

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

export function getRegionSummary(regionKey) {
  return regions.find((region) => region.key === regionKey) ?? regions[0];
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
