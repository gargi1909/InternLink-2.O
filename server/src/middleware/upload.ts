
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request, Response, NextFunction } from 'express'

// Secure uploads directory: <project>/server/uploads/resumes
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/resumes')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
    cb(null, UPLOAD_DIR)
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50)

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${base}-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase()

  const allowedExts = ['.pdf', '.docx', '.doc']
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream',
  ]

  if (
    allowedExts.includes(ext) &&
    (allowedMimes.includes(file.mimetype) || ext === '.pdf' || ext === '.docx')
  ) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, DOCX, and DOC files are allowed.'))
  }
}

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Handle Multer validation errors as JSON
export function handleResumeUpload(fieldName: string = 'resume') {
  const upload = resumeUpload.single(fieldName)

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Resume file size must not exceed 5MB.',
          })
        }

        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        })
      }

      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid resume file.',
        })
      }

      next()
    })
  }
}
