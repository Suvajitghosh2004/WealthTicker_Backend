import express from 'express'
import { subscribe, getSubscribers, unsubscribe, sendBroadcast } from '../controllers/newsletterController.js'
import { protect } from '../middleware/authMiddleware.js'
import { newsletterRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/subscribe', newsletterRateLimiter, subscribe)
router.get('/', protect, getSubscribers)
router.delete('/:id', protect, unsubscribe)
router.post('/send', protect, sendBroadcast)

export default router
