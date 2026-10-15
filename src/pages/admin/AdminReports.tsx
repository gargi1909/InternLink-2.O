import { useEffect, useState } from 'react'
import { Card, StatCard, EmptyState, Badge } from '@/components/ui'
import { api } from '@/services/api'
import { Download, TrendingUp, Users, Briefcase, Award, RefreshCw, FileText } from 'lucide-react'

export default function AdminReports() {
  const [data, setData] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [dashRes, assignRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminAssignments(),
      ])
      if (dashRes.success) setData(dashRes)
      if (assignRes.success) setAssignments(assignRes.assignments)
    } catch (err) {
      console.error('Failed to load report data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExportCSV = () => {
    const headers = ['Student Name', 'College ID', 'Department', 'Assigned Mentor', 'Mentor Department', 'Assigned Date', 'Status']
    const rows = assignments.map(a => [
      a.studentName,
      a.studentCollegeId,
      a.studentDepartment,
      a.mentorName,
      a.mentorDepartment,
      a.assignedAt,
      a.status,
    ])

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `internlink_institution_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = data?.stats || {
    totalStudents: 20,
    totalFaculty: 2,
    totalCompanies: 3,
    totalInternships: 4,
    totalApplications: 4,
    selectedCount: 2,
    placementRate: 50,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institution-Wide Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Export official internship placement and mentorship distribution reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-primary text-sm">
            <Download size={16} /> Export CSV Report
          </button>
          <button onClick={loadData} className="btn-secondary text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="brand" />
        <StatCard icon={Briefcase} label="Active Internships" value={stats.totalInternships} color="blue" />
        <StatCard icon={Award} label="Placements Confirmed" value={stats.selectedCount} color="green" />
        <StatCard icon={TrendingUp} label="Placement Rate" value={`${stats.placementRate}%`} color="amber" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Mentorship Distribution Report</h3>
          <span className="text-xs text-gray-400">Showing {assignments.length} enrolled records</span>
        </div>

        {assignments.length === 0 ? (
          <EmptyState icon={FileText} title="No report records available" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase font-semibold">
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">USN / ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Supervising Mentor</th>
                  <th className="px-4 py-3">Mentor Dept</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:border-gray-800">
                {assignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.studentName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{a.studentCollegeId}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.studentDepartment}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">{a.mentorName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.mentorDepartment}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
