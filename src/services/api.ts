const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken(): string | null {
  return localStorage.getItem('internlink_token')
}

export function setToken(token: string) {
  localStorage.setItem('internlink_token', token)
}

export function clearToken() {
  localStorage.removeItem('internlink_token')
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`
    throw new Error(errorMsg)
  }

  return data as T
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await request<{ success: boolean; token: string; user: any; profile: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.token) setToken(res.token)
    return res
  },

  async register(userData: any) {
    const res = await request<{ success: boolean; token: string; user: any; profile: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (res.token) setToken(res.token)
    return res
  },

  async getMe() {
    return request<{ success: boolean; user: any; profile: any }>('/auth/me')
  },

  async logout() {
    clearToken()
    try {
      await request('/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
  },

  // Student
  async getStudentProfile() {
    return request<{ success: boolean; student: any }>('/student/profile')
  },

  async updateStudentProfile(data: any) {
    return request<{ success: boolean; student: any; message: string }>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getStudentApplications() {
    return request<{ success: boolean; applications: any[] }>('/student/applications')
  },

  async applyForInternship(
    internshipId: string,
    coverLetter?: string,
    availabilityConfirmed?: boolean,
    resumeFile?: File | null
  ) {
    if (resumeFile) {
      const formData = new FormData()
      formData.append('internshipId', internshipId)
      if (coverLetter) formData.append('coverLetter', coverLetter)
      if (availabilityConfirmed !== undefined) {
        formData.append('availabilityConfirmed', String(availabilityConfirmed))
      }
      formData.append('resume', resumeFile)

      return request<{ success: boolean; message: string; application: any }>('/student/applications', {
        method: 'POST',
        body: formData,
      })
    }

    return request<{ success: boolean; message: string; application: any }>('/student/applications', {
      method: 'POST',
      body: JSON.stringify({ internshipId, coverLetter, availabilityConfirmed }),
    })
  },

  async uploadProfileResume(file: File) {
    const formData = new FormData()
    formData.append('resume', file)
    return request<{ success: boolean; message: string; resumeName: string }>('/student/profile/resume', {
      method: 'POST',
      body: formData,
    })
  },

  async downloadFile(endpoint: string, defaultFilename: string) {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers,
      credentials: 'include',
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.message || 'Failed to download file')
    }

    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    let filename = defaultFilename
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/)
      if (match && match[1]) filename = match[1]
    }

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },

  async downloadCompanyApplicationResume(applicationId: string, filename?: string) {
    return this.downloadFile(`/company/applications/${applicationId}/resume`, filename || 'Candidate_Resume.pdf')
  },

  async downloadStudentApplicationResume(applicationId: string, filename?: string) {
    return this.downloadFile(`/student/applications/${applicationId}/resume`, filename || 'Resume.pdf')
  },

  async downloadStudentProfileResume(filename?: string) {
    return this.downloadFile('/student/profile/resume', filename || 'Resume.pdf')
  },

  async withdrawApplication(id: string) {
    return request<{ success: boolean; message: string }>(`/student/applications/${id}`, {
      method: 'DELETE',
    })
  },

  async getStudentAttendance() {
    return request<{ success: boolean; records: any[]; stats: any }>('/student/attendance')
  },

  async markAttendance(date: string, status: 'Present' | 'Absent' | 'Late', remark?: string) {
    return request<{ success: boolean; message: string; record: any }>('/student/attendance', {
      method: 'POST',
      body: JSON.stringify({ date, status, remark }),
    })
  },

  async getStudentWorkLogs() {
    return request<{ success: boolean; workLogs: any[] }>('/student/work-logs')
  },

  async submitWorkLog(logData: any) {
    return request<{ success: boolean; message: string; workLog: any }>('/student/work-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    })
  },

  // Faculty (Strictly Scoped)
  async getFacultyDashboard() {
    return request<{ success: boolean; faculty: any; stats: any; recentApplications: any[] }>('/faculty/dashboard')
  },

  async getFacultyStudents(params?: { search?: string; department?: string; status?: string }) {
    const query = new URLSearchParams(params as any || {}).toString()
    return request<{ success: boolean; count: number; assignedMentor: string; students: any[] }>(`/faculty/students${query ? `?${query}` : ''}`)
  },

  async getFacultyStudentDetail(id: string) {
    return request<{ success: boolean; student: any }>(`/faculty/students/${id}`)
  },

  async getFacultyAttendance() {
    return request<{ success: boolean; records: any[] }>('/faculty/attendance')
  },

  async getFacultyWorkLogs() {
    return request<{ success: boolean; workLogs: any[] }>('/faculty/work-logs')
  },

  async reviewWorkLog(id: string, status: 'Reviewed' | 'Changes_Requested', comment?: string) {
    return request<{ success: boolean; message: string; workLog: any }>(`/faculty/work-logs/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    })
  },

  async getFacultyReports() {
    return request<{ success: boolean; mentorName: string; department: string; assignedStudentsCount: number; reportRows: any[] }>('/faculty/reports')
  },

  // Company
  async getCompanyProfile() {
    return request<{ success: boolean; company: any }>('/company/profile')
  },

  async updateCompanyProfile(data: any) {
    return request<{ success: boolean; company: any; message: string }>('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getCompanyInternships() {
    return request<{ success: boolean; internships: any[] }>('/company/internships')
  },

  async postInternship(data: any) {
    return request<{ success: boolean; message: string; internship: any }>('/company/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getCompanyApplications() {
    return request<{ success: boolean; applications: any[] }>('/company/applications')
  },

  async updateApplicationStatus(id: string, payload: any) {
    return request<{ success: boolean; message: string; application: any }>(`/company/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async submitFeedback(data: any) {
    return request<{ success: boolean; message: string; feedback: any }>('/company/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async completeInternship(id: string) {
    return request<{ success: boolean; message: string; application: any }>(`/company/applications/${id}/complete`, {
      method: 'POST',
    })
  },

  // Internships (Discovery)
  async getInternships(params?: { search?: string; workMode?: string; type?: string; location?: string }) {
    const query = new URLSearchParams(params as any || {}).toString()
    return request<{ success: boolean; count: number; internships: any[] }>(`/internships${query ? `?${query}` : ''}`)
  },

  async getInternship(id: string) {
    return request<{ success: boolean; internship: any }>(`/internships/${id}`)
  },

  // Admin
  async getAdminDashboard() {
    return request<{ success: boolean; stats: any; mentorLoads: any[]; recentAuditLogs: any[] }>('/admin/dashboard')
  },

  async getAdminUsers(params?: { role?: string; search?: string }) {
    const query = new URLSearchParams(params as any || {}).toString()
    return request<{ success: boolean; count: number; users: any[] }>(`/admin/users${query ? `?${query}` : ''}`)
  },

  async getAdminMentors() {
    return request<{ success: boolean; mentors: any[] }>('/admin/mentors')
  },

  async getAdminAssignments() {
    return request<{ success: boolean; count: number; assignments: any[] }>('/admin/assignments')
  },

  async assignStudentMentor(studentId: string, facultyId: string) {
    return request<{ success: boolean; message: string; assignment: any }>('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify({ studentId, facultyId }),
    })
  },

  async getAdminAuditLogs() {
    return request<{ success: boolean; count: number; auditLogs: any[] }>('/admin/audit-logs')
  },

  // Notifications
  async getNotifications() {
    return request<{ success: boolean; notifications: any[] }>('/notifications')
  },

  async markNotificationRead(id: string) {
    return request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  },

  async markAllNotificationsRead() {
    return request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PUT',
    })
  },
}
