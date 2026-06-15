import express from 'express'
import { sendContactEmail } from '../utils/sendEmail.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many contact requests. Try again later.' }
})

// POST /api/contact
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    await sendContactEmail({ name, email, message })
    res.json({ success: true, message: 'Message sent successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
