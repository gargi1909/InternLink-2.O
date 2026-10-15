import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Logo from '@/components/Logo'
import { Avatar } from '@/components/ui'
import { Bell, Menu, X, LogOut, Settings, Moon, Sun, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

export default function DashboardLayout({
  children, navItems, role,
}: {
  children: ReactNode
  navItems: NavItem[]
  role: UserRole
}) {
  const { currentUser, currentStudent, currentCompany, currentFaculty, logout, notifications, theme, toggleTheme } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = currentUser?.name ?? ''
  const displayRole = role === 'student' ? currentStudent?.college : role === 'company' ? currentCompany?.industry : role === 'faculty' ? currentFaculty?.designation : 'TPO Placement Office'
  const avatarColor = role === 'student' ? 'bg-brand-500' : role === 'company' ? 'bg-blue-600' : role === 'faculty' ? 'bg-emerald-600' : 'bg-purple-600'

  const unreadCount = notifications.filter(n => !n.read && n.userId === (role === 'student' ? currentStudent?.id : role === 'company' ? currentCompany?.id : role === 'faculty' ? currentFaculty?.id : currentUser?.id)).length
  const notifPath = `/${role}/notifications`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const settingsPath = role === 'admin' ? '/admin/dashboard' : `/${role}/settings`

  const roleLabel = role === 'student' ? 'Student' : role === 'company' ? 'Company' : role === 'faculty' ? 'Faculty' : 'Administrator'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Logo size="sm" to={`/${role}/dashboard`} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={displayName} color={avatarColor} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{displayRole}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <item.icon size={18} />
              {item.label}
              {item.path === notifPath && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <NavLink to={settingsPath} className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}>
            <Settings size={18} /> Settings
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-brand-600">{roleLabel}</span>
              <span>/</span>
              <span className="capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <NavLink to={notifPath} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </NavLink>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar name={displayName} color={avatarColor} size="sm" />
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-20 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <NavLink to={settingsPath} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Settings size={16} /> Settings
                    </NavLink>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
