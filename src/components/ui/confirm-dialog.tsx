import React from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary' | 'success'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  isLoading = false,
}) => {
  const iconMap = {
    danger: <AlertTriangle className="h-6 w-6 text-rose-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    primary: <Info className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
  }

  const buttonVariantMap = {
    danger: 'danger' as const,
    warning: 'amber' as const,
    primary: 'primary' as const,
    success: 'success' as const,
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={!isLoading}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {iconMap[variant]}
          </div>
          <div>
            <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h4>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={buttonVariantMap[variant]}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
