import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function Modal({
  open, onClose, title, children, size = 'md', footer,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] flex flex-col animate-slide-up', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
}) {
  if (!open) return null
  const btnClass = variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn bg-amber-500 text-white hover:bg-amber-600' : 'btn-primary'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 animate-slide-up">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary">{cancelText}</button>
          <button onClick={() => { onConfirm(); onClose() }} className={btnClass}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
