import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo, EmptyState } from '@/components/ui'
import { getInternshipBadgeVariant, formatDate } from '@/utils/helpers'
import { Search, Eye, CheckCircle2, XCircle, Flag, Briefcase } from 'lucide-react'
import type { InternshipStatus } from '@/types'

export default function FacultyInternships() {
  const { internships, companies, applications, showToast } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    let result = internships
    if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.companyName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) result = result.filter(i => i.status === statusFilter)
    return result
  }, [internships, search, statusFilter])

  const getAppCount = (internshipId: string) => applications.filter(a => a.internshipId === internshipId).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Internships</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} internships</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search internships..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All statuses</option>
          <option>Active</option><option>Draft</option><option>Closed</option><option>Completed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No internships found" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Duration</th>
                  <th className="px-4 py-3 font-medium">Students</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(internship => (
                  <tr key={internship.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{internship.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{internship.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{internship.duration}</td>
                    <td className="px-4 py-3 text-gray-500">{getAppCount(internship.id)}</td>
                    <td className="px-4 py-3"><Badge variant={getInternshipBadgeVariant(internship.status)}>{internship.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {internship.status === 'Active' && (
                          <>
                            <button onClick={() => showToast('success', 'Internship approved')} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600" title="Approve"><CheckCircle2 size={16} /></button>
                            <button onClick={() => showToast('info', 'Internship flagged for review')} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600" title="Flag"><Flag size={16} /></button>
                          </>
                        )}
                        <button onClick={() => showToast('info', 'Viewing internship details')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="View"><Eye size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
