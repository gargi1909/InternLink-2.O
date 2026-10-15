import type { ApplicationStatus, WorkLogStatus, AttendanceStatus, InternshipStatus } from '@/types'

export function getStatusBadgeVariant(status: ApplicationStatus): 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'purple' {
  switch (status) {
    case 'Selected': return 'success'
    case 'Interview Scheduled': return 'info'
    case 'Shortlisted': return 'brand'
    case 'Under Review': return 'warning'
    case 'Rejected': return 'error'
    case 'Withdrawn': return 'default'
    default: return 'default'
  }
}

export function getWorkLogBadgeVariant(status: WorkLogStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'Reviewed': return 'success'
    case 'Submitted': return 'info'
    case 'Changes Requested': return 'error'
    case 'Draft': return 'default'
    default: return 'default'
  }
}

export function getAttendanceBadgeVariant(status: AttendanceStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'Present': return 'success'
    case 'Late': return 'warning'
    case 'Absent': return 'error'
    case 'Leave': return 'info'
    case 'Holiday': return 'default'
    default: return 'default'
  }
}

export function getInternshipBadgeVariant(status: InternshipStatus): 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' {
  switch (status) {
    case 'Active': return 'success'
    case 'Draft': return 'default'
    case 'Closed': return 'error'
    case 'Completed': return 'brand'
    default: return 'default'
  }
}

export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
