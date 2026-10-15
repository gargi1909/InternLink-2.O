import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, StatCard, EmptyState } from '@/components/ui'
import Modal from '@/components/Modal'
import { getAttendanceBadgeVariant, formatDate } from '@/utils/helpers'
import { CheckCircle2, XCircle, Clock, Users, Eye, MessageSquare } from 'lucide-react'

export default function CompanyAttendance() {
  const { currentCompany, applications, attendance, students, showToast } = useApp()
  const [viewStudent, setViewStudent] = useState<string | null>(null)

  if (!currentCompany) return null

  const selectedApps = applications.filter(a => a.companyId === currentCompany.id && a.status === 'Selected')
  const internStudents = selectedApps.map(app => students.find(s => s.id === app.studentId)).filter(Boolean)

  const studentAttendance = useMemo(() => {
    if (!viewStudent) return []
    return attendance.filter(a => a.studentId === viewStudent).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15)
  }, [viewStudent, attendance])

  const getStudentStats = (studentId: string) => {
    const records = attendance.filter(a => a.studentId === studentId)
    const present = records.filter(a => a.status === 'Present').length
    const absent = records.filter(a => a.status === 'Absent').length
    const late = records.filter(a => a.status === 'Late').length
    const pct = records.length > 0 ? Math.round((present / records.length) * 100) : 0
    const lastRecord = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return { present, absent, late, pct, lastRecord }
  }

  const handleApprove = (studentId: string) => {
    showToast('success', 'Attendance approved for this student.')
  }

  const handleMarkCorrection = (studentId: string) => {
    showToast('info', 'Correction request noted.')
  }

  const viewingStudent = viewStudent ? students.find(s => s.id === viewStudent) : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your interns' attendance</p>
      </div>

      {internStudents.length === 0 ? (
        <Card><EmptyState icon={Users} title="No current interns" description="Interns you've selected will appear here for attendance monitoring." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Interns" value={internStudents.length} color="brand" />
            <StatCard icon={CheckCircle2} label="Above 75%" value={internStudents.filter(s => s && getStudentStats(s.id).pct >= 75).length} color="green" />
            <StatCard icon={Clock} label="Below 75%" value={internStudents.filter(s => s && getStudentStats(s.id).pct < 75 && getStudentStats(s.id).pct >= 60).length} color="amber" />
            <StatCard icon={XCircle} label="Below 60%" value={internStudents.filter(s => s && getStudentStats(s.id).pct < 60).length} color="red" />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Internship</th>
                    <th className="px-4 py-3 font-medium">Attendance</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Present</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Absent</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Last Attendance</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internStudents.map(student => {
                    if (!student) return null
                    const stats = getStudentStats(student.id)
                    const app = selectedApps.find(a => a.studentId === student.id)
                    return (
                      <tr key={student.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {(student.name || 'Student').split(' ').filter(Boolean).map(w => w[0]).join('') || 'S'}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{student.name || 'Student'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell truncate max-w-[150px]">{app?.internshipTitle ?? '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${stats.pct >= 75 ? 'text-green-600' : stats.pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{stats.pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{stats.present}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{stats.absent}</td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{stats.lastRecord ? formatDate(stats.lastRecord.date) : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button onClick={() => setViewStudent(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal
        open={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={viewingStudent ? `${viewingStudent.name} — Attendance Details` : ''}
        size="lg"
        footer={
          <>
            <button onClick={() => viewStudent && handleMarkCorrection(viewStudent)} className="btn-secondary"><MessageSquare size={16} /> Mark Correction</button>
            <button onClick={() => viewStudent && handleApprove(viewStudent)} className="btn-primary"><CheckCircle2 size={16} /> Approve Attendance</button>
          </>
        }
      >
        {viewingStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{getStudentStats(viewingStudent.id).present}</p><p className="text-xs text-gray-500">Present</p></div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center"><p className="text-2xl font-bold text-red-600">{getStudentStats(viewingStudent.id).absent}</p><p className="text-xs text-gray-500">Absent</p></div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center"><p className="text-2xl font-bold text-amber-600">{getStudentStats(viewingStudent.id).late}</p><p className="text-xs text-gray-500">Late</p></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Recent Records</h4>
              <div className="space-y-1.5">
                {studentAttendance.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-800 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(rec.date)}</span>
                    <div className="flex items-center gap-2">
                      {rec.checkInTime && <span className="text-xs text-gray-500">{rec.checkInTime}</span>}
                      <Badge variant={getAttendanceBadgeVariant(rec.status)}>{rec.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
