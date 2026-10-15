import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, StatCard, ProgressBar, EmptyState, Avatar } from '@/components/ui'
import { ConfirmDialog } from '@/components/Modal'
import { getWorkLogBadgeVariant, formatDate } from '@/utils/helpers'
import { Award, Users, CheckCircle2, Calendar, FileText, Star, TrendingUp } from 'lucide-react'
import type { Application } from '@/types'

export default function InternshipCompletion() {
  const { currentCompany, applications, attendance, workLogs, feedback, completeInternship } = useApp()
  const [completeTarget, setCompleteTarget] = useState<Application | null>(null)

  if (!currentCompany) return null

  const selectedApps = applications.filter(a => a.companyId === currentCompany.id && a.status === 'Selected')

  const getInternData = (app: Application) => {
    const attRecords = attendance.filter(a => a.studentId === app.studentId)
    const present = attRecords.filter(a => a.status === 'Present').length
    const attPct = attRecords.length > 0 ? Math.round((present / attRecords.length) * 100) : 0
    const logs = workLogs.filter(wl => wl.studentId === app.studentId)
    const submittedLogs = logs.filter(l => l.status === 'Submitted' || l.status === 'Reviewed').length
    const hasFeedback = feedback.some(f => f.studentId === app.studentId && f.companyId === currentCompany.id)
    const fb = feedback.find(f => f.studentId === app.studentId && f.companyId === currentCompany.id)
    const progress = Math.min(95, Math.round((attPct * 0.4 + (submittedLogs / Math.max(1, logs.length)) * 30 + (hasFeedback ? 25 : 10))))
    return { attPct, submittedLogs, totalLogs: logs.length, hasFeedback, fb, progress }
  }

  const handleComplete = () => {
    if (completeTarget) {
      completeInternship(completeTarget.id)
      setCompleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internship Completion</h1>
        <p className="text-sm text-gray-500 mt-1">Track and complete internships for your interns</p>
      </div>

      {selectedApps.length === 0 ? (
        <Card><EmptyState icon={Users} title="No active interns" description="Selected interns approaching completion will appear here." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Active Interns" value={selectedApps.length} color="brand" />
            <StatCard icon={TrendingUp} label="Avg Progress" value={`${Math.round(selectedApps.reduce((sum, a) => sum + getInternData(a).progress, 0) / selectedApps.length)}%`} color="blue" />
            <StatCard icon={CheckCircle2} label="Feedback Given" value={selectedApps.filter(a => getInternData(a).hasFeedback).length} color="green" />
            <StatCard icon={Award} label="Completed" value={0} color="amber" />
          </div>

          <div className="space-y-4">
            {selectedApps.map(app => {
              const data = getInternData(app)
              return (
                <Card key={app.id}>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex items-start gap-3 lg:w-64 shrink-0">
                      <Avatar name={app.studentName} color="bg-brand-500" size="md" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{app.studentName}</h3>
                        <p className="text-sm text-gray-500 truncate">{app.internshipTitle}</p>
                        <p className="text-xs text-gray-400 mt-1">{app.studentCollege}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Start - End</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Jan 15 - Jul 15</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Attendance</p>
                        <p className={`text-sm font-bold ${data.attPct >= 75 ? 'text-green-600' : 'text-amber-600'}`}>{data.attPct}%</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Work Logs</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{data.submittedLogs}/{data.totalLogs || 0} submitted</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Feedback</p>
                        {data.hasFeedback ? (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{data.fb?.overallRating}.0</span>
                            <Badge variant="success" className="ml-1">Given</Badge>
                          </div>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                    </div>

                    <div className="lg:w-48 shrink-0 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Completion</span>
                          <span className="font-bold text-brand-600">{data.progress}%</span>
                        </div>
                        <ProgressBar value={data.progress} color={data.progress >= 80 ? 'green' : 'brand'} />
                      </div>
                      <button
                        onClick={() => setCompleteTarget(app)}
                        disabled={data.progress < 50}
                        className="btn-primary text-xs w-full disabled:opacity-50"
                      >
                        <Award size={14} /> Complete Internship
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={handleComplete}
        title="Complete Internship"
        message={completeTarget ? `Are you sure you want to mark ${completeTarget.studentName}'s internship as completed? A completion certificate will be generated and the student will be notified.` : ''}
        confirmText="Complete"
        variant="primary"
      />
    </div>
  )
}
