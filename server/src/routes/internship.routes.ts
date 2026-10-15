import { Router, Request, Response } from 'express'
import { prisma } from '../db.js'

const router = Router()

// Public listing of active internships
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { search, workMode, type, location } = req.query as Record<string, string>

    const internships = await prisma.internship.findMany({
      where: {
        status: { in: ['Open', 'In_Progress'] },
      },
      include: {
        company: true,
        applications: { select: { id: true } },
      },
      orderBy: { postedDate: 'desc' },
    })

    let formatted = internships.map(i => {
      let resp: string[] = []
      let skills: string[] = []
      let benefits: string[] = []
      try { resp = JSON.parse(i.responsibilities) } catch {}
      try { skills = JSON.parse(i.requiredSkills) } catch {}
      try { benefits = JSON.parse(i.benefits) } catch {}

      return {
        id: i.id,
        companyId: i.companyId,
        companyName: i.company.name,
        companyLogoColor: i.company.logoColor,
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
        status: i.status === 'Open' || i.status === 'In_Progress' ? 'Active' : i.status,
        type: i.type,
      }
    })

    if (search) {
      const q = search.toLowerCase()
      formatted = formatted.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.companyName.toLowerCase().includes(q) ||
        i.requiredSkills.some(s => s.toLowerCase().includes(q))
      )
    }
    if (workMode && workMode !== 'All') {
      formatted = formatted.filter(i => i.workMode.toLowerCase() === workMode.toLowerCase())
    }
    if (type && type !== 'All') {
      formatted = formatted.filter(i => i.type.toLowerCase() === type.toLowerCase())
    }

    return res.json({ success: true, count: formatted.length, internships: formatted })
  } catch (error) {
    next(error)
  }
})

// Specific internship details
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const internship = await prisma.internship.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        applications: { select: { id: true } },
      },
    })
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' })

    let resp: string[] = []
    let skills: string[] = []
    let benefits: string[] = []
    try { resp = JSON.parse(internship.responsibilities) } catch {}
    try { skills = JSON.parse(internship.requiredSkills) } catch {}
    try { benefits = JSON.parse(internship.benefits) } catch {}

    const formatted = {
      id: internship.id,
      companyId: internship.companyId,
      companyName: internship.company.name,
      companyLogoColor: internship.company.logoColor,
      title: internship.title,
      description: internship.description,
      responsibilities: resp,
      requiredSkills: skills,
      eligibility: internship.eligibility,
      location: internship.location,
      workMode: internship.workMode === 'On_site' ? 'On-site' : internship.workMode,
      duration: internship.duration,
      startDate: internship.startDate.toISOString().split('T')[0],
      endDate: internship.endDate.toISOString().split('T')[0],
      deadline: internship.deadline.toISOString().split('T')[0],
      stipend: internship.stipend,
      openings: internship.openings,
      benefits,
      postedDate: internship.postedDate.toISOString().split('T')[0],
      applicants: internship.applications.length,
      status: internship.status === 'Open' || internship.status === 'In_Progress' ? 'Active' : internship.status,
      type: internship.type,
      companyDetails: internship.company,
    }

    return res.json({ success: true, internship: formatted })
  } catch (error) {
    next(error)
  }
})

export default router
