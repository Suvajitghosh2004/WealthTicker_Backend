import express from 'express'
import { login, refreshToken, logout, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/login', authRateLimiter, login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.get('/me', protect, getMe)

export default router
