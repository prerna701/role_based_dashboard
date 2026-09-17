import { BookOpen, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

import type { CompletionTotals, StudentMetricsProps } from '@/types/components';
export function StudentMetrics({
  totalStudents,
  completionTotals,
}: StudentMetricsProps) {
  return (
    <section className="metric-grid student-metrics">
      <Card className="metric-card">
        <div className="metric-top">
          <span>Students in scope</span>
          <Users size={20} />
        </div>
        <div className="metric-value">
          <strong>{totalStudents}</strong>
        </div>
        <small>Unique students</small>
      </Card>
      <Card className="metric-card">
        <div className="metric-top">
          <span>Completed</span>
          <BookOpen size={20} />
        </div>
        <div className="metric-value">
          <strong>{completionTotals.completed}</strong>
        </div>
        <small>Course enrollments</small>
      </Card>
      <Card className="metric-card">
        <div className="metric-top">
          <span>In progress</span>
          <BookOpen size={20} />
        </div>
        <div className="metric-value">
          <strong>{completionTotals.inProgress}</strong>
        </div>
        <small>Active enrollments</small>
      </Card>
      <Card className="metric-card">
        <div className="metric-top">
          <span>Dropped</span>
          <BookOpen size={20} />
        </div>
        <div className="metric-value">
          <strong>{completionTotals.dropped}</strong>
        </div>
        <small>Needs attention</small>
      </Card>
    </section>
  );
}
