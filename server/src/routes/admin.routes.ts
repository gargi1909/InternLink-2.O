import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Role, AssignmentStatus } from '@prisma/client'
import { prisma } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()

// All admin endpoints require authentication and ADMIN role
router.use(authenticate, requireRole(Role.ADMIN))

// 1. Institution-wide Admin Dashboard Metrics
router.get('/dashboard', async (req: Request, res: Response, next) => {
  try {
    const totalStudents = await prisma.studentProfile.count()
    const totalFaculty = await prisma.facultyProfile.count()
    const totalCompanies = await prisma.companyProfile.count()
    const totalInternships = await prisma.internship.count()
    const totalApplications = await prisma.internshipApplication.count()
    const selectedCount = await prisma.internshipApplication.count({ where: { status: 'Selected' } })

    // Mentor load statistics
    const mentors = await prisma.facultyProfile.findMany({
      include: {
        mentorAssignments: { where: { status: 'ACTIVE' } },
      },
    })

    const mentorLoads = mentors.map(m => ({
      mentorId: m.id,
      name: m.name,
      department: m.department,
      assignedCount: m.mentorAssignments.length,
      maxCapacity: 23, // Recommended faculty load
      loadPercentage: Math.round((m.mentorAssignments.length / 23) * 100),
    }))

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalCompanies,
        totalInternships,
        totalApplications,
        selectedCount,
        placementRate: totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0,
      },
      mentorLoads,
      recentAuditLogs,
    })
  } catch (error) {
    next(error)
  }
})

// 2. Manage Users
router.get('/users', async (req: Request, res: Response, next) => {
  try {
    const { role, search } = req.query as { role?: string; search?: string }
    const users = await prisma.user.findMany({
      where: {
        role: role ? (role.toUpperCase() as Role) : undefined,
      },
      include: {
        studentProfile: true,
        companyProfile: true,
        facultyProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    let formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.toLowerCase(),
      createdAt: u.createdAt.toISOString().split('T')[0],
      profileDetails: u.studentProfile || u.companyProfile || u.facultyProfile,
    }))

    if (search) {
      const q = search.toLowerCase()
      formatted = formatted.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }

    return res.json({ success: true, count: formatted.length, users: formatted })
  } catch (error) {
    next(error)
  }
})

// 3. Mentors List with assignment counts
router.get('/mentors', async (req: Request, res: Response, next) => {
  try {
    const mentors = await prisma.facultyProfile.findMany({
      include: {
        user: { select: { email: true } },
        mentorAssignments: {
          where: { status: 'ACTIVE' },
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
    })

    const formatted = mentors.map(m => ({
      id: m.id,
      name: m.name,
      email: m.user.email,
      department: m.department,
      college: m.college,
      designation: m.designation,
      assignedCount: m.mentorAssignments.length,
      assignedStudents: m.mentorAssignments.map(a => ({
        assignmentId: a.id,
        studentId: a.studentId,
        studentName: a.student.user.name,
        collegeId: a.student.collegeId,
      })),
    }))

    return res.json({ success: true, mentors: formatted })
  } catch (error) {
    next(error)
  }
})

// 4. Get All Mentor Assignments
router.get('/assignments', async (req: Request, res: Response, next) => {
  try {
    const assignments = await prisma.studentMentorAssignment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        faculty: { include: { user: { select: { email: true } } } },
      },
      orderBy: { assignedAt: 'desc' },
    })

    const formatted = assignments.map(a => ({
      id: a.id,
      studentId: a.studentId,
      studentName: a.student.user.name,
      studentCollegeId: a.student.collegeId,
      studentDepartment: a.student.department,
      mentorId: a.facultyId,
      mentorName: a.faculty.name,
      mentorDepartment: a.faculty.department,
      assignedAt: a.assignedAt.toISOString().split('T')[0],
      assignedBy: a.assignedBy || 'TPO Administrator',
      status: a.status,
    }))

    return res.json({ success: true, count: formatted.length, assignments: formatted })
  } catch (error) {
    next(error)
  }
})

// 5. Assign or Reassign Student to Faculty Mentor
const assignSchema = z.object({
  studentId: z.string(),
  facultyId: z.string(),
})

router.post('/assignments', async (req: Request, res: Response, next) => {
  try {
    const { studentId, facultyId } = assignSchema.parse(req.body)

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true },
    })
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' })

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: facultyId },
    })
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty mentor profile not found' })

    // CRITICAL REQUIREMENT: Enforce single primary mentor per student
    // Deactivate previous active assignments for this student
    await prisma.studentMentorAssignment.updateMany({
      where: { studentId, status: 'ACTIVE' },
      data: { status: AssignmentStatus.INACTIVE },
    })

    // Create new active assignment
    const newAssignment = await prisma.studentMentorAssignment.create({
      data: {
        studentId,
        facultyId,
        assignedBy: req.user!.name,
        status: AssignmentStatus.ACTIVE,
      },
    })

    // Log administrative audit action
    await logAudit({
      userId: req.user!.id,
      action: 'ASSIGN_STUDENT_MENTOR',
      targetType: 'STUDENT_MENTOR_ASSIGNMENT',
      targetId: newAssignment.id,
      details: `Admin assigned student "${student.user.name}" (${student.collegeId}) to Mentor "${faculty.name}"`,
      ipAddress: req.ip,
    })

    // Notify Faculty Mentor
    await prisma.notification.create({
      data: {
        userId: faculty.userId,
        category: 'Faculty',
        title: 'New Student Assigned',
        description: `${student.user.name} (${student.collegeId}) has been assigned to your supervision group.`,
      },
    })

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: student.userId,
        category: 'Faculty',
        title: 'Faculty Mentor Assigned',
        description: `You have been assigned to ${faculty.name} (${faculty.department}) for internship guidance.`,
      },
    })

    return res.status(201).json({
      success: true,
      message: `Student successfully assigned to ${faculty.name}`,
      assignment: newAssignment,
    })
  } catch (error) {
    next(error)
  }
})

// 6. Audit Trail for Administrator Actions
router.get('/audit-logs', async (req: Request, res: Response, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    })

    const formatted = logs.map(l => ({
      id: l.id,
      userName: l.user?.name || 'System',
      userEmail: l.user?.email || 'system',
      userRole: l.user?.role || 'SYSTEM',
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      details: l.details || '',
      ipAddress: l.ipAddress || '',
      timestamp: l.createdAt.toISOString(),
    }))

    return res.json({ success: true, count: formatted.length, auditLogs: formatted })
  } catch (error) {
    next(error)
  }
})

export default router
