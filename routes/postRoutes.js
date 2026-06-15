import express from 'express'
import {
  getPosts, getPostBySlug, getFeaturedPosts, getTrendingPosts,
  searchPosts, getPostsByCategory,
  getAdminPosts, getPostById, createPost, updatePost, deletePost, toggleStatus
} from '../controllers/postController.js'
import { protect } from '../middleware/authMiddleware.js'

export const publicPostRouter = express.Router()
export const adminPostRouter = express.Router()

// ── Public routes ──────────────────────────────────────────────
publicPostRouter.get('/featured', getFeaturedPosts)
publicPostRouter.get('/trending', getTrendingPosts)
publicPostRouter.get('/search', searchPosts)
publicPostRouter.get('/category/:slug', getPostsByCategory)
publicPostRouter.get('/', getPosts)
publicPostRouter.get('/:slug', getPostBySlug)

// ── Admin routes ───────────────────────────────────────────────
adminPostRouter.get('/all', protect, getAdminPosts)
adminPostRouter.get('/:id', protect, getPostById)
adminPostRouter.post('/', protect, createPost)
adminPostRouter.put('/:id', protect, updatePost)
adminPostRouter.delete('/:id', protect, deletePost)
adminPostRouter.patch('/:id/status', protect, toggleStatus)