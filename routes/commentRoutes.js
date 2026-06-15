import express from 'express'
import {
  getCommentsByPost, submitComment,
  getAdminComments, updateCommentStatus, deleteComment
} from '../controllers/commentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:postId', getCommentsByPost)
router.post('/', submitComment)
router.get('/', protect, getAdminComments)
router.patch('/:id', protect, updateCommentStatus)
router.delete('/:id', protect, deleteComment)

export default router
