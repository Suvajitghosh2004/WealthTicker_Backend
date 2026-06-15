import express from 'express'
import {
  getCategories, getCategoryBySlug,
  createCategory, updateCategory, deleteCategory
} from '../controllers/categoryController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getCategories)
router.get('/:slug', getCategoryBySlug)
router.post('/', protect, createCategory)
router.put('/:id', protect, updateCategory)
router.delete('/:id', protect, deleteCategory)

export default router
