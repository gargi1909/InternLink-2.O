import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { prisma } from '../db.js'

export interface AuthUser {
  id: string
  email: string
  role: Role
  name: string
  studentProfileId?: string
  facultyProfileId?: string
  companyProfileId?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'internlink_super_secret_jwt_key_2026_secure'

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined

    // 1. Check Authorization header
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' })
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`,
      })
    }
    next()
  }
}

// CRITICAL HELPER: Verify that a faculty mentor is assigned to a specific student
export async function verifyMentorAccess(facultyProfileId: string, studentProfileId: string): Promise<boolean> {
  const assignment = await prisma.studentMentorAssignment.findFirst({
    where: {
      facultyId: facultyProfileId,
      studentId: studentProfileId,
      status: 'ACTIVE',
    },
  })
  return !!assignment
}
