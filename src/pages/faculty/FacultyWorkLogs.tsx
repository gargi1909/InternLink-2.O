import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, EmptyState } from '@/components/ui'
import Modal from '@/components/Modal'
import { getWorkLogBadgeVariant, formatDate } from '@/utils/helpers'
import { Search, FileText, Eye, CheckCircle2, Pencil, Clock } from 'lucide-react'
import type { WorkLog, WorkLogStatus } from '@/types'

export default function FacultyWorkLogs() {
  const { workLogs, students, companies, reviewWorkLog } = useApp()
  const [search, setSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewLog, setViewLog] = useState<WorkLog | null>(null)
  const [reviewLog, setReviewLog] = useState<WorkLog | null>(null)
  const [comment, setComment] = useState('')

  const filtered = useMemo(() => {
    let result = workLogs
    if (search) result = result.filter(wl => wl.studentName.toLowerCase().includes(search.toLowerCase()) || wl.companyName.toLowerCase().includes(search.toLowerCase()))
    if (studentFilter) result = result.filter(wl => wl.studentId === studentFilter)
    if (statusFilter) result = result.filter(wl => wl.status === statusFilter)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [workLogs, search, studentFilter, statusFilter])

  const studentNames = [...new Set(workLogs.map(wl => wl.studentId))].map(id => ({ id, name: students.find(s => s.id === id)?.name ?? 'Unknown' }))

  const handleReview = (status: WorkLogStatus) => {
    if (reviewLog) {
      reviewWorkLog(reviewLog.id, status, comment)
      setReviewLog(null)
      setComment('')
      setViewLog(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Logs</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} work logs from students</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by student or company..." />
        </div>
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All students</option>
          {studentNames.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All statuses</option>
          <option>Draft</option><option>Submitted</option><option>Reviewed</option><option>Changes Requested</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No work logs found" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {log.studentName.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate">{log.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell truncate max-w-[120px]">{log.companyName}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.date)}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{log.hoursWorked}h</td>
                    <td className="px-4 py-3"><Badge variant={getWorkLogBadgeVariant(log.status)}>{log.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewLog(log)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="View"><Eye size={16} /></button>
                        {log.status === 'Submitted' && (
                          <button onClick={() => { setReviewLog(log); setComment('') }} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600" title="Review"><CheckCircle2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!viewLog} onClose={() => setViewLog(null)} title="Work Log Details" size="lg"
        footer={viewLog && viewLog.status === 'Submitted' ? (
          <>
            <button onClick={() => { setReviewLog(viewLog); setComment('') }} className="btn-secondary text-red-500">Request Changes</button>
            <button onClick={() => { if (viewLog) { reviewWorkLog(viewLog.id, 'Reviewed', comment); setViewLog(null) } }} className="btn-primary"><CheckCircle2 size={16} /> Approve</button>
          </>
        ) : undefined
      }>
        {viewLog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{viewLog.studentName}</p>
                <p className="text-sm text-gray-500">{viewLog.companyName} • {formatDate(viewLog.date)}</p>
              </div>
              <Badge variant={getWorkLogBadgeVariant(viewLog.status)}>{viewLog.status}</Badge>
            </div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Work Completed</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.workCompleted || '(empty)'}</p></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Hours</p><p className="font-medium">{viewLog.hoursWorked}h</p></div>
              <div><p className="text-xs text-gray-500">Submitted</p><p className="font-medium">{viewLog.submittedDate ? formatDate(viewLog.submittedDate) : 'Draft'}</p></div>
            </div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Challenges</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.challenges || 'None'}</p></div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Learning</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.learning || 'None'}</p></div>
            <div><p className="text-xs font-medium text-gray-500 mb-1">Tomorrow's Plan</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.tomorrowPlan || 'None'}</p></div>
            {viewLog.facultyComment && <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg"><p className="text-xs font-medium text-brand-700 dark:text-brand-400 mb-1">Faculty Comment</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.facultyComment}</p></div>}
          </div>
        )}
      </Modal>

      <Modal open={!!reviewLog} onClose={() => setReviewLog(null)} title="Review Work Log"
        footer={<><button onClick={() => setReviewLog(null)} className="btn-secondary">Cancel</button>
        <button onClick={() => handleReview('Changes Requested')} className="btn-secondary text-red-500">Request Changes</button>
        <button onClick={() => handleReview('Reviewed')} className="btn-primary"><CheckCircle2 size={16} /> Approve</button></>}
      >
        {reviewLog && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Reviewing work log for <span className="font-medium text-gray-900 dark:text-white">{reviewLog.studentName}</span> — {formatDate(reviewLog.date)}</p>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Faculty Comment</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="input-field resize-none" placeholder="Add feedback or changes needed..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
