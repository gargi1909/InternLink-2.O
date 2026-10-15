import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '../db.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimit.js'
import { logAudit } from '../utils/audit.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'COMPANY', 'FACULTY', 'ADMIN']),
  phone: z.string().optional(),
  // Student fields
  college: z.string().optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  // Company fields
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  // Faculty fields
  designation: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', authRateLimiter, async (req: Request, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const role = data.role as Role

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          role,
        },
      })

      let profile: any = null
      if (role === Role.STUDENT) {
        profile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            college: data.college || 'VIT Chennai',
            collegeId: `STU${Date.now().toString().slice(-6)}`,
            course: data.course || 'B.Tech Computer Science',
            department: data.department || 'Computer Science',
            year: data.year || '3rd Year',
            phone: data.phone,
          },
        })
      } else if (role === Role.COMPANY) {
        profile = await tx.companyProfile.create({
          data: {
            userId: user.id,
            name: data.name,
            industry: data.industry || 'Software Development',
            location: data.location || 'Bengaluru, Karnataka',
            website: data.website,
            phone: data.phone,
          },
        })
      } else if (role === Role.FACULTY) {
        profile = await tx.facultyProfile.create({
          data: {
            userId: user.id,
            name: data.name,
            college: data.college || 'VIT Chennai',
            department: data.department || 'Computer Science',
            designation: data.designation || 'Assistant Professor',
            phone: data.phone,
          },
        })
      }

      return { user, profile }
    })

    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.name,
      studentProfileId: result.profile && result.user.role === Role.STUDENT ? result.profile.id : undefined,
      companyProfileId: result.profile && result.user.role === Role.COMPANY ? result.profile.id : undefined,
      facultyProfileId: result.profile && result.user.role === Role.FACULTY ? result.profile.id : undefined,
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    await logAudit({
      userId: result.user.id,
      action: 'USER_REGISTER',
      targetType: 'USER',
      targetId: result.user.id,
      details: `User registered with role ${result.user.role}`,
      ipAddress: req.ip,
    })

    function formatUserProfile(u: any) {
      if (u.studentProfile) {
        let parsedSkills: string[] = []
        try {
          parsedSkills = typeof u.studentProfile.skills === 'string'
            ? JSON.parse(u.studentProfile.skills)
            : (Array.isArray(u.studentProfile.skills) ? u.studentProfile.skills : [])
        } catch {
          parsedSkills = []
        }
        return {
          ...u.studentProfile,
          name: u.name,
          email: u.email,
          skills: parsedSkills,
        }
      }
      if (u.companyProfile) {
        return {
          ...u.companyProfile,
          name: u.companyProfile.name || u.name,
          email: u.email,
        }
      }
      if (u.facultyProfile) {
        return {
          ...u.facultyProfile,
          name: u.facultyProfile.name || u.name,
          email: u.email,
        }
      }
      return null
    }

    const formattedProfile = formatUserProfile({
      ...result.user,
      studentProfile: result.user.role === Role.STUDENT ? result.profile : null,
      companyProfile: result.user.role === Role.COMPANY ? result.profile : null,
      facultyProfile: result.user.role === Role.FACULTY ? result.profile : null,
    }) || result.profile

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role.toLowerCase(),
      },
      profile: formattedProfile,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', authRateLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        companyProfile: true,
        facultyProfile: true,
      },
    })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentProfileId: user.studentProfile?.id,
      companyProfileId: user.companyProfile?.id,
      facultyProfileId: user.facultyProfile?.id,
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    function formatUserProfile(u: any) {
      if (u.studentProfile) {
        let parsedSkills: string[] = []
        try {
          parsedSkills = typeof u.studentProfile.skills === 'string'
            ? JSON.parse(u.studentProfile.skills)
            : (Array.isArray(u.studentProfile.skills) ? u.studentProfile.skills : [])
        } catch {
          parsedSkills = []
        }
        return {
          ...u.studentProfile,
          name: u.name,
          email: u.email,
          skills: parsedSkills,
        }
      }
      if (u.companyProfile) {
        return {
          ...u.companyProfile,
          name: u.companyProfile.name || u.name,
          email: u.email,
        }
      }
      if (u.facultyProfile) {
        return {
          ...u.facultyProfile,
          name: u.facultyProfile.name || u.name,
          email: u.email,
        }
      }
      return null
    }

    const profile = formatUserProfile(user)

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
      },
      profile,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' })

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        companyProfile: true,
        facultyProfile: true,
      },
    })

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    function formatUserProfile(u: any) {
      if (u.studentProfile) {
        let parsedSkills: string[] = []
        try {
          parsedSkills = typeof u.studentProfile.skills === 'string'
            ? JSON.parse(u.studentProfile.skills)
            : (Array.isArray(u.studentProfile.skills) ? u.studentProfile.skills : [])
        } catch {
          parsedSkills = []
        }
        return {
          ...u.studentProfile,
          name: u.name,
          email: u.email,
          skills: parsedSkills,
        }
      }
      if (u.companyProfile) {
        return {
          ...u.companyProfile,
          name: u.companyProfile.name || u.name,
          email: u.email,
        }
      }
      if (u.facultyProfile) {
        return {
          ...u.facultyProfile,
          name: u.facultyProfile.name || u.name,
          email: u.email,
        }
      }
      return null
    }

    const profile = formatUserProfile(user)

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
      },
      profile,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token')
  return res.json({ success: true, message: 'Logged out successfully' })
})

export default router
