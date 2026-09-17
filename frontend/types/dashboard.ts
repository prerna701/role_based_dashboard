import { roles } from '@/lib/dashboard-data';

export type RoleKey = keyof typeof roles;
export type DashboardRole = (typeof roles)[RoleKey];
