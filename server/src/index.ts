import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { prisma } from './db.js'

// Import Routers
import authRouter from './routes/auth.routes.js'
import studentRouter from './routes/student.routes.js'
import facultyRouter from './routes/faculty.routes.js'
import companyRouter from './routes/company.routes.js'
import internshipRouter from './routes/internship.routes.js'
import adminRouter from './routes/admin.routes.js'
import notificationRouter from './routes/notification.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Middleware setup
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'internlink-api',
      database: 'connected',
    })
  } catch (err: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err.message,
    })
  }
})

// Mount application API routers
app.use('/api/auth', authRouter)
app.use('/api/student', studentRouter)
app.use('/api/faculty', facultyRouter)
app.use('/api/company', companyRouter)
app.use('/api/internships', internshipRouter)
app.use('/api/admin', adminRouter)
app.use('/api/notifications', notificationRouter)

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` })
})

// Centralized Error Handler
app.use(errorHandler)

// Server startup - only listen directly if not running tests
const isTesting = process.env.NODE_ENV === 'test' || process.argv[1]?.includes('runTests')
if (!isTesting) {
  app.listen(PORT, () => {
    console.log(`🚀 InternLink Full-Stack Server running on http://localhost:${PORT}`)
  })
}

export default app
