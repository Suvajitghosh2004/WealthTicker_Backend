const errorHandler = (err, req, res, next) => {
  const statusCode = (() => {
    if (err.statusCode) return err.statusCode
    if (err.name === 'ValidationError') return 400
    if (err.name === 'CastError') return 400
    if (err.code === 11000) return 400
    if (err.name === 'JsonWebTokenError') return 401
    if (err.name === 'TokenExpiredError') return 401
    if (err.code === 'LIMIT_FILE_SIZE') return 400
    return 500
  })()

  const message = (() => {
    if (err.name === 'ValidationError')
      return Object.values(err.errors).map(e => e.message).join(', ')
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field'
      return `${field} already exists`
    }
    if (err.name === 'CastError') return `Invalid ${err.path}: ${err.value}`
    if (err.name === 'JsonWebTokenError') return 'Invalid token'
    if (err.name === 'TokenExpiredError') return 'Token expired'
    if (err.code === 'LIMIT_FILE_SIZE') return 'File too large. Maximum 5MB.'
    return err.message || 'Internal Server Error'
  })()

  // Fix: always log something meaningful
  console.error(`[ERROR] ${statusCode} ${req.method} ${req.originalUrl} — ${message}`)
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default errorHandler