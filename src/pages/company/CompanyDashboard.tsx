import { useApp } from '@/context/AppContext'
import { Card, StatCard, Badge, CompanyLogo, EmptyState } from '@/components/ui'
import { getStatusBadgeVariant, formatDate } from '@/utils/helpers'
import { Briefcase, FileText, Users, CheckCircle2, TrendingUp, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'

export default function CompanyDashboard() {
  const { currentCompany, internships, applications } = useApp()

  if (!currentCompany) return null

  const myInternships = internships.filter(i => i.companyId === currentCompany.id)
  const activeInternships = myInternships.filter(i => i.status === 'Active')
  const myApps = applications.filter(a => a.companyId === currentCompany.id)
  const shortlisted = myApps.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled')
  const currentInterns = myApps.filter(a => a.status === 'Selected')

  const appStatusData = [
    { name: 'Applied', value: myApps.filter(a => a.status === 'Applied').length, color: '#6366f1' },
    { name: 'Under Review', value: myApps.filter(a => a.status === 'Under Review').length, color: '#f59e0b' },
    { name: 'Shortlisted', value: myApps.filter(a => a.status === 'Shortlisted').length, color: '#3b82f6' },
    { name: 'Interview', value: myApps.filter(a => a.status === 'Interview Scheduled').length, color: '#8b5cf6' },
    { name: 'Selected', value: myApps.filter(a => a.status === 'Selected').length, color: '#22c55e' },
    { name: 'Rejected', value: myApps.filter(a => a.status === 'Rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const appTimelineData = [
    { day: 'Mon', applications: 3 },
    { day: 'Tue', applications: 5 },
    { day: 'Wed', applications: 2 },
    { day: 'Thu', applications: 7 },
    { day: 'Fri', applications: 4 },
    { day: 'Sat', applications: 1 },
    { day: 'Sun', applications: 0 },
  ]

  const upcomingInterviews = myApps.filter(a => a.status === 'Interview Scheduled').slice(0, 5)
  const recentApps = [...myApps].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {currentCompany.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{currentCompany.industry} • {currentCompany.location}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Internships" value={activeInternships.length} color="brand" />
        <StatCard icon={FileText} label="Total Applications" value={myApps.length} color="blue" />
        <StatCard icon={Users} label="Shortlisted" value={shortlisted.length} color="amber" />
        <StatCard icon={CheckCircle2} label="Current Interns" value={currentInterns.length} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} /> Applications Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appTimelineData}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fill="url(#appGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Status Distribution</h3>
          {appStatusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {appStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={FileText} title="No applications yet" />}
          <div className="flex flex-wrap gap-2 mt-2">
            {appStatusData.map(d => <span key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}</span>)}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
            <Link to="/company/applications" className="text-xs text-brand-600 font-medium">View all</Link>
          </div>
          {recentApps.length === 0 ? <EmptyState icon={FileText} title="No applications" /> : (
            <div className="space-y-2">
              {recentApps.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-2.5 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {app.studentName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.studentName}</p>
                    <p className="text-xs text-gray-500 truncate">{app.internshipTitle}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Interviews</h3>
            <Link to="/company/applications" className="text-xs text-brand-600 font-medium">View all</Link>
          </div>
          {upcomingInterviews.length === 0 ? <EmptyState icon={Calendar} title="No upcoming interviews" /> : (
            <div className="space-y-2">
              {upcomingInterviews.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.studentName}</p>
                    <p className="text-xs text-gray-500">{app.interviewDate} at {app.interviewTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Interns</h3>
        {currentInterns.length === 0 ? <EmptyState icon={Users} title="No current interns" /> : (
          <div className="grid sm:grid-cols-2 gap-3">
            {currentInterns.map(intern => (
              <div key={intern.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {intern.studentName.split(' ').map(w => w[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{intern.studentName}</p>
                  <p className="text-xs text-gray-500">{intern.internshipTitle}</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
