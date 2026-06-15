import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'

// @desc    Admin login
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save()

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  })
}

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    const newAccessToken = generateAccessToken(user._id)
    res.json({ success: true, accessToken: newAccessToken })
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token expired' })
  }
}

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken
  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null })
  }
  res.clearCookie('refreshToken')
  res.json({ success: true, message: 'Logged out' })
}

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}
