import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Badge({ children, variant = 'default', className }: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'purple'
  className?: string
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return <span className={cn('badge', variants[variant], className)}>{children}</span>
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn('card p-5', className, onClick && 'cursor-pointer hover:shadow-md transition-shadow')}>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, color = 'brand', trend, trendValue }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: 'brand' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan'
  trend?: 'up' | 'down'
  trendValue?: string
}) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
  }
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trendValue && (
            <p className={`text-xs mt-1 font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  )
}

export function ProgressBar({ value, className, color = 'brand' }: { value: number; className?: string; color?: 'brand' | 'green' | 'amber' | 'red' }) {
  const colors = {
    brand: 'bg-brand-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }
  return (
    <div className={cn('w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', colors[color])} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 mt-3">{text}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
    </div>
  )
}

export function Avatar({ name, color, size = 'md' }: { name?: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = (name || '').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  return (
    <div className={`${sizes[size]} ${color ?? 'bg-brand-500'} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}

export function CompanyLogo({ name, color, size = 'md' }: { name?: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = (name || '').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' }
  return (
    <div className={`${sizes[size]} ${color ?? 'bg-blue-600'} rounded-lg flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  )
}
