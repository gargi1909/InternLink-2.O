import { Router, Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'
import { Role, WorkMode, InternshipStatus, ApplicationStatus } from '@prisma/client'
import { prisma } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'
import { UPLOAD_DIR } from '../middleware/upload.js'

const router = Router()

// All company endpoints require authentication and COMPANY role
router.use(authenticate, requireRole(Role.COMPANY))

async function getCompanyProfile(userId: string) {
  return prisma.companyProfile.findUnique({
    where: { userId },
  })
}

// 1. Get Company Profile
router.get('/profile', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })
    return res.json({ success: true, company })
  } catch (error) {
    next(error)
  }
})

// 2. Update Company Profile
const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
})

router.put('/profile', async (req: Request, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const updated = await prisma.companyProfile.update({
      where: { id: company.id },
      data,
    })

    return res.json({ success: true, message: 'Company profile updated', company: updated })
  } catch (error) {
    next(error)
  }
})

// 3. Post Internship with EXACT DATE VALIDATION
const postInternshipSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  eligibility: z.string(),
  location: z.string(),
  workMode: z.enum(['Remote', 'Hybrid', 'On_site']),
  duration: z.string(),
  startDate: z.string(), // ISO or YYYY-MM-DD
  endDate: z.string(),   // ISO or YYYY-MM-DD
  deadline: z.string(),  // ISO or YYYY-MM-DD
  stipend: z.number().default(0),
  openings: z.number().min(1).default(1),
  benefits: z.array(z.string()).default([]),
  type: z.string().default('Software Development'),
  status: z.enum(['Draft', 'Open']).default('Open'),
})

router.post('/internships', async (req: Request, res: Response, next) => {
  try {
    const data = postInternshipSchema.parse(req.body)
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const deadline = new Date(data.deadline)

    // CRITICAL REQUIREMENT: Validate that end date is not earlier than start date
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule: Internship end date must be after the start date.',
      })
    }

    // CRITICAL REQUIREMENT: Validate application deadline is appropriate
    if (deadline > start) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule: Application deadline must be on or before the internship start date.',
      })
    }

    const internship = await prisma.internship.create({
      data: {
        companyId: company.id,
        title: data.title,
        description: data.description,
        responsibilities: JSON.stringify(data.responsibilities),
        requiredSkills: JSON.stringify(data.requiredSkills),
        eligibility: data.eligibility,
        location: data.location,
        workMode: data.workMode as WorkMode,
        duration: data.duration,
        startDate: start,
        endDate: end,
        deadline,
        stipend: data.stipend,
        openings: data.openings,
        benefits: JSON.stringify(data.benefits),
        type: data.type,
        status: data.status as InternshipStatus,
      },
    })

    await logAudit({
      userId: req.user!.id,
      action: 'POST_INTERNSHIP',
      targetType: 'INTERNSHIP',
      targetId: internship.id,
      details: `Created internship "${internship.title}" with start ${data.startDate}`,
      ipAddress: req.ip,
    })

    return res.status(201).json({
      success: true,
      message: 'Internship created successfully',
      internship,
    })
  } catch (error) {
    next(error)
  }
})

// 4. Get Company's Posted Internships
router.get('/internships', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const internships = await prisma.internship.findMany({
      where: { companyId: company.id },
      include: {
        applications: true,
      },
      orderBy: { postedDate: 'desc' },
    })

    const formatted = internships.map(i => {
      let resp: string[] = []
      let skills: string[] = []
      let benefits: string[] = []
      try { resp = JSON.parse(i.responsibilities) } catch {}
      try { skills = JSON.parse(i.requiredSkills) } catch {}
      try { benefits = JSON.parse(i.benefits) } catch {}

      return {
        id: i.id,
        companyId: i.companyId,
        companyName: company.name,
        companyLogoColor: company.logoColor,
        title: i.title,
        description: i.description,
        responsibilities: resp,
        requiredSkills: skills,
        eligibility: i.eligibility,
        location: i.location,
        workMode: i.workMode === 'On_site' ? 'On-site' : i.workMode,
        duration: i.duration,
        startDate: i.startDate.toISOString().split('T')[0],
        endDate: i.endDate.toISOString().split('T')[0],
        deadline: i.deadline.toISOString().split('T')[0],
        stipend: i.stipend,
        openings: i.openings,
        benefits,
        postedDate: i.postedDate.toISOString().split('T')[0],
        applicants: i.applications.length,
        status: i.status === 'In_Progress' ? 'Active' : i.status === 'Open' ? 'Active' : i.status,
        type: i.type,
      }
    })

    return res.json({ success: true, internships: formatted })
  } catch (error) {
    next(error)
  }
})

// 5. Get Applications for Company's Internships
router.get('/applications', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const apps = await prisma.internshipApplication.findMany({
      where: {
        internship: { companyId: company.id },
      },
      include: {
        internship: true,
        student: { include: { user: true } },
      },
      orderBy: { appliedDate: 'desc' },
    })

    const formatted = apps.map(a => {
      let timeline = []
      let skills: string[] = []
      try { timeline = JSON.parse(a.timeline) } catch {}
      try { skills = JSON.parse(a.student.skills) } catch {}

      return {
        id: a.id,
        internshipId: a.internshipId,
        internshipTitle: a.internship.title,
        companyId: company.id,
        companyName: company.name,
        companyLogoColor: company.logoColor,
        studentId: a.studentId,
        studentName: a.student.user.name,
        studentCollege: a.student.college,
        studentCourse: a.student.course,
        studentSkills: skills,
        studentResumeName: a.resumeName || a.student.resumeName || 'Resume.pdf',
        hasResumeFile: Boolean(a.resumePath || a.student.resumePath),
        appliedDate: a.appliedDate.toISOString().split('T')[0],
        lastUpdated: a.lastUpdated.toISOString().split('T')[0],
        status: a.status === 'Interview_Scheduled' ? 'Interview Scheduled' : a.status === 'Under_Review' ? 'Under Review' : a.status,
        coverLetter: a.coverLetter || '',
        timeline,
        startDate: a.internship.startDate.toISOString().split('T')[0],
        endDate: a.internship.endDate.toISOString().split('T')[0],
        availabilityConfirmed: a.availabilityConfirmed,
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

// 5b. Download/View Candidate Resume (Company Only, strictly isolated to company's internships)
router.get('/applications/:id/resume', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const application = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: {
        internship: true,
        student: true,
      },
    })

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    // CRITICAL REQUIREMENT: Authorized company users view/download resumes for applications to their own internships only
    if (application.internship.companyId !== company.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to access resumes for applications outside your company.',
      })
    }

    const storedFilename = application.resumePath || application.student.resumePath
    if (!storedFilename) {
      return res.status(404).json({ success: false, message: 'No resume file attached to this application' })
    }

    // Path traversal protection
    const safeName = path.basename(storedFilename)
    const filePath = path.join(UPLOAD_DIR, safeName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' })
    }

    const downloadName = application.resumeName || application.student.resumeName || 'Candidate_Resume.pdf'
    return res.download(filePath, downloadName)
  } catch (error) {
    next(error)
  }
})

// 6. Update Application Status & Interview / Joining Dates
const updateStatusSchema = z.object({
  status: z.enum(['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected']),
  note: z.string().optional(),
  interviewDetails: z.object({
    date: z.string().optional(),
    time: z.string().optional(),
    link: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  expectedJoiningDate: z.string().optional(),
  actualJoiningDate: z.string().optional(),
})

router.put('/applications/:id/status', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const { status, note, interviewDetails, expectedJoiningDate, actualJoiningDate } = updateStatusSchema.parse(req.body)

    const app = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: {
        internship: true,
        student: {
          include: {
            user: true,
            mentorAssignments: { where: { status: 'ACTIVE' }, include: { faculty: true } },
          },
        },
      },
    })
    if (!app || app.internship.companyId !== company.id) {
      return res.status(404).json({ success: false, message: 'Application not found for your company' })
    }

    // Map status string to Prisma enum
    const statusMap: Record<string, ApplicationStatus> = {
      'Applied': ApplicationStatus.Applied,
      'Under Review': ApplicationStatus.Under_Review,
      'Shortlisted': ApplicationStatus.Shortlisted,
      'Interview Scheduled': ApplicationStatus.Interview_Scheduled,
      'Selected': ApplicationStatus.Selected,
      'Rejected': ApplicationStatus.Rejected,
    }
    const prismaStatus = statusMap[status]

    let timeline = []
    try { timeline = JSON.parse(app.timeline) } catch {}
    timeline.push({
      status,
      date: new Date().toISOString().split('T')[0],
      note: note || `Status updated to ${status}`,
    })

    const updated = await prisma.internshipApplication.update({
      where: { id: app.id },
      data: {
        status: prismaStatus,
        timeline: JSON.stringify(timeline),
        interviewDate: interviewDetails?.date ? new Date(interviewDetails.date) : app.interviewDate,
        interviewTime: interviewDetails?.time ?? app.interviewTime,
        interviewLink: interviewDetails?.link ?? app.interviewLink,
        interviewNotes: interviewDetails?.notes ?? app.interviewNotes,
        expectedJoiningDate: expectedJoiningDate ? new Date(expectedJoiningDate) : app.expectedJoiningDate,
        actualJoiningDate: actualJoiningDate ? new Date(actualJoiningDate) : app.actualJoiningDate,
      },
    })

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: app.student.userId,
        category: status === 'Interview Scheduled' ? 'Interview' : 'Application',
        title: `Application Status: ${status}`,
        description: `Your application for ${app.internship.title} at ${company.name} is now ${status}.`,
      },
    })

    // Notify Faculty Mentor if assigned
    if (app.student.mentorAssignments[0]?.faculty) {
      await prisma.notification.create({
        data: {
          userId: app.student.mentorAssignments[0].faculty.userId,
          category: 'Application',
          title: `Student Selection Update`,
          description: `${app.student.user.name} application for ${app.internship.title} status changed to ${status}.`,
        },
      })
    }

    return res.json({ success: true, message: `Application status updated to ${status}`, application: updated })
  } catch (error) {
    next(error)
  }
})

// 7. Submit Feedback for Intern
const feedbackSchema = z.object({
  studentId: z.string(),
  internshipId: z.string(),
  performanceRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  technicalRating: z.number().min(1).max(5),
  professionalismRating: z.number().min(1).max(5),
  teamworkRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  comments: z.string(),
})

router.post('/feedback', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const data = feedbackSchema.parse(req.body)

    const fb = await prisma.feedback.upsert({
      where: {
        internshipId_studentId: {
          internshipId: data.internshipId,
          studentId: data.studentId,
        },
      },
      create: {
        ...data,
        companyId: company.id,
      },
      update: {
        ...data,
      },
    })

    const student = await prisma.studentProfile.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    })

    if (student) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          category: 'Feedback',
          title: 'Internship Feedback Received',
          description: `${company.name} has submitted detailed performance evaluation for your internship.`,
        },
      })
    }

    return res.json({ success: true, message: 'Feedback submitted successfully', feedback: fb })
  } catch (error) {
    next(error)
  }
})

// 8. Complete Internship (mark completion and record completion date)
router.post('/applications/:id/complete', async (req: Request, res: Response, next) => {
  try {
    const company = await getCompanyProfile(req.user!.id)
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' })

    const app = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: {
        internship: true,
        student: { include: { user: true, mentorAssignments: { where: { status: 'ACTIVE' }, include: { faculty: true } } } },
      },
    })
    if (!app || app.internship.companyId !== company.id) {
      return res.status(404).json({ success: false, message: 'Application not found for your company' })
    }

    const today = new Date()
    let timeline = []
    try { timeline = JSON.parse(app.timeline) } catch {}
    timeline.push({
      status: 'Completed',
      date: today.toISOString().split('T')[0],
      note: 'Internship marked as successfully completed by company mentor',
    })

    const updated = await prisma.internshipApplication.update({
      where: { id: app.id },
      data: {
        completionDate: today,
        timeline: JSON.stringify(timeline),
      },
    })

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: app.student.userId,
        category: 'System',
        title: 'Internship Completed!',
        description: `Congratulations! Your internship at ${company.name} has been marked as successfully completed.`,
      },
    })

    // Notify Faculty
    if (app.student.mentorAssignments[0]?.faculty) {
      await prisma.notification.create({
        data: {
          userId: app.student.mentorAssignments[0].faculty.userId,
          category: 'System',
          title: 'Student Internship Completed',
          description: `${app.student.user.name} has completed their internship at ${company.name}.`,
        },
      })
    }

    return res.json({ success: true, message: 'Internship marked as completed', application: updated })
  } catch (error) {
    next(error)
  }
})

export default router
