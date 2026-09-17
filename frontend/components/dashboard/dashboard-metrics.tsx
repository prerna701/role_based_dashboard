import { Users, GraduationCap, Star, TrendingUp } from 'lucide-react';
import { MetricCard } from './metric-card';
import { formatCurrency } from '@/lib/dashboard-data';
import type { DashboardData } from '@/types/analytics';

type DashboardMetricsProps = {
  summary: DashboardData['summary'];
};

export function DashboardMetrics({ summary }: DashboardMetricsProps) {
  return (
    <section className="metric-grid">
      <MetricCard
        label="Total Students"
        value={summary.totalStudents.toString()}
        caption="COUNT(DISTINCT students.id)"
        trend="+12% MoM"
        icon={<Users size={20} />}
      />
      <MetricCard
        label="Total Enrollments"
        value={summary.totalEnrollments.toString()}
        caption="COUNT(enrollments.id)"
        trend={`${(summary.totalEnrollments / summary.totalStudents).toFixed(2)} crs/student`}
        icon={<GraduationCap size={20} />}
      />
      <MetricCard
        label="Consortium Rating"
        value={`${summary.averageRating.toFixed(1)} / 5.0`}
        caption="Based on submitted ratings"
        trend="4-star median"
        icon={<Star size={20} />}
      />
      <MetricCard
        label="Net Fee Revenue"
        value={formatCurrency(summary.netRevenue)}
        caption="SUM(fee_paid)"
        trend="+18.4% YoY"
        icon={<TrendingUp size={20} />}
      />
    </section>
  );
}
