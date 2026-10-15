import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, StatCard, EmptyState } from '@/components/ui'
import { getStatusBadgeVariant, formatDate } from '@/utils/helpers'
import { Search, FileText, Users, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ApplicationStatus } from '@/types'

export default function FacultyApplications() {
  const { applications, students, companies } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    let result = applications
    if (search) result = result.filter(a => a.studentName.toLowerCase().includes(search.toLowerCase()) || a.companyName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) result = result.filter(a => a.status === statusFilter)
    return result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
  }, [applications, search, statusFilter])

  const statuses: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected']

  const statusCounts = statuses.map(s => ({ name: s, value: applications.filter(a => a.status === s).length }))
  const statusData = statusCounts.filter(d => d.value > 0).map((d, i) => ({ ...d, color: ['#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'][i] }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Applications</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} applications across all internships</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total" value={applications.length} color="brand" />
        <StatCard icon={CheckCircle2} label="Selected" value={applications.filter(a => a.status === 'Selected').length} color="green" />
        <StatCard icon={Clock} label="Pending" value={applications.filter(a => ['Applied', 'Under Review'].includes(a.status)).length} color="amber" />
        <StatCard icon={XCircle} label="Rejected" value={applications.filter(a => a.status === 'Rejected').length} color="red" />
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Status Distribution</h3>
        {statusData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {statusData.map(d => <span key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}</span>)}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by student or company..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No applications found" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Position</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {app.studentName.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate">{app.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell truncate max-w-[120px]">{app.companyName}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell truncate max-w-[130px]">{app.internshipTitle}</td>
                    <td className="px-4 py-3"><Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(app.appliedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
