import { cloudinary } from '../config/cloudinary.js'

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    console.log('Upload success:', req.file.path)

    res.status(201).json({
      success: true,
      url:       req.file.path,
      public_id: req.file.filename
    })
  } catch (err) {
    console.error('Upload error:', err)
    next(err)
  }
}

export const getMedia = async (req, res, next) => {
  try {
    const result = await cloudinary.api.resources({
      type:          'upload',
      prefix:        'wealthticker',
      max_results:   100,
      resource_type: 'image'
    })
    res.json({ success: true, media: result.resources })
  } catch (err) {
    console.error('Get media error:', err.message)
    // Return empty array instead of crashing
    res.json({ success: true, media: [] })
  }
}

export const deleteMedia = async (req, res, next) => {
  try {
    const { public_id } = req.body
    if (!public_id) {
      return res.status(400).json({ success: false, message: 'public_id required' })
    }
    await cloudinary.uploader.destroy(public_id)
    res.json({ success: true, message: 'Image deleted' })
  } catch (err) {
    next(err)
  }
}