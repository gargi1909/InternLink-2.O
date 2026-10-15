import { useEffect, useState } from 'react'
import { Card, StatCard, Badge, ProgressBar, EmptyState } from '@/components/ui'
import { api } from '@/services/api'
import {
  Users, Building2, Briefcase, Award, Shield, FileText,
  UserCheck, AlertCircle, ArrowRight, CheckCircle2, History
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAdminDashboard()
        if (res.success) {
          setData(res)
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading TPO & Admin Dashboard...
      </div>
    )
  }

  const stats = data?.stats || {
    totalStudents: 20,
    totalFaculty: 2,
    totalCompanies: 3,
    totalInternships: 4,
    totalApplications: 4,
    selectedCount: 2,
    placementRate: 50,
  }

  const mentorLoads = data?.mentorLoads || []
  const auditLogs = data?.recentAuditLogs || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TPO & Admin Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">Institution-wide internship management, faculty quotas, and audit logs</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/assignments" className="btn-primary text-sm">
            <UserCheck size={16} /> Manage Mentor Assignments
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="brand" />
        <StatCard icon={UserCheck} label="Faculty Mentors" value={stats.totalFaculty} color="blue" />
        <StatCard icon={Building2} label="Registered Companies" value={stats.totalCompanies} color="purple" />
        <StatCard icon={Briefcase} label="Active Internships" value={stats.totalInternships} color="amber" />
      </div>

      {/* Secondary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Applications Submitted" value={stats.totalApplications} color="blue" />
        <StatCard icon={CheckCircle2} label="Placed Interns" value={stats.selectedCount} color="green" />
        <StatCard icon={Award} label="Placement Rate" value={`${stats.placementRate}%`} color="brand" />
      </div>

      {/* Faculty Mentorship Quotas & Loads */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Faculty Mentor Supervision Loads</h3>
            <p className="text-xs text-gray-500 mt-0.5">Recommended college capacity: ~23 students per mentor</p>
          </div>
          <Link to="/admin/assignments" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
            Assign Students <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {mentorLoads.map((mentor: any) => (
            <div key={mentor.mentorId} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{mentor.name}</h4>
                  <p className="text-xs text-gray-500">{mentor.department} • Capacity: {mentor.maxCapacity} students</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={mentor.assignedCount > 23 ? 'error' : mentor.assignedCount >= 18 ? 'warning' : 'success'}>
                    {mentor.assignedCount} / {mentor.maxCapacity} students assigned
                  </Badge>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{mentor.loadPercentage}% load</span>
                </div>
              </div>
              <ProgressBar value={mentor.loadPercentage} />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Administrative Audit Trail */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-brand-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Administrative Audit Logs</h3>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {auditLogs.length === 0 ? (
            <EmptyState icon={Shield} title="No audit logs recorded yet" />
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <div>
                  <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2">{log.details || log.targetType}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
