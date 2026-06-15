import express from 'express'
import { uploadMedia, getMedia, deleteMedia } from '../controllers/mediaController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

router.post(
  '/upload',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        })
      }
      next()
    })
  },
  uploadMedia
)

router.get('/', protect, getMedia)
router.delete('/:id', protect, deleteMedia)

export default router