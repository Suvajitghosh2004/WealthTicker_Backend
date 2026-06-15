import express from 'express'
import { trackView, getDashboardStats } from '../controllers/analyticsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/view', trackView)
router.get('/', protect, getDashboardStats)

export default router
