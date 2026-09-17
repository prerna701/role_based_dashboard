import { Ring } from '@/components/ui/ring';

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <Ring width={28} height={28} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
