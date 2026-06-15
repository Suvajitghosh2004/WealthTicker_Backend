import './config/env.js'

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'

import connectDB from './config/db.js'
import { globalRateLimiter } from './middleware/rateLimiter.js'
import errorHandler from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import { publicPostRouter, adminPostRouter } from './routes/postRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import contactRoutes from './routes/contactRoutes.js'

connectDB()

const app = express()

app.use(helmet())
app.use(mongoSanitize())

// CORS — handles trailing slash and multiple origins
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://wealthticker.vercel.app',
      'http://localhost:5173'
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api', globalRateLimiter)

// ── Public routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/posts', publicPostRouter)
app.use('/api/categories', categoryRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/contact', contactRoutes)

// ── Admin routes ───────────────────────────────────────────────
app.use('/api/admin/posts', adminPostRouter)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/comments', commentRoutes)
app.use('/api/admin/newsletter', newsletterRoutes)
app.use('/api/admin/media', mediaRoutes)
app.use('/api/admin/analytics', analyticsRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  if (err.code !== 'ECONNRESET') process.exit(1)
})

export default app