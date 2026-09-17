import { Card } from '@/components/ui/card';
import {
  enrollmentStatusLabels,
  type EnrollmentStatus,
} from '@/lib/formatters';
import type { CompletionTotals } from '@/types/components';

import type { CompletionStatusCardProps } from '@/types/components';
const completionRows: Array<{
  key: keyof CompletionTotals;
  labelKey: EnrollmentStatus;
  className: string;
}> = [
  { key: 'completed', labelKey: 'completed', className: 'bar-completed' },
  { key: 'inProgress', labelKey: 'in_progress', className: 'bar-inProgress' },
  { key: 'dropped', labelKey: 'dropped', className: 'bar-dropped' },
];

export function CompletionStatusCard({ totals }: CompletionStatusCardProps) {
  const total = totals.completed + totals.inProgress + totals.dropped;

  return (
    <Card
      className="completion-card"
      title="Completion status"
      eyebrow="Current page enrollment distribution"
    >
      <div className="completion-bars">
        {completionRows.map((row) => {
          const value = totals[row.key];
          const percent = total ? Math.round((value / total) * 100) : 0;

          return (
            <div className="completion-bar-row" key={row.key}>
              <strong>{enrollmentStatusLabels[row.labelKey]}</strong>
              <span>
                <i className={row.className} style={{ width: `${percent}%` }} />
              </span>
              <b>
                {value} ({percent}%)
              </b>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
