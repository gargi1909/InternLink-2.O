import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Role, WorkLogStatus } from '@prisma/client'
import { prisma } from '../db.js'
import { authenticate, requireRole, verifyMentorAccess } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()

// All faculty endpoints require authentication and FACULTY role
router.use(authenticate, requireRole(Role.FACULTY))

// Helper to get faculty profile for current user
async function getFacultyProfile(userId: string) {
  return prisma.facultyProfile.findUnique({
    where: { userId },
  })
}

// 1. Faculty Dashboard: STRICTLY RESTRICTED TO ASSIGNED STUDENTS
router.get('/dashboard', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    // Find all student IDs assigned to this mentor
    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { facultyId: faculty.id, status: 'ACTIVE' },
      select: { studentId: true },
    })
    const assignedStudentIds = assignments.map(a => a.studentId)

    // Compute stats restricted ONLY to assigned students
    const totalAssignedStudents = assignedStudentIds.length

    const applications = await prisma.internshipApplication.findMany({
      where: { studentId: { in: assignedStudentIds } },
      include: { internship: true, student: { include: { user: true } } },
    })

    const interningStudents = applications.filter(a => a.status === 'Selected').length

    const pendingWorkLogs = await prisma.workLog.count({
      where: {
        studentId: { in: assignedStudentIds },
        status: WorkLogStatus.Submitted,
      },
    })

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId: { in: assignedStudentIds } },
    })
    const presentRecords = attendanceRecords.filter(a => a.status === 'Present').length
    const avgAttendance = attendanceRecords.length > 0 ? Math.round((presentRecords / attendanceRecords.length) * 100) : 0

    return res.json({
      success: true,
      faculty,
      stats: {
        totalAssignedStudents,
        interningStudents,
        pendingWorkLogs,
        avgAttendance,
        totalApplications: applications.length,
      },
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app.id,
        studentName: app.student.user.name,
        companyName: app.internship.title,
        status: app.status,
        appliedDate: app.appliedDate.toISOString().split('T')[0],
      })),
    })
  } catch (error) {
    next(error)
  }
})

// 2. Faculty Students List: STRICTLY FILTERED BY MENTOR ASSIGNMENT
router.get('/students', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    const { search, department, status } = req.query as { search?: string; department?: string; status?: string }

    // Query ONLY students assigned to this faculty mentor
    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { facultyId: faculty.id, status: 'ACTIVE' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            applications: {
              include: { internship: { include: { company: true } } },
              orderBy: { appliedDate: 'desc' },
            },
            attendanceRecords: true,
            workLogs: true,
            feedbacks: true,
          },
        },
      },
    })

    let students = assignments.map(a => {
      const sp = a.student
      const apps = sp.applications
      const selectedApp = apps.find(ap => ap.status === 'Selected')

      // Attendance percentage
      const totalAtt = sp.attendanceRecords.length
      const presentAtt = sp.attendanceRecords.filter(ar => ar.status === 'Present').length
      const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

      // Compute status
      let studentStatus = 'No Application'
      if (selectedApp) studentStatus = 'Interning'
      else if (apps.some(ap => ap.status === 'Interview_Scheduled')) studentStatus = 'Interview'
      else if (apps.some(ap => ap.status === 'Shortlisted')) studentStatus = 'Shortlisted'
      else if (apps.some(ap => !['Withdrawn', 'Rejected'].includes(ap.status))) studentStatus = 'Applied'

      let skills: string[] = []
      try { skills = JSON.parse(sp.skills) } catch {}

      return {
        id: sp.id,
        name: sp.user.name,
        email: sp.user.email,
        phone: sp.phone || '',
        college: sp.college,
        collegeId: sp.collegeId,
        course: sp.course,
        year: sp.year,
        department: sp.department,
        bio: sp.bio || '',
        skills,
        profileCompletion: sp.profileCompletion,
        status: studentStatus,
        attendancePercentage: attPct,
        activeInternship: selectedApp ? {
          title: selectedApp.internship.title,
          company: selectedApp.internship.company.name,
        } : null,
      }
    })

    // Apply optional search/filtering in memory or query
    if (search) {
      const q = search.toLowerCase()
      students = students.filter(s => s.name.toLowerCase().includes(q) || s.collegeId.toLowerCase().includes(q))
    }
    if (department) {
      students = students.filter(s => s.department === department)
    }
    if (status) {
      students = students.filter(s => s.status === status)
    }

    return res.json({
      success: true,
      count: students.length,
      assignedMentor: faculty.name,
      students,
    })
  } catch (error) {
    next(error)
  }
})

// 3. View Student Detail: STRICT MENTOR ISOLATION ENFORCEMENT
router.get('/students/:id', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    const studentId = req.params.id

    // CRITICAL ENFORCEMENT: Verify this student is assigned to this faculty mentor
    const isAssigned = await verifyMentorAccess(faculty.id, studentId)
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view this student because they are not assigned to your mentorship group.',
      })
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true } },
        applications: {
          include: { internship: { include: { company: true } } },
          orderBy: { appliedDate: 'desc' },
        },
        attendanceRecords: { orderBy: { date: 'desc' } },
        workLogs: { orderBy: { date: 'desc' } },
        feedbacks: { include: { company: true } },
      },
    })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' })

    let parsedSkills: string[] = []
    try { parsedSkills = JSON.parse(student.skills) } catch { parsedSkills = [] }

    return res.json({
      success: true,
      student: {
        ...student,
        name: student.user.name,
        email: student.user.email,
        skills: parsedSkills,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 4. Assigned Students Attendance
router.get('/attendance', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { facultyId: faculty.id, status: 'ACTIVE' },
      select: { studentId: true },
    })
    const assignedStudentIds = assignments.map(a => a.studentId)

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: { in: assignedStudentIds } },
      include: {
        student: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    })

    return res.json({
      success: true,
      records: records.map(r => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student.user.name,
        date: r.date.toISOString().split('T')[0],
        status: r.status,
        checkInTime: r.checkInTime || undefined,
        remark: r.remark || undefined,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// 5. Assigned Students Work Logs
router.get('/work-logs', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { facultyId: faculty.id, status: 'ACTIVE' },
      select: { studentId: true },
    })
    const assignedStudentIds = assignments.map(a => a.studentId)

    const logs = await prisma.workLog.findMany({
      where: { studentId: { in: assignedStudentIds } },
      include: {
        student: { include: { user: true } },
        internship: { include: { company: true } },
      },
      orderBy: { date: 'desc' },
    })

    return res.json({
      success: true,
      workLogs: logs.map(l => ({
        id: l.id,
        studentId: l.studentId,
        studentName: l.student.user.name,
        companyName: l.internship?.company.name || 'External Company',
        date: l.date.toISOString().split('T')[0],
        workCompleted: l.workCompleted,
        hoursWorked: l.hoursWorked,
        challenges: l.challenges || '',
        learning: l.learning || '',
        tomorrowPlan: l.tomorrowPlan || '',
        status: l.status,
        facultyComment: l.facultyComment || undefined,
        submittedDate: l.submittedDate ? l.submittedDate.toISOString().split('T')[0] : undefined,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// 6. Review Work Log: STRICT ISOLATION ENFORCEMENT
const reviewSchema = z.object({
  status: z.enum(['Reviewed', 'Changes_Requested']),
  comment: z.string().optional(),
})

router.put('/work-logs/:id/review', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    const { status, comment } = reviewSchema.parse(req.body)

    const log = await prisma.workLog.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    })
    if (!log) return res.status(404).json({ success: false, message: 'Work log not found' })

    // CRITICAL ENFORCEMENT: Verify this student is assigned to this faculty mentor
    const isAssigned = await verifyMentorAccess(faculty.id, log.studentId)
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot review a work log for a student not assigned to you.',
      })
    }

    const updated = await prisma.workLog.update({
      where: { id: log.id },
      data: {
        status: status as WorkLogStatus,
        facultyComment: comment,
      },
    })

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: log.student.userId,
        category: 'Work Log',
        title: status === 'Reviewed' ? 'Work Log Reviewed' : 'Work Log Changes Requested',
        description: comment ? `Faculty feedback: ${comment}` : `Your work log for ${log.date.toISOString().split('T')[0]} has been reviewed.`,
      },
    })

    await logAudit({
      userId: req.user!.id,
      action: 'REVIEW_WORK_LOG',
      targetType: 'WORK_LOG',
      targetId: log.id,
      details: `Status: ${status}, Comment: ${comment || 'None'}`,
      ipAddress: req.ip,
    })

    return res.json({ success: true, message: `Work log marked as ${status}`, workLog: updated })
  } catch (error) {
    next(error)
  }
})

// 7. Assigned Student Progress Report & CSV Export Dataset
router.get('/reports', async (req: Request, res: Response, next) => {
  try {
    const faculty = await getFacultyProfile(req.user!.id)
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' })

    // RESTRICTED TO ASSIGNED STUDENTS ONLY
    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { facultyId: faculty.id, status: 'ACTIVE' },
      include: {
        student: {
          include: {
            user: true,
            applications: { include: { internship: { include: { company: true } } } },
            attendanceRecords: true,
            workLogs: true,
            feedbacks: true,
          },
        },
      },
    })

    const reportRows = assignments.map(a => {
      const s = a.student
      const selectedApp = s.applications.find(ap => ap.status === 'Selected')
      const totalAtt = s.attendanceRecords.length
      const presentAtt = s.attendanceRecords.filter(r => r.status === 'Present').length
      const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0
      const logsCount = s.workLogs.length

      return {
        studentId: s.id,
        studentName: s.user.name,
        collegeId: s.collegeId,
        department: s.department,
        internshipTitle: selectedApp?.internship.title || 'N/A',
        companyName: selectedApp?.internship.company.name || 'N/A',
        status: selectedApp ? 'Interning' : 'Seeking',
        attendancePercentage: attPct,
        workLogsSubmitted: logsCount,
      }
    })

    return res.json({
      success: true,
      mentorName: faculty.name,
      department: faculty.department,
      assignedStudentsCount: reportRows.length,
      reportRows,
    })
  } catch (error) {
    next(error)
  }
})

export default router
