import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from '@/context/AppContext'
import ToastContainer from '@/components/Toast'
import DashboardLayout from '@/layouts/DashboardLayout'
import PublicLayout from '@/layouts/PublicLayout'

import Home from '@/pages/public/Home'
import About from '@/pages/public/About'
import Contact from '@/pages/public/Contact'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'

import StudentDashboard from '@/pages/student/StudentDashboard'
import AvailableInternships from '@/pages/student/AvailableInternships'
import InternshipDetails from '@/pages/student/InternshipDetails'
import MyApplications from '@/pages/student/MyApplications'
import MyInternship from '@/pages/student/MyInternship'
import Attendance from '@/pages/student/Attendance'
import DailyWorkLog from '@/pages/student/DailyWorkLog'
import StudentNotifications from '@/pages/student/StudentNotifications'
import StudentProfile from '@/pages/student/StudentProfile'
import StudentSettings from '@/pages/student/StudentSettings'

import CompanyDashboard from '@/pages/company/CompanyDashboard'
import PostInternship from '@/pages/company/PostInternship'
import MyInternships from '@/pages/company/MyInternships'
import ViewApplications from '@/pages/company/ViewApplications'
import CompanyAttendance from '@/pages/company/CompanyAttendance'
import Feedback from '@/pages/company/Feedback'
import InternshipCompletion from '@/pages/company/InternshipCompletion'
import CompanyNotifications from '@/pages/company/CompanyNotifications'
import CompanyProfile from '@/pages/company/CompanyProfile'
import CompanySettings from '@/pages/company/CompanySettings'

import FacultyDashboard from '@/pages/faculty/FacultyDashboard'
import FacultyStudents from '@/pages/faculty/FacultyStudents'
import FacultyInternships from '@/pages/faculty/FacultyInternships'
import FacultyApplications from '@/pages/faculty/FacultyApplications'
import FacultyAttendance from '@/pages/faculty/FacultyAttendance'
import FacultyWorkLogs from '@/pages/faculty/FacultyWorkLogs'
import ReportsAnalytics from '@/pages/faculty/ReportsAnalytics'
import FacultyNotifications from '@/pages/faculty/FacultyNotifications'
import FacultySettings from '@/pages/faculty/FacultySettings'

// Admin / TPO Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminAssignments from '@/pages/admin/AdminAssignments'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs'
import AdminReports from '@/pages/admin/AdminReports'

import {
  LayoutDashboard, Briefcase, FileText, Building2, Calendar, ClipboardList,
  Bell, User, Settings as SettingsIcon, Users, Plus, Star, Award,
  TrendingUp, UserCheck, Shield
} from 'lucide-react'
import type { UserRole } from '@/types'
import type { ReactNode } from 'react'

const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Available Internships', path: '/student/internships', icon: Briefcase },
  { label: 'My Applications', path: '/student/applications', icon: FileText },
  { label: 'My Internship', path: '/student/internship', icon: Building2 },
  { label: 'Attendance', path: '/student/attendance', icon: Calendar },
  { label: 'Daily Work Log', path: '/student/work-logs', icon: ClipboardList },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
  { label: 'Profile', path: '/student/profile', icon: User },
]

const companyNav = [
  { label: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
  { label: 'Post Internship', path: '/company/internships/new', icon: Plus },
  { label: 'My Internships', path: '/company/internships', icon: Briefcase },
  { label: 'Applications', path: '/company/applications', icon: FileText },
  { label: 'Attendance', path: '/company/attendance', icon: Calendar },
  { label: 'Feedback', path: '/company/feedback', icon: Star },
  { label: 'Completion', path: '/company/completion', icon: Award },
  { label: 'Notifications', path: '/company/notifications', icon: Bell },
  { label: 'Profile', path: '/company/profile', icon: Building2 },
]

const facultyNav = [
  { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { label: 'My Students', path: '/faculty/students', icon: Users },
  { label: 'Internships', path: '/faculty/internships', icon: Briefcase },
  { label: 'Applications', path: '/faculty/applications', icon: FileText },
  { label: 'Attendance', path: '/faculty/attendance', icon: Calendar },
  { label: 'Work Logs', path: '/faculty/work-logs', icon: ClipboardList },
  { label: 'Reports', path: '/faculty/reports', icon: TrendingUp },
  { label: 'Notifications', path: '/faculty/notifications', icon: Bell },
]

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Mentor Assignments', path: '/admin/assignments', icon: UserCheck },
  { label: 'User Accounts', path: '/admin/users', icon: Users },
  { label: 'Audit Trail', path: '/admin/audit-logs', icon: Shield },
  { label: 'Institutional Reports', path: '/admin/reports', icon: TrendingUp },
]

function ProtectedRoute({ children, role }: { children: ReactNode; role: UserRole }) {
  const { currentUser, loading } = useApp()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <SettingsIcon size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unauthorized</h1>
          <p className="text-sm text-gray-500 mt-2">You don't have access to this page. This area is for {role} accounts only.</p>
          <button onClick={() => navigate(`/${currentUser.role}/dashboard`)} className="btn-primary mt-6">
            Go to your dashboard
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

function StudentLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="student"><DashboardLayout navItems={studentNav} role="student">{children}</DashboardLayout></ProtectedRoute>
}
function CompanyLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="company"><DashboardLayout navItems={companyNav} role="company">{children}</DashboardLayout></ProtectedRoute>
}
function FacultyLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="faculty"><DashboardLayout navItems={facultyNav} role="faculty">{children}</DashboardLayout></ProtectedRoute>
}
function AdminLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="admin"><DashboardLayout navItems={adminNav} role="admin">{children}</DashboardLayout></ProtectedRoute>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route path="/student/dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
      <Route path="/student/internships" element={<StudentLayout><AvailableInternships /></StudentLayout>} />
      <Route path="/student/internships/:id" element={<StudentLayout><InternshipDetails /></StudentLayout>} />
      <Route path="/student/applications" element={<StudentLayout><MyApplications /></StudentLayout>} />
      <Route path="/student/internship" element={<StudentLayout><MyInternship /></StudentLayout>} />
      <Route path="/student/attendance" element={<StudentLayout><Attendance /></StudentLayout>} />
      <Route path="/student/work-logs" element={<StudentLayout><DailyWorkLog /></StudentLayout>} />
      <Route path="/student/notifications" element={<StudentLayout><StudentNotifications /></StudentLayout>} />
      <Route path="/student/profile" element={<StudentLayout><StudentProfile /></StudentLayout>} />
      <Route path="/student/settings" element={<StudentLayout><StudentSettings /></StudentLayout>} />

      {/* Company */}
      <Route path="/company/dashboard" element={<CompanyLayout><CompanyDashboard /></CompanyLayout>} />
      <Route path="/company/internships/new" element={<CompanyLayout><PostInternship /></CompanyLayout>} />
      <Route path="/company/internships" element={<CompanyLayout><MyInternships /></CompanyLayout>} />
      <Route path="/company/applications" element={<CompanyLayout><ViewApplications /></CompanyLayout>} />
      <Route path="/company/attendance" element={<CompanyLayout><CompanyAttendance /></CompanyLayout>} />
      <Route path="/company/feedback" element={<CompanyLayout><Feedback /></CompanyLayout>} />
      <Route path="/company/completion" element={<CompanyLayout><InternshipCompletion /></CompanyLayout>} />
      <Route path="/company/notifications" element={<CompanyLayout><CompanyNotifications /></CompanyLayout>} />
      <Route path="/company/profile" element={<CompanyLayout><CompanyProfile /></CompanyLayout>} />
      <Route path="/company/settings" element={<CompanyLayout><CompanySettings /></CompanyLayout>} />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={<FacultyLayout><FacultyDashboard /></FacultyLayout>} />
      <Route path="/faculty/students" element={<FacultyLayout><FacultyStudents /></FacultyLayout>} />
      <Route path="/faculty/internships" element={<FacultyLayout><FacultyInternships /></FacultyLayout>} />
      <Route path="/faculty/applications" element={<FacultyLayout><FacultyApplications /></FacultyLayout>} />
      <Route path="/faculty/attendance" element={<FacultyLayout><FacultyAttendance /></FacultyLayout>} />
      <Route path="/faculty/work-logs" element={<FacultyLayout><FacultyWorkLogs /></FacultyLayout>} />
      <Route path="/faculty/reports" element={<FacultyLayout><ReportsAnalytics /></FacultyLayout>} />
      <Route path="/faculty/notifications" element={<FacultyLayout><FacultyNotifications /></FacultyLayout>} />
      <Route path="/faculty/settings" element={<FacultyLayout><FacultySettings /></FacultyLayout>} />

      {/* TPO / Admin */}
      <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/assignments" element={<AdminLayout><AdminAssignments /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
      <Route path="/admin/audit-logs" element={<AdminLayout><AdminAuditLogs /></AdminLayout>} />
      <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  )
}
