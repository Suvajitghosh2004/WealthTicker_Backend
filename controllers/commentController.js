import Comment from '../models/Comment.js'

export const getCommentsByPost = async (req, res) => {
  const comments = await Comment.find({
    post: req.params.postId,
    status: 'approved'
  }).sort({ createdAt: -1 })
  res.json({ success: true, comments })
}

export const submitComment = async (req, res) => {
  const { postId, name, email, body } = req.body
  if (!postId || !name || !email || !body) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  const comment = await Comment.create({ post: postId, name, email, body })
  res.status(201).json({ success: true, message: 'Comment submitted for moderation', comment })
}

// Admin
export const getAdminComments = async (req, res) => {
  const { status, page = 1 } = req.query
  const limit = 20
  const skip = (page - 1) * limit
  const query = status ? { status } : {}

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(query)
  ])

  res.json({ success: true, comments, pagination: { page: parseInt(page), total } })
}

export const updateCommentStatus = async (req, res) => {
  const { status } = req.body
  const comment = await Comment.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!comment) return res.status(404).json({ message: 'Comment not found' })
  res.json({ success: true, comment })
}

export const deleteComment = async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })
  res.json({ success: true, message: 'Comment deleted' })
}
