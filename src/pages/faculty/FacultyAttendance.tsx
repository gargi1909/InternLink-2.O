import { useApp } from '@/context/AppContext'
import { Card, StatCard, Badge, ProgressBar, EmptyState, Avatar } from '@/components/ui'
import { TrendingUp, AlertTriangle, Users, CheckCircle2, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function FacultyAttendance() {
  const { students, attendance, applications } = useApp()

  const getStudentAttendance = (studentId: string) => {
    const records = attendance.filter(a => a.studentId === studentId)
    const present = records.filter(a => a.status === 'Present').length
    return { pct: records.length > 0 ? Math.round((present / records.length) * 100) : 0, total: records.length, present, absent: records.filter(a => a.status === 'Absent').length, late: records.filter(a => a.status === 'Late').length }
  }

  const studentsWithAttendance = students.map(s => ({ student: s, ...getStudentAttendance(s.id) })).filter(s => s.total > 0)
  const avgAttendance = studentsWithAttendance.length > 0 ? Math.round(studentsWithAttendance.reduce((sum, s) => sum + s.pct, 0) / studentsWithAttendance.length) : 0
  const below75 = studentsWithAttendance.filter(s => s.pct < 75)
  const below60 = studentsWithAttendance.filter(s => s.pct < 60)

  const trendData = [
    { month: 'Jul', attendance: 87 }, { month: 'Aug', attendance: 90 },
    { month: 'Sep', attendance: 85 }, { month: 'Oct', attendance: 88 },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor student attendance across all internships</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Average Attendance" value={`${avgAttendance}%`} color="brand" />
        <StatCard icon={Users} label="Tracked Students" value={studentsWithAttendance.length} color="blue" />
        <StatCard icon={AlertTriangle} label="Below 75%" value={below75.length} color="amber" />
        <StatCard icon={XCircle} label="Below 60%" value={below60.length} color="red" />
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="facAtt2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} fill="url(#facAtt2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {below75.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900/30">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2"><AlertTriangle size={18} /> Students Requiring Attention</h3>
          <div className="space-y-2">
            {below75.map(s => (
              <div key={s.student.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Avatar name={s.student.name} color="bg-amber-500" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.student.name}</p>
                  <p className="text-xs text-gray-500">{s.student.department}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.pct < 60 ? 'text-red-600' : 'text-amber-600'}`}>{s.pct}%</p>
                  <p className="text-xs text-gray-500">{s.present}/{s.total} days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Student Attendance</h3>
        {studentsWithAttendance.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No attendance records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Attendance</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Present</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Absent</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Late</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithAttendance.sort((a, b) => a.pct - b.pct).map(s => (
                  <tr key={s.student.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.student.name} color="bg-brand-500" size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white truncate">{s.student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${s.pct >= 75 ? 'text-green-600' : s.pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{s.pct}%</span>
                        <div className="w-16 hidden sm:block"><ProgressBar value={s.pct} color={s.pct >= 75 ? 'green' : s.pct >= 60 ? 'amber' : 'red'} /></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.present}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.absent}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.late}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant={s.pct >= 75 ? 'success' : s.pct >= 60 ? 'warning' : 'error'}>
                        {s.pct >= 75 ? 'Good' : s.pct >= 60 ? 'Warning' : 'Critical'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
