import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo, EmptyState, Avatar } from '@/components/ui'
import Modal, { ConfirmDialog } from '@/components/Modal'
import { getStatusBadgeVariant, formatDate } from '@/utils/helpers'
import { Search, FileText, Eye, Ban, Clock, CheckCircle2, ChevronDown, X, Download } from 'lucide-react'
import type { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api'

export default function MyApplications() {
  const { applications, currentStudent, withdrawApplication, showToast } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewApp, setViewApp] = useState<Application | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null)

  if (!currentStudent) return null

  const myApps = applications.filter(a => a.studentId === currentStudent.id)

  const filtered = useMemo(() => {
    let result = myApps
    if (search) result = result.filter(a => a.internshipTitle.toLowerCase().includes(search.toLowerCase()) || a.companyName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) result = result.filter(a => a.status === statusFilter)
    switch (sortBy) {
      case 'oldest': result = [...result].sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()); break
      case 'status': result = [...result].sort((a, b) => a.status.localeCompare(b.status)); break
      default: result = [...result].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    }
    return result
  }, [myApps, search, statusFilter, sortBy])

  const statuses: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn']

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search applications..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field sm:w-40">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="status">By status</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No applications found" description="You haven't applied to any internships yet. Browse available internships to get started." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Applied</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={app.companyName} color={app.companyLogoColor} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{app.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{app.internshipTitle}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(app.appliedDate)}</td>
                    <td className="px-4 py-3"><Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(app.lastUpdated)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewApp(app)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="View">
                          <Eye size={16} />
                        </button>
                        {['Applied', 'Under Review'].includes(app.status) && (
                          <button onClick={() => setWithdrawTarget(app.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Withdraw">
                            <Ban size={16} />
                          </button>
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

      {/* Application Details Modal */}
      <Modal
        open={!!viewApp}
        onClose={() => setViewApp(null)}
        title="Application Details"
        size="lg"
      >
        {viewApp && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <CompanyLogo name={viewApp.companyName} color={viewApp.companyLogoColor} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{viewApp.internshipTitle}</h3>
                <p className="text-sm text-gray-500">{viewApp.companyName}</p>
              </div>
              <div className="ml-auto">
                <Badge variant={getStatusBadgeVariant(viewApp.status)}>{viewApp.status}</Badge>
              </div>
            </div>

            {viewApp.interviewDate && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2"><Clock size={16} /> Interview Scheduled</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{viewApp.interviewDate} at {viewApp.interviewTime}</p>
                {viewApp.interviewLink && <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Link: {viewApp.interviewLink}</p>}
                {viewApp.interviewNotes && <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">{viewApp.interviewNotes}</p>}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Application Timeline</h4>
              <div className="space-y-3">
                {viewApp.timeline.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === viewApp.timeline.length - 1 ? 'bg-brand-600 text-white' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                        <CheckCircle2 size={16} />
                      </div>
                      {i < viewApp.timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.status}</p>
                      <p className="text-xs text-gray-500">{formatDate(entry.date)} • {entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Cover Letter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">{viewApp.coverLetter}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Submitted Resume</h4>
              <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-red-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                    {viewApp.resumeName || 'Resume.pdf'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.downloadStudentApplicationResume(
                        viewApp.id,
                        viewApp.resumeName || 'Resume.pdf'
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Applied Date</p><p className="font-medium text-gray-900 dark:text-white">{formatDate(viewApp.appliedDate)}</p></div>
              <div><p className="text-gray-500">Last Updated</p><p className="font-medium text-gray-900 dark:text-white">{formatDate(viewApp.lastUpdated)}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => withdrawTarget && withdrawApplication(withdrawTarget)}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        variant="danger"
      />
    </div>
  )
}
