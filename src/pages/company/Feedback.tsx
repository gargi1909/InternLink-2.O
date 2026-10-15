import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, EmptyState, Avatar } from '@/components/ui'
import Modal from '@/components/Modal'
import { Star, Users, MessageSquare, FileText, CheckCircle2 } from 'lucide-react'
import type { Application } from '@/types'

export default function Feedback() {
  const { currentCompany, applications, feedback, saveFeedback, students } = useApp()
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [form, setForm] = useState({
    performanceRating: 4, communicationRating: 4, technicalRating: 4,
    professionalismRating: 4, teamworkRating: 4, overallRating: 4, comments: '',
  })

  if (!currentCompany) return null

  const selectedApps = applications.filter(a => a.companyId === currentCompany.id && a.status === 'Selected')
  const myFeedback = feedback.filter(f => f.companyId === currentCompany.id)

  const hasFeedback = (studentId: string) => myFeedback.some(f => f.studentId === studentId)

  const openFeedbackForm = (app: Application) => {
    setSelectedApp(app)
    setForm({ performanceRating: 4, communicationRating: 4, technicalRating: 4, professionalismRating: 4, teamworkRating: 4, overallRating: 4, comments: '' })
  }

  const handleSubmit = () => {
    if (!selectedApp) return
    saveFeedback({
      studentId: selectedApp.studentId,
      studentName: selectedApp.studentName,
      companyId: currentCompany.id,
      companyName: currentCompany.name,
      internshipTitle: selectedApp.internshipTitle,
      ...form,
    })
    setSelectedApp(null)
  }

  const ratingCategories = [
    { key: 'performanceRating' as const, label: 'Performance' },
    { key: 'communicationRating' as const, label: 'Communication' },
    { key: 'technicalRating' as const, label: 'Technical Skills' },
    { key: 'professionalismRating' as const, label: 'Professionalism' },
    { key: 'teamworkRating' as const, label: 'Teamwork' },
    { key: 'overallRating' as const, label: 'Overall Rating' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Provide feedback for your interns</p>
      </div>

      {selectedApps.length === 0 ? (
        <Card><EmptyState icon={Users} title="No interns to give feedback for" description="Once you select candidates, they will appear here for feedback." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedApps.map(app => {
            const student = students.find(s => s.id === app.studentId)
            const existingFb = myFeedback.find(f => f.studentId === app.studentId)
            return (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={app.studentName} color="bg-brand-500" size="md" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{app.studentName}</h3>
                    <p className="text-xs text-gray-500 truncate">{app.internshipTitle}</p>
                  </div>
                  {existingFb ? <Badge variant="success">Reviewed</Badge> : <Badge variant="warning">Pending</Badge>}
                </div>
                {existingFb ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < existingFb.overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{existingFb.overallRating}.0</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{existingFb.comments}</p>
                    <button onClick={() => openFeedbackForm(app)} className="btn-secondary text-xs w-full mt-2">Update Feedback</button>
                  </div>
                ) : (
                  <button onClick={() => openFeedbackForm(app)} className="btn-primary text-sm w-full mt-2">
                    <MessageSquare size={14} /> Give Feedback
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {myFeedback.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Submitted Feedback</h3>
          <div className="space-y-3">
            {myFeedback.map(fb => (
              <div key={fb.id} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                <Avatar name={fb.studentName} color="bg-brand-500" size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{fb.studentName}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < fb.overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{fb.internshipTitle}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{fb.comments}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={hasFeedback(selectedApp?.studentId ?? '') ? 'Update Feedback' : 'Give Feedback'}
        size="lg"
        footer={<><button onClick={() => setSelectedApp(null)} className="btn-secondary">Cancel</button><button onClick={handleSubmit} className="btn-primary"><CheckCircle2 size={16} /> Submit Feedback</button></>}
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar name={selectedApp.studentName} color="bg-brand-500" size="md" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedApp.studentName}</p>
                <p className="text-sm text-gray-500">{selectedApp.internshipTitle}</p>
              </div>
            </div>
            <div className="space-y-4">
              {ratingCategories.map(cat => (
                <div key={cat.key}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{cat.label}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setForm({ ...form, [cat.key]: n })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star size={24} className={n <= form[cat.key] ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2 self-center">{form[cat.key]}.0</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Comments</label>
              <textarea
                value={form.comments}
                onChange={e => setForm({ ...form, comments: e.target.value })}
                rows={4}
                className="input-field resize-none"
                placeholder="Share detailed feedback about the intern's performance, strengths, and areas for improvement..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
