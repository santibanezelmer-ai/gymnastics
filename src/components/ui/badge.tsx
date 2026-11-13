import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline'
    | 'info'
    | 'purple'
    | 'amber'
    | 'mono'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-blue-100 text-blue-800 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    success:
      'bg-emerald-100 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-100 text-amber-900 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    danger:
      'bg-rose-100 text-rose-800 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    outline:
      'border-slate-300 text-slate-700 bg-transparent dark:border-slate-700 dark:text-slate-300',
    info:
      'bg-cyan-100 text-cyan-800 border-cyan-200/60 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60',
    purple:
      'bg-indigo-100 text-indigo-800 border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    amber:
      'bg-amber-400 text-slate-950 font-black border-amber-500/80 shadow-xs',
    mono:
      'bg-slate-100 text-slate-800 font-mono border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
