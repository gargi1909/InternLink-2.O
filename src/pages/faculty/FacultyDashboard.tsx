import { useApp } from '@/context/AppContext'
import { Card, StatCard, Badge, EmptyState } from '@/components/ui'
import { Users, Briefcase, FileText, CheckCircle2, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'

export default function FacultyDashboard() {
  const { students, internships, applications, attendance, workLogs, faculty, currentFaculty } = useApp()

  const activeInternships = internships.filter(i => i.status === 'Active').length
  const interningStudents = applications.filter(a => a.status === 'Selected').length
  const pendingApprovals = workLogs.filter(wl => wl.status === 'Submitted').length

  const allAttendance = attendance
  const totalRecords = allAttendance.length
  const presentRecords = allAttendance.filter(a => a.status === 'Present').length
  const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
  const completionRate = 92

  const statusData = [
    { name: 'Applied', value: applications.filter(a => a.status === 'Applied').length, color: '#6366f1' },
    { name: 'Under Review', value: applications.filter(a => a.status === 'Under Review').length, color: '#f59e0b' },
    { name: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, color: '#3b82f6' },
    { name: 'Interview', value: applications.filter(a => a.status === 'Interview Scheduled').length, color: '#8b5cf6' },
    { name: 'Selected', value: applications.filter(a => a.status === 'Selected').length, color: '#22c55e' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const deptData = [
    { dept: 'CS', students: students.filter(s => s.department === 'Computer Science').length },
    { dept: 'IT', students: students.filter(s => s.department === 'IT').length },
    { dept: 'AI', students: students.filter(s => s.department === 'AI' || s.department === 'AI & Data').length },
    { dept: 'Electronics', students: students.filter(s => s.department === 'Electronics').length },
    { dept: 'Math', students: students.filter(s => s.department === 'Mathematics').length },
    { dept: 'Electrical', students: students.filter(s => s.department === 'Electrical').length },
  ]

  const attTrendData = [
    { month: 'Jul', attendance: 89 }, { month: 'Aug', attendance: 91 },
    { month: 'Sep', attendance: 88 }, { month: 'Oct', attendance: 92 },
  ]

  const pendingActions = [
    { icon: FileText, color: 'bg-amber-50 text-amber-600', title: `${pendingApprovals} work logs pending review`, link: '/faculty/work-logs' },
    { icon: AlertCircle, color: 'bg-red-50 text-red-600', title: `${students.length} students to monitor`, link: '/faculty/students' },
    { icon: Briefcase, color: 'bg-blue-50 text-blue-600', title: `${activeInternships} active internships`, link: '/faculty/internships' },
  ]

  const recentActivities = applications.slice(0, 5).map(app => ({
    name: app.studentName, action: `applied to ${app.companyName}`, time: app.appliedDate, status: app.status,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{currentFaculty?.name || 'Faculty Mentor'} • {currentFaculty?.college || 'VIT Chennai'} • {currentFaculty?.department || 'Computer Science'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Assigned Students" value={students.length} color="brand" />
        <StatCard icon={Briefcase} label="Active Internships" value={activeInternships} color="blue" />
        <StatCard icon={CheckCircle2} label="Students Interning" value={interningStudents} color="green" />
        <StatCard icon={FileText} label="Pending Approvals" value={pendingApprovals} color="amber" />
        <StatCard icon={TrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} color="purple" />
        <StatCard icon={CheckCircle2} label="Completion Rate" value={`${completionRate}%`} color="cyan" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Applications by Status</h3>
          {statusData.length > 0 ? (
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
          ) : <EmptyState icon={FileText} title="No data" />}
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map(d => <span key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}</span>)}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Students by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="dept" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attTrendData}>
                <defs>
                  <linearGradient id="facAttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} fill="url(#facAttGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {pendingActions.map((action, i) => (
              <Link key={i} to={action.link} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <action.icon size={18} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">{action.title}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivities.map((act, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 border border-gray-100 dark:border-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {(act.name || 'User').split(' ').filter(Boolean).map(w => w[0]).join('') || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">{act.name || 'User'}</span> {act.action}</p>
                <p className="text-xs text-gray-500">{act.time}</p>
              </div>
              <Badge variant="info">{act.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
