import { useEffect, useState } from 'react'
import { Card, EmptyState, Badge } from '@/components/ui'
import { api } from '@/services/api'
import { Shield, History, Search, RefreshCw, FileText } from 'lucide-react'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await api.getAdminAuditLogs()
      if (res.success) setLogs(res.auditLogs)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Administrative Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-1">Immutable record of mentor assignments, status modifications, and access reviews</p>
        </div>
        <button onClick={loadLogs} className="btn-secondary text-sm self-start sm:self-auto">
          <RefreshCw size={16} /> Refresh Logs
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter audit logs by action or details..."
          className="input-field pl-10"
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit trail...</div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState icon={History} title="No audit entries matching filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 uppercase font-semibold">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Initiated By</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:border-gray-800">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-gray-900 dark:text-white">{l.userName}</div>
                      <div className="text-gray-400">{l.userRole}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                      {l.details || l.targetType}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">
                      {l.ipAddress || '127.0.0.1'}
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
