import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err)

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error')

  return res.status(statusCode).json({
    success: false,
    message,
  })
}
