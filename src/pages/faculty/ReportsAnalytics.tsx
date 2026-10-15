import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, StatCard, EmptyState } from '@/components/ui'
import { Download, TrendingUp, Users, Briefcase, CheckCircle2, Calendar, FileText, Award } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

export default function ReportsAnalytics() {
  const { applications, students, internships, attendance, workLogs, companies } = useApp()
  const [dateRange, setDateRange] = useState('30')

  const appTimelineData = [
    { month: 'Jul', applications: 12 }, { month: 'Aug', applications: 18 },
    { month: 'Sep', applications: 25 }, { month: 'Oct', applications: 30 },
  ]

  const statusData = [
    { name: 'Applied', value: applications.filter(a => a.status === 'Applied').length, color: '#6366f1' },
    { name: 'Under Review', value: applications.filter(a => a.status === 'Under Review').length, color: '#f59e0b' },
    { name: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, color: '#3b82f6' },
    { name: 'Interview', value: applications.filter(a => a.status === 'Interview Scheduled').length, color: '#8b5cf6' },
    { name: 'Selected', value: applications.filter(a => a.status === 'Selected').length, color: '#22c55e' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const deptData = [
    { dept: 'CS', count: students.filter(s => s.department === 'Computer Science').length },
    { dept: 'IT', count: students.filter(s => s.department === 'IT').length },
    { dept: 'AI', count: students.filter(s => s.department === 'AI' || s.department === 'AI & Data').length },
    { dept: 'ECE', count: students.filter(s => s.department === 'Electronics').length },
    { dept: 'Math', count: students.filter(s => s.department === 'Mathematics').length },
    { dept: 'EEE', count: students.filter(s => s.department === 'Electrical').length },
  ]

  const attTrendData = [
    { month: 'Jul', avg: 87 }, { month: 'Aug', avg: 90 },
    { month: 'Sep', avg: 85 }, { month: 'Oct', avg: 88 },
  ]

  const completionData = [
    { month: 'Jul', rate: 88 }, { month: 'Aug', rate: 90 },
    { month: 'Sep', rate: 91 }, { month: 'Oct', rate: 92 },
  ]

  const placementData = [
    { month: 'Jul', placements: 8 }, { month: 'Aug', placements: 12 },
    { month: 'Sep', placements: 15 }, { month: 'Oct', placements: 20 },
  ]

  const performanceData = [
    { metric: 'Performance', avg: 4.2 },
    { metric: 'Communication', avg: 4.0 },
    { metric: 'Technical', avg: 4.3 },
    { metric: 'Professionalism', avg: 4.1 },
    { metric: 'Teamwork', avg: 4.2 },
  ]

  const handleExport = () => {
    const headers = ['Student Name', 'College', 'Department', 'Internship', 'Company', 'Status', 'Attendance %', 'Work Logs']
    const rows = students.map(s => {
      const app = applications.find(a => a.studentId === s.id)
      const att = attendance.filter(a => a.studentId === s.id)
      const attPct = att.length > 0 ? Math.round((att.filter(a => a.status === 'Present').length / att.length) * 100) : 0
      const wlCount = workLogs.filter(wl => wl.studentId === s.id).length
      return [s.name, s.college, s.department, app?.internshipTitle ?? 'N/A', app?.companyName ?? 'N/A', app?.status ?? 'No Application', `${attPct}%`, wlCount]
    })
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `internlink-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive internship analytics</p>
        </div>
        <div className="flex gap-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">This year</option>
          </select>
          <button onClick={handleExport} className="btn-primary text-sm"><Download size={16} /> Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={students.length} color="brand" />
        <StatCard icon={Briefcase} label="Active Internships" value={internships.filter(i => i.status === 'Active').length} color="blue" />
        <StatCard icon={FileText} label="Total Applications" value={applications.length} color="amber" />
        <StatCard icon={Award} label="Completion Rate" value="92%" color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Internship Applications Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appTimelineData}>
                <defs><linearGradient id="repApp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fill="url(#repApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map(d => <span key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}</span>)}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Internship Participation by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="dept" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attTrendData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Internship Completion Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionData}>
                <defs><linearGradient id="repComp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} fill="url(#repComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Internship Placements</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="placements" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Average Student Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="metric" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="avg" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Companies Participing</h3>
          <div className="space-y-2">
            {companies.slice(0, 8).map(c => {
              const count = internships.filter(i => i.companyId === c.id).length
              const appCount = applications.filter(a => a.companyId === c.id).length
              return (
                <div key={c.id} className="flex items-center gap-3 p-2.5 border border-gray-100 dark:border-gray-800 rounded-lg">
                  <div className={`w-8 h-8 ${c.logoColor} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {(c.name || 'Company').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('') || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{count} internships • {appCount} applications</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
