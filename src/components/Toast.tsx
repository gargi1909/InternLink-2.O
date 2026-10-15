import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  }
  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => {
        const Icon = icons[toast.type]
        return (
          <div key={toast.id} className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in', colors[toast.type])}>
            <Icon size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
