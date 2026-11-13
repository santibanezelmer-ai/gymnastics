import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface LoadingStateProps {
  message?: string
  submessage?: string
  className?: string
  variant?: 'spinner' | 'pulse' | 'radar'
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando información oficial...',
  submessage,
  className,
  variant = 'spinner',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4 space-y-3',
        className
      )}
    >
      {variant === 'spinner' && (
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="h-10 w-10 rounded-full border-3 border-blue-600/20 border-t-blue-600 animate-spin" />
        </div>
      )}

      {variant === 'pulse' && (
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-600 animate-ping" />
          <span className="h-3 w-3 rounded-full bg-indigo-600 animate-pulse" />
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-bounce" />
        </div>
      )}

      {variant === 'radar' && (
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 shadow-md shadow-blue-500/50" />
        </div>
      )}

      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        {message}
      </p>
      {submessage && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {submessage}
        </p>
      )}
    </div>
  )
}
