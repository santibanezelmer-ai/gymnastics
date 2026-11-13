import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface Column<T> {
  key: string
  header: React.ReactNode
  cell: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string
  emptyMessage?: React.ReactNode
  isLoading?: boolean
  className?: string
  rowClassName?: (item: T, index: number) => string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay registros disponibles',
  isLoading = false,
  className,
  rowClassName,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-16 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-r-transparent animate-spin" />
        <span>Cargando datos oficiales...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 text-center text-xs text-slate-500 font-medium rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/90',
        className
      )}
    >
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 font-bold', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/80 dark:text-slate-300">
          {data.map((item, idx) => (
            <tr
              key={keyExtractor(item, idx)}
              className={cn(
                'transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
                rowClassName && rowClassName(item, idx)
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.cell(item, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
