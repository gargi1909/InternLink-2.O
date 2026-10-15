import { useEffect, useState } from 'react'
import { Card, Badge, EmptyState } from '@/components/ui'
import { api } from '@/services/api'
import { Users, Search, Mail, Shield, RefreshCw } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await api.getAdminUsers({ role: roleFilter, search })
      if (res.success) setUsers(res.users)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const roleColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'purple'> = {
    student: 'brand',
    company: 'info',
    faculty: 'success',
    admin: 'purple',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Account Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage institutional student, faculty, company, and administrative accounts</p>
        </div>
        <button onClick={loadUsers} className="btn-secondary text-sm self-start sm:self-auto">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name or email address..."
          />
        </form>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Account Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty Mentors</option>
          <option value="company">Companies</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading accounts...</div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No user accounts found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase font-semibold">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3">Institutional Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:border-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleColors[u.role] || 'info'}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {u.createdAt}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {u.profileDetails?.collegeId || u.profileDetails?.department || u.profileDetails?.industry || 'System Account'}
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
