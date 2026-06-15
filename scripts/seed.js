import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Category from '../models/Category.js'

dotenv.config()

const categories = [
  { name: 'Investing', slug: 'investing', description: 'Stock market, ETFs, index funds, and investment strategies.', color: '#3B82F6' },
  { name: 'Budgeting', slug: 'budgeting', description: 'Personal budgeting tips, savings strategies, and financial planning.', color: '#10B981' },
  { name: 'Crypto', slug: 'crypto', description: 'Bitcoin, Ethereum, DeFi, and cryptocurrency news.', color: '#F59E0B' },
  { name: 'Tax', slug: 'tax', description: 'Tax tips, deductions, and strategies to keep more of your money.', color: '#EF4444' },
  { name: 'Credit Cards', slug: 'credit-cards', description: 'Best credit cards, rewards, cashback, and credit score tips.', color: '#8B5CF6' },
  { name: 'Retirement', slug: 'retirement', description: '401k, IRA, Roth, and retirement planning strategies.', color: '#EC4899' }
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Create admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (!existingAdmin) {
      await User.create({
        name: 'WealthTicker Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      })
      console.log(`✅ Admin user created: ${process.env.ADMIN_EMAIL}`)
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Create categories
    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug })
      if (!existing) {
        await Category.create(cat)
        console.log(`✅ Category created: ${cat.name}`)
      }
    }

    console.log('🎉 Seed complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seed()
