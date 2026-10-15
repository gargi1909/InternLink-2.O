import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, StatCard, EmptyState } from '@/components/ui'
import { ConfirmDialog } from '@/components/Modal'
import { getAttendanceBadgeVariant } from '@/utils/helpers'
import { CheckCircle2, XCircle, Clock, Calendar, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import type { AttendanceStatus } from '@/types'

export default function Attendance() {
  const { currentStudent, attendance, markAttendance } = useApp()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [confirmMark, setConfirmMark] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'Present' | 'Late'>('Present')

  if (!currentStudent) return null

  const myAttendance = attendance.filter(a => a.studentId === currentStudent.id)
  const present = myAttendance.filter(a => a.status === 'Present').length
  const absent = myAttendance.filter(a => a.status === 'Absent').length
  const late = myAttendance.filter(a => a.status === 'Late').length
  const total = myAttendance.length
  const pct = total > 0 ? Math.round((present / total) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const todayRecord = myAttendance.find(a => a.date === today)

  const monthYear = currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getDayStatus = (day: number): AttendanceStatus | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = myAttendance.find(a => a.date === dateStr)
    return record?.status ?? null
  }

  const statusColors: Record<string, string> = {
    'Present': 'bg-green-500 text-white',
    'Absent': 'bg-red-500 text-white',
    'Late': 'bg-amber-500 text-white',
    'Leave': 'bg-blue-500 text-white',
    'Holiday': 'bg-gray-300 text-gray-600',
  }

  const monthlyData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct']
    return months.map((m, i) => {
      const monthRecords = myAttendance.filter(a => {
        const d = new Date(a.date)
        return d.getMonth() === 6 + i
      })
      return { month: m, Present: monthRecords.filter(a => a.status === 'Present').length, Late: monthRecords.filter(a => a.status === 'Late').length, Absent: monthRecords.filter(a => a.status === 'Absent').length }
    })
  }, [myAttendance])

  const recentRecords = [...myAttendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  const handleMarkToday = () => {
    markAttendance(currentStudent.id, today, selectedStatus)
    setConfirmMark(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Track your daily attendance</p>
        </div>
        {!todayRecord && (
          <div className="flex gap-2">
            <button onClick={() => { setSelectedStatus('Present'); setConfirmMark(true) }} className="btn-primary text-sm">
              <CalendarCheck size={16} /> Mark Today Present
            </button>
            <button onClick={() => { setSelectedStatus('Late'); setConfirmMark(true) }} className="btn-secondary text-sm">
              <Clock size={16} /> Mark Late
            </button>
          </div>
        )}
        {todayRecord && (
          <Badge variant={getAttendanceBadgeVariant(todayRecord.status)}>Today: {todayRecord.status} at {todayRecord.checkInTime}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Present" value={present} color="green" />
        <StatCard icon={XCircle} label="Absent" value={absent} color="red" />
        <StatCard icon={Clock} label="Late" value={late} color="amber" />
        <StatCard icon={Calendar} label="Attendance %" value={`${pct}%`} color="brand" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{monthYear}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              const isToday = today === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                    status ? statusColors[status] : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                  } ${isToday ? 'ring-2 ring-brand-500' : ''}`}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded" /> Present</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /> Late</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Absent</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /> Leave</span>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Attendance Chart</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance History</h3>
        {recentRecords.length === 0 ? (
          <EmptyState icon={Calendar} title="No attendance records" description="Your attendance history will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map(rec => (
                  <tr key={rec.id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-3 py-2.5 text-gray-900 dark:text-white">{new Date(rec.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-gray-500">{new Date(rec.date).toLocaleDateString('en', { weekday: 'long' })}</td>
                    <td className="px-3 py-2.5"><Badge variant={getAttendanceBadgeVariant(rec.status)}>{rec.status}</Badge></td>
                    <td className="px-3 py-2.5 text-gray-500">{rec.checkInTime ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmMark}
        onClose={() => setConfirmMark(false)}
        onConfirm={handleMarkToday}
        title="Confirm Attendance"
        message={`Mark today's attendance as ${selectedStatus}?`}
        confirmText="Confirm"
      />
    </div>
  )
}
