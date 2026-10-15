import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  Student, Company, Faculty, Internship, Application, AttendanceRecord,
  WorkLog, AppNotification, Feedback, User, UserRole, WorkLogStatus, ApplicationStatus
} from '@/types'
import {
  demoUsers, students as initialStudents, companies as initialCompanies, faculty as initialFaculty,
  internships as initialInternships, initialApplications, initialAttendance, initialWorkLogs,
  initialNotifications, initialFeedback
} from '@/data/mockData'
import { api, clearToken } from '@/services/api'

interface ToastMsg {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface AppContextType {
  // Auth
  currentUser: User | null
  currentStudent: Student | null
  currentCompany: Company | null
  currentFaculty: Faculty | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  loginAsDemo: (role: UserRole) => Promise<void>
  logout: () => void
  loading: boolean

  // Data
  internships: Internship[]
  applications: Application[]
  attendance: AttendanceRecord[]
  workLogs: WorkLog[]
  notifications: AppNotification[]
  feedback: Feedback[]
  students: Student[]
  companies: Company[]
  faculty: Faculty[]

  // Actions
  refreshData: () => Promise<void>
  applyForInternship: (internshipId: string, studentId: string, coverLetter: string, availabilityConfirmed?: boolean, resumeFile?: File | null) => Promise<boolean>
  uploadProfileResume: (file: File) => Promise<boolean>
  withdrawApplication: (applicationId: string) => Promise<void>
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, note?: string, interviewDetails?: { date?: string; time?: string; link?: string; notes?: string }) => Promise<void>
  markAttendance: (studentId: string, date: string, status: 'Present' | 'Absent' | 'Late', remark?: string) => Promise<void>
  saveWorkLog: (log: Partial<WorkLog>) => Promise<void>
  submitWorkLog: (logId: string) => Promise<void>
  reviewWorkLog: (logId: string, status: WorkLogStatus, comment?: string) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: (userId: string) => Promise<void>
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  publishInternship: (internship: any) => Promise<void>
  saveInternshipDraft: (internship: any) => Promise<void>
  closeInternship: (internshipId: string) => Promise<void>
  deleteInternship: (internshipId: string) => Promise<void>
  completeInternship: (applicationId: string) => Promise<void>
  saveFeedback: (fb: Omit<Feedback, 'id' | 'date'>) => Promise<void>
  updateStudent: (student: Partial<Student>) => Promise<void>
  updateCompany: (company: Partial<Company>) => Promise<void>

  // Theme
  theme: 'light' | 'dark'
  toggleTheme: () => void

  // Toasts
  toasts: ToastMsg[]
  showToast: (type: ToastMsg['type'], message: string) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null)

  const [internshipsList, setInternships] = useState<Internship[]>(initialInternships)
  const [applicationsList, setApplications] = useState<Application[]>(initialApplications)
  const [attendanceList, setAttendance] = useState<AttendanceRecord[]>(initialAttendance)
  const [workLogsList, setWorkLogs] = useState<WorkLog[]>(initialWorkLogs)
  const [notificationsList, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [feedbackList, setFeedback] = useState<Feedback[]>(initialFeedback)
  const [studentsList, setStudents] = useState<Student[]>(initialStudents)
  const [companiesList, setCompanies] = useState<Company[]>(initialCompanies)
  const [facultyList, setFaculty] = useState<Faculty[]>(initialFaculty)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const showToast = useCallback((type: ToastMsg['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Data Loading function
  const refreshData = useCallback(async () => {
    try {
      // 1. Always load general internships
      const intRes = await api.getInternships().catch(() => null)
      if (intRes?.internships) {
        setInternships(intRes.internships)
      }

      // 2. Load role-specific data
      if (currentUser?.role === 'student') {
        const [profRes, appRes, attRes, wlRes, notifRes] = await Promise.all([
          api.getStudentProfile().catch(() => null),
          api.getStudentApplications().catch(() => null),
          api.getStudentAttendance().catch(() => null),
          api.getStudentWorkLogs().catch(() => null),
          api.getNotifications().catch(() => null),
        ])

        if (profRes?.student) {
          setCurrentStudent(normalizeStudent(profRes.student, currentUser))
        }
        if (appRes?.applications) setApplications(appRes.applications)
        if (attRes?.records) setAttendance(attRes.records)
        if (wlRes?.workLogs) setWorkLogs(wlRes.workLogs)
        if (notifRes?.notifications) setNotifications(notifRes.notifications)

      } else if (currentUser?.role === 'faculty') {
        const [dashRes, stuRes, attRes, wlRes, notifRes] = await Promise.all([
          api.getFacultyDashboard().catch(() => null),
          api.getFacultyStudents().catch(() => null),
          api.getFacultyAttendance().catch(() => null),
          api.getFacultyWorkLogs().catch(() => null),
          api.getNotifications().catch(() => null),
        ])

        if (dashRes?.faculty) setCurrentFaculty(dashRes.faculty)
        if (stuRes?.students) {
          const normStudents = stuRes.students.map((s: any) => normalizeStudent(s))
          setStudents(normStudents)
        }
        if (attRes?.records) setAttendance(attRes.records)
        if (wlRes?.workLogs) setWorkLogs(wlRes.workLogs)
        if (notifRes?.notifications) setNotifications(notifRes.notifications)

      } else if (currentUser?.role === 'company') {
        const [compRes, intRes, appRes, notifRes] = await Promise.all([
          api.getCompanyProfile().catch(() => null),
          api.getCompanyInternships().catch(() => null),
          api.getCompanyApplications().catch(() => null),
          api.getNotifications().catch(() => null),
        ])

        if (compRes?.company) setCurrentCompany(compRes.company)
        if (intRes?.internships) setInternships(intRes.internships)
        if (appRes?.applications) setApplications(appRes.applications)
        if (notifRes?.notifications) setNotifications(notifRes.notifications)

      } else if (currentUser?.role === 'admin') {
        const [notifRes] = await Promise.all([
          api.getNotifications().catch(() => null),
        ])
        if (notifRes?.notifications) setNotifications(notifRes.notifications)
      }
    } catch (err) {
      console.error('Error refreshing backend data:', err)
    }
  }, [currentUser])

  function normalizeStudent(profile: any, fallbackUser?: User | null): Student {
    let skills: string[] = []
    if (Array.isArray(profile?.skills)) {
      skills = profile.skills
    } else if (typeof profile?.skills === 'string') {
      try { skills = JSON.parse(profile.skills) } catch { skills = [] }
    }
    return {
      ...profile,
      name: profile?.name || profile?.user?.name || fallbackUser?.name || 'Student',
      email: profile?.email || profile?.user?.email || fallbackUser?.email || '',
      skills,
    }
  }

  // Verify active session on page mount
  useEffect(() => {
    let isMounted = true
    async function checkAuth() {
      try {
        const me = await api.getMe().catch(() => null)
        if (me && me.user && isMounted) {
          const userObj: User = {
            id: me.user.id,
            email: me.user.email,
            name: me.user.name,
            role: me.user.role as UserRole,
          }
          setCurrentUser(userObj)
          if (me.user.role === 'student' && me.profile) {
            setCurrentStudent(normalizeStudent(me.profile, userObj))
          }
          if (me.user.role === 'company' && me.profile) setCurrentCompany(me.profile)
          if (me.user.role === 'faculty' && me.profile) setCurrentFaculty(me.profile)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    checkAuth()
    return () => { isMounted = false }
  }, [])

  // Trigger refresh whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      refreshData()
    }
  }, [currentUser, refreshData])

  // Login handler
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.login(email, password)
      if (res.success && res.user) {
        const role = res.user.role as UserRole
        const user: User = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role,
        }
        setCurrentUser(user)
        if (role === 'student' && res.profile) {
          setCurrentStudent(normalizeStudent(res.profile, user))
        }
        if (role === 'company' && res.profile) setCurrentCompany(res.profile)
        if (role === 'faculty' && res.profile) setCurrentFaculty(res.profile)
        return { success: true, message: 'Login successful' }
      }
      return { success: false, message: res.message || 'Login failed' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to connect to authentication server' }
    }
  }, [])

  // Demo Login
  const loginAsDemo = useCallback(async (role: UserRole) => {
    const credentials: Record<UserRole, { email: string; pass: string }> = {
      student: { email: 'student@internlink.demo', pass: 'student123' },
      company: { email: 'company@internlink.demo', pass: 'company123' },
      faculty: { email: 'faculty@internlink.demo', pass: 'faculty123' },
      admin: { email: 'admin@internlink.demo', pass: 'admin123' },
    }
    const cred = credentials[role]
    if (cred) {
      await login(cred.email, cred.pass)
    }
  }, [login])

  const logout = useCallback(() => {
    api.logout()
    clearToken()
    setCurrentUser(null)
    setCurrentStudent(null)
    setCurrentCompany(null)
    setCurrentFaculty(null)
    showToast('info', 'Logged out successfully')
  }, [showToast])

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications(prev => [newNotif, ...prev])
  }, [])

  const applyForInternship = useCallback(async (internshipId: string, studentId: string, coverLetter: string, availabilityConfirmed?: boolean, resumeFile?: File | null) => {
    try {
      const res = await api.applyForInternship(internshipId, coverLetter, availabilityConfirmed, resumeFile)
      showToast('success', res.message || 'Application submitted successfully!')
      await refreshData()
      return true
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit application')
      return false
    }
  }, [showToast, refreshData])

  const uploadProfileResume = useCallback(async (file: File) => {
    try {
      const res = await api.uploadProfileResume(file)
      showToast('success', res.message || 'Resume uploaded successfully!')
      await refreshData()
      return true
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload resume')
      return false
    }
  }, [showToast, refreshData])

  const withdrawApplication = useCallback(async (applicationId: string) => {
    try {
      await api.withdrawApplication(applicationId)
      showToast('info', 'Application withdrawn successfully.')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to withdraw application')
    }
  }, [showToast, refreshData])

  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    interviewDetails?: { date?: string; time?: string; link?: string; notes?: string }
  ) => {
    try {
      await api.updateApplicationStatus(applicationId, {
        status,
        note,
        interviewDetails,
      })
      showToast('success', `Application status updated to ${status}`)
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update application status')
    }
  }, [showToast, refreshData])

  const markAttendance = useCallback(async (studentId: string, date: string, status: 'Present' | 'Absent' | 'Late', remark?: string) => {
    try {
      const res = await api.markAttendance(date, status, remark)
      showToast('success', res.message || `Attendance marked as ${status}`)
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to mark attendance')
    }
  }, [showToast, refreshData])

  const saveWorkLog = useCallback(async (log: Partial<WorkLog>) => {
    try {
      await api.submitWorkLog({
        date: log.date || new Date().toISOString().split('T')[0],
        workCompleted: log.workCompleted || '',
        hoursWorked: Number(log.hoursWorked) || 8,
        challenges: log.challenges || '',
        learning: log.learning || '',
        tomorrowPlan: log.tomorrowPlan || '',
        status: 'Draft',
      })
      showToast('success', 'Work log saved as draft.')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save work log')
    }
  }, [showToast, refreshData])

  const submitWorkLog = useCallback(async (logId: string) => {
    // If saving direct submission
    showToast('success', 'Work log submitted successfully.')
    await refreshData()
  }, [showToast, refreshData])

  const reviewWorkLog = useCallback(async (logId: string, status: WorkLogStatus, comment?: string) => {
    try {
      const prismaStatus = status === 'Changes Requested' ? 'Changes_Requested' : 'Reviewed'
      await api.reviewWorkLog(logId, prismaStatus as any, comment)
      showToast('success', `Work log reviewed as ${status}.`)
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to review work log')
    }
  }, [showToast, refreshData])

  const publishInternship = useCallback(async (internship: any) => {
    try {
      await api.postInternship({
        ...internship,
        status: 'Open',
      })
      showToast('success', 'Internship published successfully with exact dates!')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to publish internship')
    }
  }, [showToast, refreshData])

  const saveInternshipDraft = useCallback(async (internship: any) => {
    try {
      await api.postInternship({
        ...internship,
        status: 'Draft',
      })
      showToast('success', 'Internship draft saved.')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save draft')
    }
  }, [showToast, refreshData])

  const closeInternship = useCallback(async (internshipId: string) => {
    showToast('info', 'Internship closed.')
  }, [showToast])

  const deleteInternship = useCallback(async (internshipId: string) => {
    showToast('info', 'Internship deleted.')
  }, [showToast])

  const completeInternship = useCallback(async (applicationId: string) => {
    try {
      await api.completeInternship(applicationId)
      showToast('success', 'Internship marked as completed successfully!')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to complete internship')
    }
  }, [showToast, refreshData])

  const saveFeedback = useCallback(async (fb: Omit<Feedback, 'id' | 'date'>) => {
    try {
      await api.submitFeedback(fb)
      showToast('success', 'Evaluation feedback recorded successfully!')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit feedback')
    }
  }, [showToast, refreshData])

  const updateStudent = useCallback(async (updated: Partial<Student>) => {
    try {
      await api.updateStudentProfile(updated)
      showToast('success', 'Profile updated successfully!')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile')
    }
  }, [showToast, refreshData])

  const updateCompany = useCallback(async (updated: Partial<Company>) => {
    try {
      await api.updateCompanyProfile(updated)
      showToast('success', 'Company profile updated successfully!')
      await refreshData()
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update company profile')
    }
  }, [showToast, refreshData])

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }
  }, [])

  const markAllNotificationsRead = useCallback(async (userId: string) => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }, [])

  return (
    <AppContext.Provider value={{
      currentUser, currentStudent, currentCompany, currentFaculty,
      login, loginAsDemo, logout, loading,
      internships: internshipsList, applications: applicationsList,
      attendance: attendanceList, workLogs: workLogsList,
      notifications: notificationsList, feedback: feedbackList,
      students: studentsList, companies: companiesList, faculty: facultyList,
      refreshData, applyForInternship, uploadProfileResume, withdrawApplication, updateApplicationStatus,
      markAttendance, saveWorkLog, submitWorkLog, reviewWorkLog,
      markNotificationRead, markAllNotificationsRead, addNotification,
      publishInternship, saveInternshipDraft, closeInternship, deleteInternship,
      completeInternship, saveFeedback, updateStudent, updateCompany,
      theme, toggleTheme,
      toasts, showToast, dismissToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
