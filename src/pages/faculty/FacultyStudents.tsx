import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, Avatar, EmptyState, ProgressBar } from '@/components/ui'
import Modal from '@/components/Modal'
import { Search, Eye, Users } from 'lucide-react'
import type { Student } from '@/types'

export default function FacultyStudents() {
  const { students, applications, attendance, workLogs, feedback } = useApp()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewStudent, setViewStudent] = useState<Student | null>(null)

  const departments = useMemo(() => [...new Set(students.map(s => s.department))], [students])

  const getStudentStatus = (studentId: string): string => {
    const selected = applications.find(a => a.studentId === studentId && a.status === 'Selected')
    if (selected) return 'Interning'
    const interview = applications.find(a => a.studentId === studentId && a.status === 'Interview Scheduled')
    if (interview) return 'Interview'
    const shortlisted = applications.find(a => a.studentId === studentId && a.status === 'Shortlisted')
    if (shortlisted) return 'Shortlisted'
    const applied = applications.find(a => a.studentId === studentId && !['Withdrawn', 'Rejected'].includes(a.status))
    if (applied) return 'Applied'
    return 'No Application'
  }

  const getStudentAttendance = (studentId: string) => {
    const records = attendance.filter(a => a.studentId === studentId)
    const present = records.filter(a => a.status === 'Present').length
    return records.length > 0 ? Math.round((present / records.length) * 100) : 0
  }

  const getStudentCompletion = (studentId: string) => {
    const selected = applications.find(a => a.studentId === studentId && a.status === 'Selected')
    if (!selected) return 0
    const att = getStudentAttendance(studentId)
    const logs = workLogs.filter(wl => wl.studentId === studentId)
    const submitted = logs.filter(l => l.status === 'Submitted' || l.status === 'Reviewed').length
    const hasFb = feedback.some(f => f.studentId === studentId)
    return Math.min(95, Math.round(att * 0.4 + (submitted / Math.max(1, logs.length)) * 30 + (hasFb ? 25 : 10)))
  }

  const filtered = useMemo(() => {
    let result = students
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.collegeId.toLowerCase().includes(search.toLowerCase()))
    if (deptFilter) result = result.filter(s => s.department === deptFilter)
    if (statusFilter) result = result.filter(s => getStudentStatus(s.id) === statusFilter)
    return result
  }, [students, search, deptFilter, statusFilter])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assigned Students</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} students in your mentorship group</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name or college ID..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All statuses</option>
          <option>Interning</option><option>Interview</option><option>Shortlisted</option><option>Applied</option><option>No Application</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No students found" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">College ID</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Attendance</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Completion</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const status = getStudentStatus(student.id)
                  const att = getStudentAttendance(student.id)
                  const completion = getStudentCompletion(student.id)
                  return (
                    <tr key={student.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={student.name} color="bg-brand-500" size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                            <p className="text-xs text-gray-500 truncate">{student.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{student.collegeId}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{student.department}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status === 'Interning' ? 'success' : status === 'Interview' ? 'info' : status === 'Shortlisted' ? 'brand' : status === 'Applied' ? 'warning' : 'default'}>
                          {status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`font-medium ${att >= 75 ? 'text-green-600' : att >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{att}%</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="w-20"><ProgressBar value={completion} /></div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setViewStudent(student)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 inline-flex">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details" size="lg">
        {viewStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewStudent.name} color="bg-brand-500" size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{viewStudent.name}</h3>
                <p className="text-sm text-gray-500">{viewStudent.college}</p>
                <p className="text-xs text-gray-400">{viewStudent.collegeId} • {viewStudent.course} • {viewStudent.year}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewStudent.department}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-xs text-gray-500">Status</p><p className="text-sm font-medium"><Badge variant="brand">{getStudentStatus(viewStudent.id)}</Badge></p></div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-xs text-gray-500">Attendance</p><p className="text-sm font-bold text-brand-600">{getStudentAttendance(viewStudent.id)}%</p></div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-xs text-gray-500">Completion</p><p className="text-sm font-bold text-green-600">{getStudentCompletion(viewStudent.id)}%</p></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">{viewStudent.skills.map(s => <Badge key={s} variant="brand">{s}</Badge>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Applications</h4>
              <div className="space-y-1.5">
                {applications.filter(a => a.studentId === viewStudent.id).slice(0, 5).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-800 rounded-lg text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{app.internshipTitle} at {app.companyName}</span>
                    <Badge variant="info">{app.status}</Badge>
                  </div>
                ))}
                {applications.filter(a => a.studentId === viewStudent.id).length === 0 && <p className="text-sm text-gray-400">No applications</p>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Work Logs</h4>
              <p className="text-sm text-gray-500">{workLogs.filter(wl => wl.studentId === viewStudent.id).length} work logs submitted</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
