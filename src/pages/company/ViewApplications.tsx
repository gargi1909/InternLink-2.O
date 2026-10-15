import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, EmptyState } from '@/components/ui'
import Modal, { ConfirmDialog } from '@/components/Modal'
import { getStatusBadgeVariant, formatDate } from '@/utils/helpers'
import { Search, Eye, CheckCircle2, XCircle, Calendar, FileText, Filter, Clock, Download } from 'lucide-react'
import type { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api'

export default function ViewApplications() {
  const { currentCompany, applications, internships, updateApplicationStatus, showToast } = useApp()
  const [search, setSearch] = useState('')
  const [internshipFilter, setInternshipFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewApp, setViewApp] = useState<Application | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<Application | null>(null)
  const [selectTarget, setSelectTarget] = useState<Application | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', link: '', notes: '' })
  const [joiningForm, setJoiningForm] = useState({ expectedJoiningDate: '2026-01-15', actualJoiningDate: '' })

  if (!currentCompany) return null

  const myApps = applications.filter(a => a.companyId === currentCompany.id)
  const myInternships = internships.filter(i => i.companyId === currentCompany.id)

  const filtered = useMemo(() => {
    let result = myApps
    if (search) result = result.filter(a => a.studentName.toLowerCase().includes(search.toLowerCase()))
    if (internshipFilter) result = result.filter(a => a.internshipId === internshipFilter)
    if (statusFilter) result = result.filter(a => a.status === statusFilter)
    return result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
  }, [myApps, search, internshipFilter, statusFilter])

  const statuses: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected']

  const getInternshipSchedule = (app: Application) => {
    const start = app.startDate || myInternships.find(i => i.id === app.internshipId)?.startDate
    const end = app.endDate || myInternships.find(i => i.id === app.internshipId)?.endDate
    if (start && end) {
      return `${formatDate(start)} – ${formatDate(end)}`
    }
    return null
  }

  const handleShortlist = (app: Application) => {
    updateApplicationStatus(app.id, 'Shortlisted', 'Shortlisted by company evaluation')
    setViewApp(null)
  }

  const handleScheduleInterview = () => {
    if (scheduleTarget && interviewForm.date && interviewForm.time) {
      updateApplicationStatus(scheduleTarget.id, 'Interview Scheduled', `Interview scheduled for ${interviewForm.date} at ${interviewForm.time}`, {
        date: interviewForm.date,
        time: interviewForm.time,
        link: interviewForm.link,
        notes: interviewForm.notes,
      })
      setScheduleTarget(null)
      setInterviewForm({ date: '', time: '', link: '', notes: '' })
      setViewApp(null)
    }
  }

  const handleConfirmSelection = () => {
    if (selectTarget && joiningForm.expectedJoiningDate) {
      updateApplicationStatus(
        selectTarget.id,
        'Selected',
        `Candidate selected with expected joining on ${joiningForm.expectedJoiningDate}`,
        undefined
      )
      setSelectTarget(null)
      setViewApp(null)
      showToast('success', 'Candidate selected! Joining dates dispatched to student and faculty.')
    }
  }

  const handleReject = () => {
    if (rejectTarget) {
      updateApplicationStatus(rejectTarget, 'Rejected', 'Not selected by company')
      setRejectTarget(null)
      setViewApp(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} applications received</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by student name..." />
        </div>
        <select value={internshipFilter} onChange={e => setInternshipFilter(e.target.value)} className="input-field sm:w-56">
          <option value="">All Internships</option>
          {myInternships.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No applications found" description="When students apply for your internships, they will appear here." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Internship</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Official Schedule</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Applied Date</th>
                  <th className="px-4 py-3 font-medium">Availability</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Interview / Joining</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{app.studentName}</div>
                      <div className="text-xs text-gray-500">{app.studentCollege}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{app.internshipTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {getInternshipSchedule(app) || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(app.appliedDate)}</td>
                    <td className="px-4 py-3">
                      {app.availabilityConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Not Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {app.interviewDate ? (
                        <span className="text-blue-600 font-medium">Interview: {app.interviewDate}</span>
                      ) : app.expectedJoiningDate ? (
                        <span className="text-green-600 font-medium">Joining: {app.expectedJoiningDate}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewApp(app)} className="btn-secondary text-xs py-1.5 px-3">
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Application Details Modal */}
      <Modal
        open={!!viewApp}
        onClose={() => setViewApp(null)}
        title="Application Review & Decision"
        size="lg"
        footer={
          viewApp && (
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              {['Applied', 'Under Review'].includes(viewApp.status) && (
                <>
                  <button onClick={() => setRejectTarget(viewApp.id)} className="btn-secondary text-red-500"><XCircle size={16} /> Reject</button>
                  <button onClick={() => handleShortlist(viewApp)} className="btn-primary"><CheckCircle2 size={16} /> Shortlist</button>
                </>
              )}
              {viewApp.status === 'Shortlisted' && (
                <>
                  <button onClick={() => setRejectTarget(viewApp.id)} className="btn-secondary text-red-500"><XCircle size={16} /> Reject</button>
                  <button onClick={() => { setScheduleTarget(viewApp); setInterviewForm({ date: '', time: '', link: '', notes: '' }) }} className="btn-primary"><Calendar size={16} /> Schedule Interview</button>
                </>
              )}
              {viewApp.status === 'Interview Scheduled' && (
                <>
                  <button onClick={() => setRejectTarget(viewApp.id)} className="btn-secondary text-red-500"><XCircle size={16} /> Reject</button>
                  <button onClick={() => setSelectTarget(viewApp)} className="btn-primary"><CheckCircle2 size={16} /> Select & Schedule Joining</button>
                </>
              )}
            </div>
          )
        }
      >
        {viewApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                {(viewApp.studentName || 'S').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{viewApp.studentName}</h3>
                <p className="text-sm text-gray-500">{viewApp.studentCollege} • {viewApp.studentCourse}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(viewApp.status)} className="ml-auto">{viewApp.status}</Badge>
            </div>

            {/* Official Schedule & Availability Confirmation Details */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800 grid sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">Internship</span>
                <span className="font-semibold text-gray-900 dark:text-white block">
                  {viewApp.internshipTitle}
                </span>
                <span className="text-gray-500 block mt-0.5">
                  {getInternshipSchedule(viewApp) || 'Schedule dates not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">Application Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(viewApp.appliedDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">Availability Confirmation</span>
                <span className="mt-0.5 inline-block">
                  {viewApp.availabilityConfirmed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={13} /> Confirmed for Schedule
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Not Confirmed
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">{viewApp.studentSkills.map(s => <Badge key={s} variant="brand">{s}</Badge>)}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">{viewApp.coverLetter || 'No cover letter provided.'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Resume</h4>
              <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-red-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                    {viewApp.studentResumeName || 'Student_Resume.pdf'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.downloadCompanyApplicationResume(
                        viewApp.id,
                        viewApp.studentResumeName || 'Resume.pdf'
                      )
                    } catch (err: any) {
                      showToast('error', err.message || 'Failed to download resume')
                    }
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} /> Download Resume
                </button>
              </div>
            </div>

            {/* Exact Schedule Stages */}
            {viewApp.interviewDate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Interview: {viewApp.interviewDate} at {viewApp.interviewTime}
                </p>
                {viewApp.interviewLink && <p className="text-xs text-blue-600 mt-1 font-mono">Link: {viewApp.interviewLink}</p>}
                {viewApp.interviewNotes && <p className="text-xs text-blue-600 mt-1">{viewApp.interviewNotes}</p>}
              </div>
            )}

            {(viewApp.expectedJoiningDate || viewApp.actualJoiningDate) && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h5 className="text-xs font-semibold uppercase text-green-800 dark:text-green-300 mb-1">Joining Schedule</h5>
                {viewApp.expectedJoiningDate && (
                  <p className="text-xs text-green-700 dark:text-green-300">Expected Joining: <span className="font-semibold">{formatDate(viewApp.expectedJoiningDate)}</span></p>
                )}
                {viewApp.actualJoiningDate && (
                  <p className="text-xs text-green-700 dark:text-green-300">Confirmed Actual Joining: <span className="font-semibold">{formatDate(viewApp.actualJoiningDate)}</span></p>
                )}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2">Application Timeline</h4>
              <div className="space-y-2">
                {viewApp.timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{t.status}</span>
                    <span className="text-gray-400 text-xs">• {formatDate(t.date)}: {t.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        open={!!scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        title="Schedule Interview"
        footer={<><button onClick={() => setScheduleTarget(null)} className="btn-secondary">Cancel</button><button onClick={handleScheduleInterview} disabled={!interviewForm.date || !interviewForm.time} className="btn-primary">Confirm Interview</button></>}
      >
        <div className="space-y-4">
          {scheduleTarget && <p className="text-sm text-gray-500">Scheduling technical interview with <span className="font-medium text-gray-900 dark:text-white">{scheduleTarget.studentName}</span> for <span className="font-medium text-gray-900 dark:text-white">{scheduleTarget.internshipTitle}</span></p>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Interview Date</label><input type="date" value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} className="input-field" required /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Interview Time</label><input type="time" value={interviewForm.time} onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })} className="input-field" required /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Meeting Link</label><input type="text" value={interviewForm.link} onChange={e => setInterviewForm({ ...interviewForm, link: e.target.value })} className="input-field" placeholder="https://meet.google.com/..." /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Notes for Candidate</label><textarea value={interviewForm.notes} onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })} rows={3} className="input-field resize-none" placeholder="Preparation topics, portfolio presentation instructions..." /></div>
        </div>
      </Modal>

      {/* Select Candidate & Specify Exact Joining Schedule Modal */}
      <Modal
        open={!!selectTarget}
        onClose={() => setSelectTarget(null)}
        title="Select Candidate & Confirm Joining Schedule"
        footer={<><button onClick={() => setSelectTarget(null)} className="btn-secondary">Cancel</button><button onClick={handleConfirmSelection} disabled={!joiningForm.expectedJoiningDate} className="btn-primary">Confirm Selection Offer</button></>}
      >
        <div className="space-y-4">
          {selectTarget && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Confirming selection offer for <span className="font-semibold text-gray-900 dark:text-white">{selectTarget.studentName}</span> in <span className="font-semibold text-gray-900 dark:text-white">{selectTarget.internshipTitle}</span>.
            </p>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Expected Joining Date (Calendar Date Picker)
            </label>
            <input
              type="date"
              value={joiningForm.expectedJoiningDate}
              onChange={e => setJoiningForm({ ...joiningForm, expectedJoiningDate: e.target.value })}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-400 mt-1">This date will appear on the student offer and faculty mentor dashboard.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
              Actual Joining Date (Once Student Checks In, Optional for now)
            </label>
            <input
              type="date"
              value={joiningForm.actualJoiningDate}
              onChange={e => setJoiningForm({ ...joiningForm, actualJoiningDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} title="Reject Application" message="Are you sure you want to reject this candidate?" confirmText="Reject" variant="danger" />
    </div>
  )
}
