import express from 'express'
import Post from '../models/Post.js'
import Category from '../models/Category.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = process.env.CLIENT_URL || 'https://wealthticker.vercel.app'

    const [posts, categories] = await Promise.all([
      Post.find({ status: 'published' }).select('slug updatedAt').sort({ updatedAt: -1 }),
      Category.find().select('slug updatedAt')
    ])

    const staticPages = [
      { url: '',          priority: '1.0', changefreq: 'daily' },
      { url: '/about',    priority: '0.8', changefreq: 'monthly' },
      { url: '/contact',  priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy',  priority: '0.5', changefreq: 'yearly' }
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${siteUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${categories.map(cat => `  <url>
    <loc>${siteUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${posts.map(post => `  <url>
    <loc>${siteUrl}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.header('Cache-Control', 'public, max-age=3600')
    res.send(xml)
  } catch (err) {
    res.status(500).json({ message: 'Sitemap generation failed' })
  }
})

export default router