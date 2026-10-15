import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, EmptyState } from '@/components/ui'
import Modal from '@/components/Modal'
import { getWorkLogBadgeVariant, formatDate } from '@/utils/helpers'
import { Plus, FileText, Eye, Pencil, Send, Clock, Calendar } from 'lucide-react'
import type { WorkLog } from '@/types'

export default function DailyWorkLog() {
  const { currentStudent, workLogs, saveWorkLog, submitWorkLog } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [viewLog, setViewLog] = useState<WorkLog | null>(null)
  const [editLog, setEditLog] = useState<WorkLog | null>(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    workCompleted: '',
    hoursWorked: 8,
    challenges: '',
    learning: '',
    tomorrowPlan: '',
  })

  if (!currentStudent) return null

  const myLogs = workLogs.filter(wl => wl.studentId === currentStudent.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const selectedApp = useApp().applications.find(a => a.studentId === currentStudent.id && a.status === 'Selected')
  const companyId = selectedApp?.companyId ?? 'c1'
  const companyName = selectedApp?.companyName ?? 'TechNova Solutions'

  const handleSaveDraft = () => {
    if (editLog) {
      saveWorkLog({ ...editLog, ...form })
      setEditLog(null)
    } else {
      saveWorkLog({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        companyId,
        companyName,
        ...form,
      })
    }
    resetForm()
  }

  const handleSubmit = () => {
    if (editLog) {
      saveWorkLog({ ...editLog, ...form, status: 'Submitted', submittedDate: new Date().toISOString().split('T')[0] })
      submitWorkLog(editLog.id)
      setEditLog(null)
    } else {
      const newLog: Partial<WorkLog> = {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        companyId,
        companyName,
        ...form,
        status: 'Submitted',
        submittedDate: new Date().toISOString().split('T')[0],
      }
      saveWorkLog(newLog)
    }
    resetForm()
  }

  const resetForm = () => {
    setForm({ date: new Date().toISOString().split('T')[0], workCompleted: '', hoursWorked: 8, challenges: '', learning: '', tomorrowPlan: '' })
    setShowForm(false)
  }

  const handleEdit = (log: WorkLog) => {
    setEditLog(log)
    setForm({
      date: log.date,
      workCompleted: log.workCompleted,
      hoursWorked: log.hoursWorked,
      challenges: log.challenges,
      learning: log.learning,
      tomorrowPlan: log.tomorrowPlan,
    })
    setShowForm(true)
  }

  const handleSubmitExisting = (log: WorkLog) => {
    submitWorkLog(log.id)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Work Log</h1>
          <p className="text-sm text-gray-500 mt-1">Record your daily work, challenges, and learnings</p>
        </div>
        <button onClick={() => { setEditLog(null); resetForm(); setShowForm(true) }} className="btn-primary text-sm">
          <Plus size={16} /> Add Work Log
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500">Total Logs</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{myLogs.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Drafts</p><p className="text-2xl font-bold text-amber-600">{myLogs.filter(l => l.status === 'Draft').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Submitted</p><p className="text-2xl font-bold text-blue-600">{myLogs.filter(l => l.status === 'Submitted').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">Reviewed</p><p className="text-2xl font-bold text-green-600">{myLogs.filter(l => l.status === 'Reviewed').length}</p></Card>
      </div>

      {myLogs.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No work logs yet" description="Start recording your daily work to track your internship progress." action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Work Log</button>} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Work Completed</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatDate(log.date)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell truncate max-w-xs">{log.workCompleted || '(Empty draft)'}</td>
                    <td className="px-4 py-3 text-gray-500">{log.hoursWorked}h</td>
                    <td className="px-4 py-3"><Badge variant={getWorkLogBadgeVariant(log.status)}>{log.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewLog(log)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="View"><Eye size={16} /></button>
                        {log.status === 'Draft' && (
                          <>
                            <button onClick={() => handleEdit(log)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Edit"><Pencil size={16} /></button>
                            <button onClick={() => handleSubmitExisting(log)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600" title="Submit"><Send size={16} /></button>
                          </>
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

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditLog(null) }}
        title={editLog ? 'Edit Work Log' : 'Add Daily Work Log'}
        size="lg"
        footer={
          <>
            <button onClick={() => { setShowForm(false); setEditLog(null) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveDraft} className="btn-secondary">Save Draft</button>
            <button onClick={handleSubmit} className="btn-primary"><Send size={16} /> Submit Log</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Completed</label>
            <textarea value={form.workCompleted} onChange={e => setForm({ ...form, workCompleted: e.target.value })} rows={4} className="input-field resize-none" placeholder="Describe the work you completed today..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hours Worked</label>
            <input type="number" value={form.hoursWorked} onChange={e => setForm({ ...form, hoursWorked: parseInt(e.target.value) || 0 })} className="input-field" min="0" max="24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Challenges Faced</label>
            <textarea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} rows={2} className="input-field resize-none" placeholder="Any challenges or blockers?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">What I Learned</label>
            <textarea value={form.learning} onChange={e => setForm({ ...form, learning: e.target.value })} rows={2} className="input-field resize-none" placeholder="New skills or concepts learned..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tomorrow's Plan</label>
            <textarea value={form.tomorrowPlan} onChange={e => setForm({ ...form, tomorrowPlan: e.target.value })} rows={2} className="input-field resize-none" placeholder="What do you plan to work on tomorrow?" />
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewLog} onClose={() => setViewLog(null)} title="Work Log Details" size="lg">
        {viewLog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} /> {formatDate(viewLog.date)}
              </div>
              <Badge variant={getWorkLogBadgeVariant(viewLog.status)}>{viewLog.status}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Work Completed</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.workCompleted || '(empty)'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium text-gray-500 mb-1">Hours Worked</p><p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"><Clock size={14} /> {viewLog.hoursWorked} hours</p></div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Challenges</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.challenges || 'None'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Learning</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.learning || 'None'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tomorrow's Plan</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.tomorrowPlan || 'None'}</p>
            </div>
            {viewLog.facultyComment && (
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                <p className="text-xs font-medium text-brand-700 dark:text-brand-400 mb-1">Faculty Comment</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewLog.facultyComment}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
