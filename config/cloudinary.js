import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Startup check
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error('❌ Cloudinary env vars missing!')
} else {
  // console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME)
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'wealthticker',
    resource_type:   'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1200, quality: 'auto', fetch_format: 'auto' }]
  })
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

export { cloudinary }