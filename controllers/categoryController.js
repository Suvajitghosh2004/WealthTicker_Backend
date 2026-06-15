import Category from '../models/Category.js'
import { slugify } from '../utils/slugify.js'

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 })
  res.json({ success: true, categories })
}

export const getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json({ success: true, category })
}

export const createCategory = async (req, res) => {
  const { name } = req.body
  const slug = req.body.slug || slugify(name)
  const category = await Category.create({ ...req.body, slug })
  res.status(201).json({ success: true, category })
}

export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json({ success: true, category })
}

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json({ success: true, message: 'Category deleted' })
}
