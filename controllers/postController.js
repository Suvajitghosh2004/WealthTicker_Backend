import Post from '../models/Post.js'
import { slugify } from '../utils/slugify.js'

const POSTS_PER_PAGE = 12

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || POSTS_PER_PAGE
  const skip = (page - 1) * limit

  const query = { status: 'published' }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('category', 'name slug color')
      .populate('author', 'name avatar')
      .select('-content -affiliateCards')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ])

  res.json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  })
}

export const getPostBySlug = async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('category', 'name slug color')
    .populate('author', 'name avatar bio')

  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json({ success: true, post })
}

export const getFeaturedPosts = async (req, res) => {
  const posts = await Post.find({ status: 'published', isFeatured: true })
    .populate('category', 'name slug color')
    .populate('author', 'name avatar')
    .select('-content -affiliateCards')
    .sort({ createdAt: -1 })
    .limit(5)

  res.json({ success: true, posts })
}

export const getTrendingPosts = async (req, res) => {
  const posts = await Post.find({ status: 'published' })
    .populate('category', 'name slug color')
    .select('-content -affiliateCards')
    .sort({ views: -1 })
    .limit(10)

  res.json({ success: true, posts })
}

export const searchPosts = async (req, res) => {
  const { q, category, page = 1 } = req.query
  if (!q) return res.status(400).json({ message: 'Search query required' })

  const limit = 12
  const skip = (page - 1) * limit

  const query = { status: 'published', $text: { $search: q } }

  if (category) {
    const cat = await (await import('../models/Category.js')).default.findOne({ slug: category })
    if (cat) query.category = cat._id
  }

  const [posts, total] = await Promise.all([
    Post.find(query, { score: { $meta: 'textScore' } })
      .populate('category', 'name slug color')
      .select('-content -affiliateCards')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ])

  res.json({
    success: true,
    posts,
    query: q,
    pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) }
  })
}

export const getPostsByCategory = async (req, res) => {
  const Category = (await import('../models/Category.js')).default
  const category = await Category.findOne({ slug: req.params.slug })
  if (!category) return res.status(404).json({ message: 'Category not found' })

  const page = parseInt(req.query.page) || 1
  const limit = POSTS_PER_PAGE
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    Post.find({ status: 'published', category: category._id })
      .populate('category', 'name slug color')
      .populate('author', 'name avatar')
      .select('-content -affiliateCards')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ status: 'published', category: category._id })
  ])

  res.json({
    success: true,
    category,
    posts,
    pagination: { page, total, pages: Math.ceil(total / limit) }
  })
}

// ── Admin controllers ──────────────────────────────────────────

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('category', 'name slug color')
      .populate('author', 'name avatar bio')
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ success: true, post })
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post ID' })
  }
}

export const getAdminPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 20
  const skip = (page - 1) * limit
  const { status, search } = req.query

  // No status filter = return ALL posts (draft + published + scheduled)
  const query = {}
  if (status) query.status = status
  if (search) query.$text = { $search: search }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('category', 'name slug')
      .populate('author', 'name')
      .select('-content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ])

  res.json({ success: true, posts, pagination: { page, total, pages: Math.ceil(total / limit) } })
}

export const createPost = async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' })
  }

  let slug = req.body.slug || slugify(title)
  const existing = await Post.findOne({ slug })
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await Post.create({ ...req.body, slug, author: req.user._id })
  res.status(201).json({ success: true, post })
}

export const updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json({ success: true, post })
}

export const deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json({ success: true, message: 'Post deleted' })
}

export const toggleStatus = async (req, res) => {
  const { status } = req.body
  const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json({ success: true, post })
}