import Analytics from '../models/Analytics.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Subscriber from '../models/Subscriber.js'

export const trackView = async (req, res) => {
  const { postId, country, device } = req.body
  if (!postId) return res.status(400).json({ message: 'postId required' })

  await Analytics.create({ post: postId, country, device })
  res.json({ success: true })
}

export const getDashboardStats = async (req, res) => {
  const [
    totalPosts,
    totalViews,
    totalComments,
    pendingComments,
    subscriberCount,
    topPosts,
    recentComments
  ] = await Promise.all([
    Post.countDocuments({ status: 'published' }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Comment.countDocuments({ status: 'approved' }),
    Comment.countDocuments({ status: 'pending' }),
    Subscriber.countDocuments({ isActive: true }),
    Post.find({ status: 'published' })
      .select('title slug views createdAt')
      .sort({ views: -1 })
      .limit(5),
    Comment.find({ status: 'pending' })
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .limit(5)
  ])

  res.json({
    success: true,
    stats: {
      totalPosts,
      totalViews: totalViews[0]?.total || 0,
      totalComments,
      pendingComments,
      subscriberCount
    },
    topPosts,
    recentComments
  })
}
