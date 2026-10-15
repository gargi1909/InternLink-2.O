import { useApp } from '@/context/AppContext'
import { Card, StatCard, Badge, ProgressBar, CompanyLogo, Avatar } from '@/components/ui'
import { getStatusBadgeVariant } from '@/utils/helpers'
import { internshipTasks } from '@/data/mockData'
import {
  FileText, CheckCircle2, Briefcase, Calendar, Clock, TrendingUp,
  Bell, MapPin, ArrowRight, Award, Target, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useState, useMemo } from 'react'

export default function StudentDashboard() {
  const { currentStudent, applications, attendance, internships, notifications } = useApp()

  if (!currentStudent) return null

  const myApps = applications.filter(a => a.studentId === currentStudent.id)
  const activeApps = myApps.filter(a => !['Withdrawn', 'Rejected'].includes(a.status))
  const shortlisted = myApps.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled')
  const interviewApp = myApps.find(a => a.status === 'Interview Scheduled')
  const selectedApp = myApps.find(a => a.status === 'Selected')

  const myAttendance = attendance.filter(a => a.studentId === currentStudent.id)
  const presentDays = myAttendance.filter(a => a.status === 'Present').length
  const totalDays = myAttendance.length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const pendingTasks = internshipTasks.filter(t => !t.completed).length

  const myNotifs = notifications.filter(n => n.userId === currentStudent.id && !n.read)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const attendanceData = useMemo(() => {
    const last7 = myAttendance.slice(-7)
    return last7.map(a => ({ day: new Date(a.date).toLocaleDateString('en', { weekday: 'short' }), value: a.status === 'Present' ? 100 : a.status === 'Late' ? 60 : 0 }))
  }, [myAttendance])

  const studentSkills = Array.isArray(currentStudent.skills) ? currentStudent.skills : []
  const recommended = internships.filter(i => (i.status === 'Active' || (i.status as string) === 'Open') && i.requiredSkills?.some(s => studentSkills.includes(s))).slice(0, 4)

  const activities = [
    { icon: FileText, color: 'bg-blue-50 text-blue-600', title: 'Application submitted', desc: 'Frontend Developer Intern at TechNova Solutions', time: '2 hours ago' },
    { icon: CheckCircle2, color: 'bg-green-50 text-green-600', title: 'Application shortlisted', desc: 'AI/ML Intern at InnovateX', time: '5 hours ago' },
    { icon: Calendar, color: 'bg-amber-50 text-amber-600', title: 'Interview scheduled', desc: 'TechNova Solutions — Oct 15, 11:00 AM', time: '1 day ago' },
    { icon: TrendingUp, color: 'bg-brand-50 text-brand-600', title: 'Work log reviewed', desc: 'Dr. Priya Nair reviewed your Oct 6 log', time: '2 days ago' },
  ]

  const progressSteps = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Internship']
  const currentStep = interviewApp ? 2 : shortlisted.length > 0 ? 1 : 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {(currentStudent.name || 'Student').split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">{currentStudent.college} • {currentStudent.course}</p>
        </div>
        <Link to="/student/internships" className="btn-primary text-sm">
          <Briefcase size={16} /> Browse Internships
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Active Applications" value={activeApps.length} color="brand" />
        <StatCard icon={CheckCircle2} label="Shortlisted" value={shortlisted.length} color="green" />
        <StatCard icon={Briefcase} label="Current Internship" value={selectedApp ? '1' : '0'} color="blue" />
        <StatCard icon={Calendar} label="Attendance" value={`${attendancePct}%`} color="amber" />
      </div>

      {/* Upcoming */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Progress</h3>
          <div className="flex items-center justify-between mb-6">
            {progressSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStep ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {i < currentStep ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 text-center ${i <= currentStep ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Interview scheduled</p>
                <p className="text-xs text-gray-500">{interviewApp ? `${interviewApp.internshipTitle} at ${interviewApp.companyName} — ${interviewApp.interviewDate} at ${interviewApp.interviewTime}` : 'No upcoming interviews'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Work log due</p>
                <p className="text-xs text-gray-500">Submit today's daily work log</p>
              </div>
              <Link to="/student/work-logs" className="btn-secondary text-xs px-3 py-1.5">Submit</Link>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                <Target size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pending tasks</p>
                <p className="text-xs text-gray-500">{pendingTasks} tasks remaining in your internship</p>
              </div>
              <Link to="/student/internship" className="btn-secondary text-xs px-3 py-1.5">View</Link>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Overview</h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-brand-600">{attendancePct}%</p>
            <p className="text-xs text-gray-500 mt-1">{presentDays} of {totalDays} days present</p>
          </div>
          <div className="h-32 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData.length > 0 ? attendanceData : [{ day: 'Mon', value: 100 }, { day: 'Tue', value: 100 }, { day: 'Wed', value: 100 }, { day: 'Thu', value: 60 }, { day: 'Fri', value: 100 }]}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Link to="/student/attendance" className="btn-secondary w-full mt-2 text-xs">View Details</Link>
        </Card>
      </div>

      {/* Internship overview + activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Current Internship</h3>
            <Link to="/student/internship" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {selectedApp ? (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <CompanyLogo name={selectedApp.companyName} color={selectedApp.companyLogoColor} size="md" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedApp.internshipTitle}</h4>
                  <p className="text-sm text-gray-500">{selectedApp.companyName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><p className="text-xs text-gray-500">Duration</p><p className="font-medium text-gray-900 dark:text-white">6 months</p></div>
                <div><p className="text-xs text-gray-500">Start Date</p><p className="font-medium text-gray-900 dark:text-white">Jan 15, 2026</p></div>
                <div><p className="text-xs text-gray-500">Mentor</p><p className="font-medium text-gray-900 dark:text-white">Rajesh Kumar</p></div>
                <div><p className="text-xs text-gray-500">Status</p><Badge variant="success">In Progress</Badge></div>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">68%</span>
              </div>
              <ProgressBar value={68} />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-3">No active internship yet</p>
              <Link to="/student/internships" className="btn-primary text-sm">Find Internship</Link>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <act.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{act.title}</p>
                  <p className="text-xs text-gray-500">{act.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommended */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Internships</h3>
          <Link to="/student/internships" className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommended.map(internship => (
            <div key={internship.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{internship.title}</p>
                <p className="text-xs text-gray-500 truncate">{internship.companyName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {internship.location}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">₹{internship.stipend.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
