import type { ReactNode } from 'react';

import type { DataTableProps } from '@/types/components';
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
