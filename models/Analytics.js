import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  country: { type: String },
  device: { type: String }
}, { timestamps: true })

export default mongoose.model('Analytics', analyticsSchema)
