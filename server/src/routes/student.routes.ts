import { Router, Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'
import { Role, ApplicationStatus, AttendanceStatus, WorkLogStatus } from '@prisma/client'
import { prisma } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { handleResumeUpload, UPLOAD_DIR } from '../middleware/upload.js'

const router = Router()

// All endpoints in this router require authentication and STUDENT role
router.use(authenticate, requireRole(Role.STUDENT))

// 1. Get current student profile
router.get('/profile', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: { select: { name: true, email: true } },
        mentorAssignments: {
          where: { status: 'ACTIVE' },
          include: { faculty: true },
        },
      },
    })
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' })

    const parsedSkills = (() => {
      try { return JSON.parse(student.skills) } catch { return [] }
    })()

    return res.json({
      success: true,
      student: {
        ...student,
        name: student.user.name,
        email: student.user.email,
        skills: parsedSkills,
        mentor: student.mentorAssignments[0]?.faculty || null,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 2. Update student profile
const updateProfileSchema = z.object({
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  resumeName: z.string().optional(),
  college: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  department: z.string().optional(),
})

router.put('/profile', async (req: Request, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const current = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!current) return res.status(404).json({ success: false, message: 'Profile not found' })

    const updatedSkills = data.skills ? JSON.stringify(data.skills) : current.skills
    
    // Calculate profile completion
    const checks = [
      data.phone ?? current.phone,
      data.bio ?? current.bio,
      data.linkedin ?? current.linkedin,
      data.github ?? current.github,
      data.resumeName ?? current.resumeName,
      data.department ?? current.department,
    ]
    const completion = Math.min(100, Math.round((checks.filter(Boolean).length / 6) * 100))

    const updated = await prisma.studentProfile.update({
      where: { id: current.id },
      data: {
        phone: data.phone,
        bio: data.bio,
        skills: updatedSkills,
        linkedin: data.linkedin,
        github: data.github,
        resumeName: data.resumeName,
        college: data.college,
        course: data.course,
        year: data.year,
        department: data.department,
        profileCompletion: completion,
      },
    })

    let parsedSkills: string[] = []
    try { parsedSkills = JSON.parse(updated.skills) } catch { parsedSkills = [] }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      student: {
        ...updated,
        name: req.user!.name,
        email: req.user!.email,
        skills: parsedSkills,
      },
    })
  } catch (error) {
    next(error)
  }
})

// 3. Get Student's applications
router.get('/applications', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const apps = await prisma.internshipApplication.findMany({
      where: { studentId: student.id },
      include: {
        internship: {
          include: { company: true },
        },
      },
      orderBy: { appliedDate: 'desc' },
    })

    const formatted = apps.map(a => {
      let timeline = []
      try { timeline = JSON.parse(a.timeline) } catch {}
      return {
        id: a.id,
        internshipId: a.internshipId,
        internshipTitle: a.internship.title,
        companyId: a.internship.companyId,
        companyName: a.internship.company.name,
        companyLogoColor: a.internship.company.logoColor,
        studentId: student.id,
        studentName: req.user!.name,
        studentCollege: student.college,
        studentCourse: student.course,
        appliedDate: a.appliedDate.toISOString().split('T')[0],
        lastUpdated: a.lastUpdated.toISOString().split('T')[0],
        status: a.status,
        coverLetter: a.coverLetter || '',
        timeline,
        startDate: a.internship.startDate.toISOString().split('T')[0],
        endDate: a.internship.endDate.toISOString().split('T')[0],
        availabilityConfirmed: a.availabilityConfirmed,
        resumeName: a.resumeName || student.resumeName || 'Resume.pdf',
        hasResumeFile: Boolean(a.resumePath || student.resumePath),
        interviewDate: a.interviewDate ? a.interviewDate.toISOString().split('T')[0] : undefined,
        interviewTime: a.interviewTime || undefined,
        interviewLink: a.interviewLink || undefined,
        interviewNotes: a.interviewNotes || undefined,
        expectedJoiningDate: a.expectedJoiningDate ? a.expectedJoiningDate.toISOString().split('T')[0] : undefined,
        actualJoiningDate: a.actualJoiningDate ? a.actualJoiningDate.toISOString().split('T')[0] : undefined,
      }
    })

    return res.json({ success: true, applications: formatted })
  } catch (error) {
    next(error)
  }
})

// 4. Apply for an internship with exact date and deadline validation and real resume upload
const applySchema = z.object({
  internshipId: z.string().min(1, 'Internship ID is required'),
  coverLetter: z.string().optional(),
  availabilityConfirmed: z.union([z.boolean(), z.string({
    required_error: 'Availability confirmation is required.',
  })]).transform(val => {
    if (typeof val === 'string') return val === 'true'
    return val
  }).refine(val => val === true, {
    message: 'You must confirm that you are available to start on the internship specified start date and can participate throughout the advertised internship period.',
  }),
})

router.post('/applications', handleResumeUpload('resume'), async (req: Request, res: Response, next) => {
  try {
    const { internshipId, coverLetter, availabilityConfirmed } = applySchema.parse(req.body)
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: { mentorAssignments: { where: { status: 'ACTIVE' }, include: { faculty: true } } },
    })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { company: true },
    })
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' })

    // Check internship status
    if (internship.status !== 'Open' && internship.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Applications are closed for this internship (Status: ${internship.status}).`,
      })
    }

    // CRITICAL REQUIREMENT: Prevent applications after the application deadline
    const now = new Date()
    if (now > internship.deadline) {
      return res.status(400).json({
        success: false,
        message: `Application deadline was ${internship.deadline.toISOString().split('T')[0]}. Applications are now closed for this role.`,
      })
    }

    // Check existing application
    const existing = await prisma.internshipApplication.findUnique({
      where: { internshipId_studentId: { internshipId, studentId: student.id } },
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this internship' })
    }

    // Handle resume file linking
    let resumeName = req.file ? req.file.originalname : student.resumeName
    let resumePath = req.file ? req.file.filename : student.resumePath

    // If student uploaded a new resume with this application, also update their profile
    if (req.file) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          resumeName,
          resumePath,
        },
      })
    }

    const todayStr = now.toISOString().split('T')[0]
    const initialTimeline = JSON.stringify([
      { status: 'Applied', date: todayStr, note: 'Application submitted by student' },
    ])

    const application = await prisma.internshipApplication.create({
      data: {
        internshipId,
        studentId: student.id,
        coverLetter,
        status: ApplicationStatus.Applied,
        timeline: initialTimeline,
        availabilityConfirmed: true,
        resumeName,
        resumePath,
      },
    })

    // Notify Company
    await prisma.notification.create({
      data: {
        userId: internship.company.userId,
        category: 'Application',
        title: 'New Internship Application',
        description: `${req.user!.name} has applied for ${internship.title}.`,
      },
    })

    // Notify Assigned Faculty Mentor
    if (student.mentorAssignments[0]?.faculty) {
      await prisma.notification.create({
        data: {
          userId: student.mentorAssignments[0].faculty.userId,
          category: 'Application',
          title: 'Student Application Update',
          description: `${req.user!.name} applied to ${internship.company.name} for ${internship.title}.`,
        },
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    })
  } catch (error) {
    next(error)
  }
})

// 4b. Upload resume in Student Profile
router.post('/profile/resume', handleResumeUpload('resume'), async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a valid resume file (PDF or DOCX).' })
    }

    const resumeName = req.file.originalname
    const resumePath = req.file.filename

    const updated = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        resumeName,
        resumePath,
      },
    })

    return res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeName: updated.resumeName,
    })
  } catch (error) {
    next(error)
  }
})

// 4c. Download student profile resume
router.get('/profile/resume', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student || !student.resumePath) {
      return res.status(404).json({ success: false, message: 'No resume uploaded yet' })
    }

    const safeName = path.basename(student.resumePath)
    const filePath = path.join(UPLOAD_DIR, safeName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' })
    }

    return res.download(filePath, student.resumeName || 'Resume.pdf')
  } catch (error) {
    next(error)
  }
})

// 4d. Download resume for a student application
router.get('/applications/:id/resume', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const application = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    })

    if (!application || application.studentId !== student.id) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    const storedFilename = application.resumePath || application.student.resumePath
    if (!storedFilename) {
      return res.status(404).json({ success: false, message: 'No resume file attached to this application' })
    }

    const safeName = path.basename(storedFilename)
    const filePath = path.join(UPLOAD_DIR, safeName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' })
    }

    return res.download(filePath, application.resumeName || application.student.resumeName || 'Resume.pdf')
  } catch (error) {
    next(error)
  }
})

// 5. Withdraw application
router.delete('/applications/:id', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const app = await prisma.internshipApplication.findUnique({ where: { id: req.params.id } })
    if (!app || app.studentId !== student.id) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    let timeline = []
    try { timeline = JSON.parse(app.timeline) } catch {}
    timeline.push({ status: 'Withdrawn', date: new Date().toISOString().split('T')[0], note: 'Application withdrawn by student' })

    await prisma.internshipApplication.update({
      where: { id: app.id },
      data: {
        status: ApplicationStatus.Withdrawn,
        timeline: JSON.stringify(timeline),
      },
    })

    return res.json({ success: true, message: 'Application withdrawn successfully' })
  } catch (error) {
    next(error)
  }
})

// 6. Attendance: Get and Record
router.get('/attendance', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
    })

    const present = records.filter(r => r.status === AttendanceStatus.Present).length
    const late = records.filter(r => r.status === AttendanceStatus.Late).length
    const absent = records.filter(r => r.status === AttendanceStatus.Absent).length
    const total = records.length
    // Clearly defined formula: Present count divided by total recorded days * 100
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0

    return res.json({
      success: true,
      records: records.map(r => ({
        id: r.id,
        studentId: r.studentId,
        date: r.date.toISOString().split('T')[0],
        status: r.status,
        checkInTime: r.checkInTime || undefined,
        remark: r.remark || undefined,
      })),
      stats: {
        total,
        present,
        late,
        absent,
        attendancePercentage,
      },
    })
  } catch (error) {
    next(error)
  }
})

const attendanceSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  status: z.enum(['Present', 'Absent', 'Late']),
  remark: z.string().optional(),
})

router.post('/attendance', async (req: Request, res: Response, next) => {
  try {
    const data = attendanceSchema.parse(req.body)
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    // Find active selected internship if any
    const activeApp = await prisma.internshipApplication.findFirst({
      where: { studentId: student.id, status: ApplicationStatus.Selected },
    })

    const dateObj = new Date(`${data.date}T00:00:00.000Z`)
    const checkInTime = data.status === 'Present' ? '09:15 AM' : data.status === 'Late' ? '10:15 AM' : undefined

    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: dateObj,
        },
      },
      create: {
        studentId: student.id,
        internshipId: activeApp?.internshipId,
        date: dateObj,
        status: data.status as AttendanceStatus,
        checkInTime,
        remark: data.remark,
      },
      update: {
        status: data.status as AttendanceStatus,
        checkInTime,
        remark: data.remark,
      },
    })

    return res.json({ success: true, message: `Attendance marked as ${data.status}`, record })
  } catch (error) {
    next(error)
  }
})

// 7. Daily Work Logs
router.get('/work-logs', async (req: Request, res: Response, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const logs = await prisma.workLog.findMany({
      where: { studentId: student.id },
      include: {
        internship: { include: { company: true } },
      },
      orderBy: { date: 'desc' },
    })

    return res.json({
      success: true,
      workLogs: logs.map(l => ({
        id: l.id,
        studentId: l.studentId,
        studentName: req.user!.name,
        companyId: l.internship?.companyId || '',
        companyName: l.internship?.company.name || 'TechNova Solutions',
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

const workLogSchema = z.object({
  date: z.string(),
  workCompleted: z.string(),
  hoursWorked: z.number().min(0.5).max(24),
  challenges: z.string().optional(),
  learning: z.string().optional(),
  tomorrowPlan: z.string().optional(),
  status: z.enum(['Draft', 'Submitted']).default('Submitted'),
})

router.post('/work-logs', async (req: Request, res: Response, next) => {
  try {
    const data = workLogSchema.parse(req.body)
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: { mentorAssignments: { where: { status: 'ACTIVE' }, include: { faculty: true } } },
    })
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' })

    const activeApp = await prisma.internshipApplication.findFirst({
      where: { studentId: student.id, status: ApplicationStatus.Selected },
    })

    const log = await prisma.workLog.create({
      data: {
        studentId: student.id,
        internshipId: activeApp?.internshipId,
        date: new Date(`${data.date}T00:00:00.000Z`),
        workCompleted: data.workCompleted,
        hoursWorked: data.hoursWorked,
        challenges: data.challenges,
        learning: data.learning,
        tomorrowPlan: data.tomorrowPlan,
        status: data.status as WorkLogStatus,
        submittedDate: data.status === 'Submitted' ? new Date() : null,
      },
    })

    // If submitted, notify assigned faculty mentor
    if (data.status === 'Submitted' && student.mentorAssignments[0]?.faculty) {
      await prisma.notification.create({
        data: {
          userId: student.mentorAssignments[0].faculty.userId,
          category: 'Work Log',
          title: 'Work Log Submitted',
          description: `${req.user!.name} has submitted a work log for ${data.date}.`,
        },
      })
    }

    return res.status(201).json({ success: true, message: 'Work log saved', workLog: log })
  } catch (error) {
    next(error)
  }
})

export default router
