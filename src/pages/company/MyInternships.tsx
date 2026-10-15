import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo, EmptyState } from '@/components/ui'
import { ConfirmDialog } from '@/components/Modal'
import { getInternshipBadgeVariant, formatDate } from '@/utils/helpers'
import { Plus, Eye, XCircle, Trash2, Pencil, Users, Calendar, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { InternshipStatus } from '@/types'

export default function MyInternships() {
  const { currentCompany, internships, closeInternship, deleteInternship } = useApp()
  const [tab, setTab] = useState<'Active' | 'Draft' | 'Closed' | 'Completed'>('Active')
  const [closeTarget, setCloseTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (!currentCompany) return null

  const myInternships = internships.filter(i => i.companyId === currentCompany.id)
  const filtered = useMemo(() => myInternships.filter(i => i.status === tab), [myInternships, tab])

  const tabs: InternshipStatus[] = ['Active', 'Draft', 'Closed', 'Completed']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Internships</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your posted internships</p>
        </div>
        <Link to="/company/internships/new" className="btn-primary text-sm"><Plus size={16} /> Post Internship</Link>
      </div>

      <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t} ({myInternships.filter(i => i.status === t).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FileText} title={`No ${tab.toLowerCase()} internships`} description={tab === 'Active' ? 'Post a new internship to get started.' : undefined} action={tab === 'Active' ? <Link to="/company/internships/new" className="btn-primary text-sm">Post Internship</Link> : undefined} /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(internship => (
            <Card key={internship.id}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{internship.title}</h3>
                    <Badge variant={getInternshipBadgeVariant(internship.status)}>{internship.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Users size={14} /> {internship.applicants} applicants</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> Deadline: {formatDate(internship.deadline)}</span>
                    <span>{internship.openings} openings</span>
                    <span>₹{internship.stipend.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {internship.requiredSkills.slice(0, 4).map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">{s}</span>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {internship.status === 'Active' && (
                    <>
                      <Link to="/company/applications" className="btn-secondary text-xs"><Eye size={14} /> View</Link>
                      <button onClick={() => setCloseTarget(internship.id)} className="btn-secondary text-xs text-red-500"><XCircle size={14} /> Close</button>
                    </>
                  )}
                  {internship.status === 'Draft' && (
                    <>
                      <Link to="/company/internships/new" className="btn-secondary text-xs"><Pencil size={14} /> Edit</Link>
                      <button onClick={() => setDeleteTarget(internship.id)} className="btn-secondary text-xs text-red-500"><Trash2 size={14} /> Delete</button>
                    </>
                  )}
                  {internship.status === 'Closed' && (
                    <Link to="/company/applications" className="btn-secondary text-xs"><Eye size={14} /> View</Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!closeTarget} onClose={() => setCloseTarget(null)} onConfirm={() => closeTarget && closeInternship(closeTarget)} title="Close Internship" message="This will close the internship for new applications. Existing applications will still be visible." confirmText="Close" variant="warning" />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteInternship(deleteTarget)} title="Delete Draft" message="This will permanently delete this internship draft." confirmText="Delete" variant="danger" />
    </div>
  )
}
