import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'amber' | 'indigo'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'touch'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all rounded-xl select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100'

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20 hover:from-blue-500 hover:to-indigo-500 ring-1 ring-blue-400/30',
      secondary:
        'bg-slate-900 text-slate-100 border border-slate-700/80 hover:bg-slate-800 hover:text-white shadow-xs',
      outline:
        'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      danger:
        'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-900/20 hover:from-rose-500 hover:to-red-500 ring-1 ring-rose-400/30',
      success:
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 ring-1 ring-emerald-400/30',
      amber:
        'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-900/20 hover:from-amber-400 hover:to-amber-500 ring-1 ring-amber-300/40 font-black',
      indigo:
        'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/20 hover:from-indigo-500 hover:to-violet-500 ring-1 ring-indigo-400/30',
    }

    const sizeStyles = {
      xs: 'px-2 py-1 text-[11px] gap-1 rounded-lg',
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-xs sm:text-sm gap-2',
      lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
      icon: 'p-2 rounded-xl',
      touch: 'min-h-[48px] px-5 py-3 text-sm sm:text-base gap-2.5 rounded-2xl font-black',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
            <span>Cargando...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
