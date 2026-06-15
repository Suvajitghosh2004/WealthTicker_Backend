import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  color: { type: String, default: '#F59E0B' }
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)
