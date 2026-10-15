import { prisma } from '../db.js'

export async function logAudit(params: {
  userId?: string
  action: string
  targetType: string
  targetId?: string
  details?: string
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}
