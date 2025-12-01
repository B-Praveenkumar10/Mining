import React from 'react';
import clsx from 'clsx';

export interface Column<T> {
  key: keyof T;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  dense?: boolean;
  zebra?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, data, emptyMessage = 'No data', dense = false, zebra = true, className }: DataTableProps<T>) {
  return (
    <div className={clsx('overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900', className)}>
      <table className={clsx('w-full text-sm', dense && 'text-xs')}> 
        <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} style={{ width: col.width }} className={clsx('font-semibold px-4 py-2 text-left', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">{emptyMessage}</td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={idx} className={clsx(zebra && idx % 2 === 1 ? 'bg-neutral-50 dark:bg-neutral-800/40' : '', 'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition')}> 
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={clsx('px-4 py-2 whitespace-nowrap', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
