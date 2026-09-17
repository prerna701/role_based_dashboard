import type { EmptyStateProps } from '@/types/components';
export function EmptyState({ message }: EmptyStateProps) {
  return <p className="empty-state">{message}</p>;
}
