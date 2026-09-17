import type { ReactNode } from 'react';

type DataTableProps = {
  children: ReactNode;
  className?: string;
  minWidth?: number;
};

export function DataTable({
  children,
  className = '',
  minWidth = 860,
}: DataTableProps) {
  return (
    <div className="data-table-wrap">
      <table
        className={`data-table ${className}`.trim()}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}
