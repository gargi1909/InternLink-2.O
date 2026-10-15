export type UserRole = 'student' | 'company' | 'faculty' | 'admin'

export interface User {
  id: string
  email: string
  password?: string
  role: UserRole
  name: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  college: string
  collegeId: string
  course: string
  year: string
  department: string
  bio: string
  skills: string[]
  linkedin: string
  github: string
  resumeName: string
  resumePath?: string
  profileCompletion: number
  avatar?: string
  mentor?: Faculty | null
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  industry: string
  website: string
  description: string
  location: string
  logoColor: string
}

export interface Faculty {
  id: string
  name: string
  email: string
  phone: string
  department: string
  college: string
  designation: string
  employeeId?: string
}

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site'
export type InternshipStatus = 'Draft' | 'Active' | 'Closed' | 'Completed'

export interface Internship {
  id: string
  companyId: string
  companyName: string
  companyLogoColor: string
  title: string
  description: string
  responsibilities: string[]
  requiredSkills: string[]
  eligibility: string
  location: string
  workMode: WorkMode
  duration: string
  startDate: string
  endDate: string
  stipend: number
  openings: number
  deadline: string
  benefits: string[]
  postedDate: string
  applicants: number
  status: InternshipStatus
  type: string
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn'

export interface ApplicationTimelineEntry {
  status: string
  date: string
  note: string
}

export interface Application {
  id: string
  internshipId: string
  internshipTitle: string
  companyId: string
  companyName: string
  companyLogoColor: string
  studentId: string
  studentName: string
  studentCollege: string
  studentCourse: string
  studentSkills: string[]
  studentResumeName: string
  appliedDate: string
  lastUpdated: string
  status: ApplicationStatus
  coverLetter: string
  timeline: ApplicationTimelineEntry[]
  interviewDate?: string
  interviewTime?: string
  interviewLink?: string
  interviewNotes?: string
  expectedJoiningDate?: string
  actualJoiningDate?: string
  completionDate?: string
  startDate?: string
  endDate?: string
  availabilityConfirmed?: boolean
  resumeName?: string
  resumePath?: string
  hasResumeFile?: boolean
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday'

export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: AttendanceStatus
  checkInTime?: string
  remark?: string
  studentName?: string
}

export type WorkLogStatus = 'Draft' | 'Submitted' | 'Reviewed' | 'Changes Requested'

export interface WorkLog {
  id: string
  studentId: string
  studentName: string
  companyId: string
  companyName: string
  date: string
  workCompleted: string
  hoursWorked: number
  challenges: string
  learning: string
  tomorrowPlan: string
  status: WorkLogStatus
  facultyComment?: string
  submittedDate?: string
}

export type NotificationCategory =
  | 'Application'
  | 'Interview'
  | 'Attendance'
  | 'Work Log'
  | 'Faculty'
  | 'Company'
  | 'System'

export interface AppNotification {
  id: string
  userId: string
  userRole: UserRole
  category: NotificationCategory
  title: string
  description: string
  timestamp: string
  read: boolean
}

export interface Feedback {
  id: string
  studentId: string
  studentName: string
  companyId: string
  companyName: string
  internshipTitle: string
  performanceRating: number
  communicationRating: number
  technicalRating: number
  professionalismRating: number
  teamworkRating: number
  overallRating: number
  comments: string
  date: string
}

export interface InternshipTask {
  id: string
  title: string
  completed: boolean
}

export interface StudentMentorAssignment {
  id: string
  studentId: string
  studentName: string
  studentCollegeId: string
  studentDepartment: string
  mentorId: string
  mentorName: string
  mentorDepartment: string
  assignedAt: string
  assignedBy: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AuditLog {
  id: string
  userName: string
  userEmail: string
  userRole: string
  action: string
  targetType: string
  targetId?: string
  details?: string
  ipAddress?: string
  timestamp: string
}

export interface MentorLoad {
  mentorId: string
  name: string
  department: string
  assignedCount: number
  maxCapacity: number
  loadPercentage: number
}
