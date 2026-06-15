import './config/env.js' // ← MUST be first line

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
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api', globalRateLimiter)

// Public
app.use('/api/auth', authRoutes)
app.use('/api/posts', publicPostRouter)
app.use('/api/categories', categoryRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/contact', contactRoutes)

// Admin
app.use('/api/admin/posts', adminPostRouter)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/comments', commentRoutes)
app.use('/api/admin/newsletter', newsletterRoutes)
app.use('/api/admin/media', mediaRoutes)
app.use('/api/admin/analytics', analyticsRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))
// ── Temp seed route — REMOVE AFTER USE ────────────────────────
app.get('/api/seed', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default
    const Category = (await import('./models/Category.js')).default

    const categories = [
      { name: 'Investing',    slug: 'investing',    color: '#3B82F6', description: 'Stock market, ETFs, index funds and investment strategies.' },
      { name: 'Budgeting',    slug: 'budgeting',    color: '#10B981', description: 'Personal budgeting tips, savings strategies and financial planning.' },
      { name: 'Crypto',       slug: 'crypto',       color: '#F59E0B', description: 'Bitcoin, Ethereum, DeFi and cryptocurrency news.' },
      { name: 'Tax',          slug: 'tax',          color: '#EF4444', description: 'Tax tips, deductions and strategies to keep more of your money.' },
      { name: 'Credit Cards', slug: 'credit-cards', color: '#8B5CF6', description: 'Best credit cards, rewards, cashback and credit score tips.' },
      { name: 'Retirement',   slug: 'retirement',   color: '#EC4899', description: '401k, IRA, Roth and retirement planning strategies.' }
    ]

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      )
    }

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (!existing) {
      await User.create({
        name: 'WealthTicker Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      })
    }

    res.json({
      success: true,
      message: 'Seeded successfully!',
      admin: process.env.ADMIN_EMAIL,
      categories: categories.map(c => c.name)
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 404 handler — keep this AFTER seed route
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

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