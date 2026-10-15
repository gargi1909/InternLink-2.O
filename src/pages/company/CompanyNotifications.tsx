import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, EmptyState } from '@/components/ui'
import { formatTimeAgo } from '@/utils/helpers'
import {
  Bell, CheckCheck, Filter, FileText, Calendar, Clock, ClipboardList,
  MessageSquare, Building2, Info, UserCheck
} from 'lucide-react'
import type { NotificationCategory } from '@/types'

const categoryIcons: Record<NotificationCategory, React.ElementType> = {
  'Application': FileText,
  'Interview': Calendar,
  'Attendance': ClipboardList,
  'Work Log': Clock,
  'Faculty': MessageSquare,
  'Company': Building2,
  'System': Info,
}

const categoryColors: Record<NotificationCategory, string> = {
  'Application': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  'Interview': 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  'Attendance': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  'Work Log': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  'Faculty': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Company': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
  'System': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function CompanyNotifications() {
  const { currentCompany, notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  if (!currentCompany) return null

  const myNotifs = notifications.filter(n => n.userId === currentCompany.id)
  const unread = myNotifs.filter(n => !n.read)
  const filtered = filter === 'unread' ? unread : myNotifs

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unread.length} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')} className="btn-secondary text-sm">
            <Filter size={16} /> {filter === 'all' ? 'Unread only' : 'All'}
          </button>
          {unread.length > 0 && (
            <button onClick={() => markAllNotificationsRead(currentCompany.id)} className="btn-primary text-sm">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Bell} title={filter === 'unread' ? 'No unread notifications' : 'No notifications'} description="New notifications will appear here." /></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const Icon = categoryIcons[notif.category] ?? Bell
            const color = categoryColors[notif.category] ?? categoryColors.System
            return (
              <Card
                key={notif.id}
                className={`p-4 cursor-pointer transition-all ${!notif.read ? 'border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                onClick={() => !notif.read && markNotificationRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{notif.title}</p>
                      <Badge variant="default" className="text-xs">{notif.category}</Badge>
                      {!notif.read && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.description}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatTimeAgo(notif.timestamp)}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
