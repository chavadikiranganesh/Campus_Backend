// Authorization middleware for role-based access control

const { User } = require('../models')

// Check if user is authenticated
const authenticate = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.headers['X-User-Id']
  
  if (!userId) {
    return res.status(401).json({ message: 'User authentication required' })
  }

  const user = await User.findOne({ id: Number(userId) })
  if (!user) {
    return res.status(401).json({ message: 'Invalid user' })
  }

  req.user = user
  next()
}

// Check if user can edit/delete an item (owner or admin)
const checkOwnership = (getModelName, userIdField = 'postedByUserId') => {
  return async (req, res, next) => {
    try {
      const Model = require('../models')[getModelName]
      const id = Number(req.params.id)
      const item = await Model.findOne({ id })
      
      if (!item) {
        return res.status(404).json({ message: `${getModelName} not found` })
      }

      const isAdmin = req.user.role === 'admin'
      const isOwner = item[userIdField]?.toString() === req.user._id.toString()

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: 'You can only edit/delete your own items or admin access required' })
      }

      req.item = item
      next()
    } catch (error) {
      console.error(`Ownership check error for ${getModelName}:`, error)
      res.status(500).json({ message: 'Authorization check failed' })
    }
  }
}

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = {
  authenticate,
  checkOwnership,
  requireAdmin
}
