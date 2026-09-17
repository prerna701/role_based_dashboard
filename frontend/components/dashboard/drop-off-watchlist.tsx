import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from './empty-state';
import type { DropOffRisk } from '@/types/analytics';

type DropOffWatchlistProps = {
  dropOffRisks: DropOffRisk[];
};

export function DropOffWatchlist({ dropOffRisks }: DropOffWatchlistProps) {
  return (
    <Card className="table-card" title="Drop-off Risk Watchlist" eyebrow="Direct backend endpoint">
      <div className="risk-list">
        {dropOffRisks.length === 0 ? (
          <EmptyState message="No drop-off risks were returned." />
        ) : dropOffRisks.map((risk) => (
          <article key={`${risk.course}-${risk.region}`} className="risk-item">
            <BookOpen size={18} />
            <div>
              <strong>{risk.course}</strong>
              <span>{risk.region} region</span>
            </div>
            <b>{risk.dropRate}% drop rate</b>
          </article>
        ))}
      </div>
    </Card>
  );
}
