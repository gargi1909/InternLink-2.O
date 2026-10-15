import { useEffect, useState, useMemo } from 'react'
import { Card, Badge, EmptyState } from '@/components/ui'
import { api } from '@/services/api'
import { useApp } from '@/context/AppContext'
import { UserCheck, Search, Users, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

export default function AdminAssignments() {
  const { showToast } = useApp()
  const [assignments, setAssignments] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Assignment form state
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedMentor, setSelectedMentor] = useState('')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [assignRes, mentorRes, userRes] = await Promise.all([
        api.getAdminAssignments(),
        api.getAdminMentors(),
        api.getAdminUsers({ role: 'student' }),
      ])

      if (assignRes.success) setAssignments(assignRes.assignments)
      if (mentorRes.success) setMentors(mentorRes.mentors)
      if (userRes.success) {
        setStudents(userRes.users.map((u: any) => ({
          id: u.profileDetails?.id || u.id,
          name: u.name,
          email: u.email,
          collegeId: u.profileDetails?.collegeId || 'N/A',
          department: u.profileDetails?.department || 'General',
        })))
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load assignment data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !selectedMentor) {
      showToast('warning', 'Please select both a student and a faculty mentor.')
      return
    }

    try {
      const res = await api.assignStudentMentor(selectedStudent, selectedMentor)
      showToast('success', res.message || 'Mentor assigned successfully!')
      setSelectedStudent('')
      setSelectedMentor('')
      await loadData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to assign mentor')
    }
  }

  const handleQuickReassign = async (studentId: string, facultyId: string) => {
    try {
      const res = await api.assignStudentMentor(studentId, facultyId)
      showToast('success', res.message || 'Student reassigned successfully')
      await loadData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reassign mentor')
    }
  }

  const filteredAssignments = useMemo(() => {
    let result = assignments
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.studentCollegeId.toLowerCase().includes(q) ||
        a.mentorName.toLowerCase().includes(q)
      )
    }
    if (deptFilter) {
      result = result.filter(a => a.studentDepartment === deptFilter)
    }
    return result
  }, [assignments, search, deptFilter])

  const departments = useMemo(() => [...new Set(assignments.map(a => a.studentDepartment))], [assignments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentor Assignment Management</h1>
          <p className="text-sm text-gray-500 mt-1">Supervise student allocations, enforce primary mentor quotas, and reassign students</p>
        </div>
        <button onClick={loadData} className="btn-secondary text-sm self-start sm:self-auto">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Mentor Cards Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map(m => (
          <Card key={m.id} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">{m.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{m.department} • {m.designation}</p>
              </div>
              <Badge variant={m.assignedCount >= 23 ? 'warning' : 'success'}>
                {m.assignedCount} / 23
              </Badge>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{m.assignedCount}</span> students under direct supervision
            </div>
          </Card>
        ))}
      </div>

      {/* New Assignment Action Card */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">Assign or Reassign Student to Mentor</h3>
        <p className="text-xs text-gray-500 mb-4">Selecting an already-assigned student will automatically update their primary mentor and log an audit entry.</p>

        <form onSubmit={handleAssign} className="grid sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Student</label>
            <select
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              className="input-field text-sm"
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.collegeId} - {s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Faculty Mentor</label>
            <select
              value={selectedMentor}
              onChange={e => setSelectedMentor(e.target.value)}
              className="input-field text-sm"
              required
            >
              <option value="">-- Choose Faculty Mentor --</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department} - currently {m.assignedCount} assigned)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full text-sm">
              <UserCheck size={16} /> Assign
            </button>
          </div>
        </form>
      </Card>

      {/* Assignments Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">Active Student-Mentor Assignments</h3>
            <p className="text-xs text-gray-500 mt-0.5">{filteredAssignments.length} total active student assignments</p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student or mentor..."
                className="input-field pl-9 py-1.5 text-xs sm:w-56"
              />
            </div>
            {departments.length > 0 && (
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="input-field py-1.5 text-xs sm:w-40"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <EmptyState icon={Users} title="No assignments found" description="Use the assignment form above to allocate students to faculty mentors." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase font-semibold">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">College ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assigned Faculty Mentor</th>
                  <th className="px-4 py-3">Assigned Date</th>
                  <th className="px-4 py-3 text-right">Reassign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {a.studentName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {a.studentCollegeId}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {a.studentDepartment}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {a.mentorName}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({a.mentorDepartment})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {a.assignedAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleQuickReassign(a.studentId, e.target.value)
                            e.target.value = ''
                          }
                        }}
                        defaultValue=""
                        className="text-xs bg-gray-100 dark:bg-gray-800 border-none rounded px-2 py-1 cursor-pointer hover:bg-brand-50 hover:text-brand-600"
                      >
                        <option value="" disabled>Reassign...</option>
                        {mentors.filter(m => m.id !== a.mentorId).map(m => (
                          <option key={m.id} value={m.id}>To {m.name}</option>
                        ))}
                      </select>
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
