import { Router, Request, Response } from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req: Request, res: Response, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id,
        userId: n.userId,
        category: n.category,
        title: n.title,
        description: n.description,
        timestamp: n.createdAt.toISOString(),
        read: n.read,
      })),
    })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/read', async (req: Request, res: Response, next) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    })

    return res.json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    next(error)
  }
})

router.put('/read-all', async (req: Request, res: Response, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    })

    return res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
})

export default router
