import mongoose from 'mongoose'

const affiliateCardSchema = new mongoose.Schema({
  productName:  String,
  productImage: String,
  amazonUrl:    String,
  price:        String,
  badge:        String
}, { _id: false })

const postSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  slug:     { type: String, required: true, unique: true, lowercase: true }, // no index:true here
  excerpt:  { type: String, maxlength: 300 },
  content:  { type: String, required: true },
  thumbnail:{ type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags:     [String],
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:   { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  scheduledAt: { type: Date },

  metaTitle:       { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  ogImage:         { type: String },
  focusKeyword:    { type: String },
  canonicalUrl:    { type: String },

  affiliateCards: [affiliateCardSchema],

  views:    { type: Number, default: 0 },
  readTime: { type: Number },

  isFeatured:    { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true }
}, { timestamps: true })

// Single index definition — not duplicated
postSchema.index({ status: 1, createdAt: -1 })
postSchema.index({ category: 1 })
postSchema.index({ '$**': 'text' })

export default mongoose.model('Post', postSchema)