/**
 * Role-based authorization middleware
 * Usage: router.post('/admin/something', protect, authorize('admin'), controller);
 */

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user is authenticated (added by protect middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // 2. Check if user has one of the required roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have the required permissions' 
      });
    }

    next();
  };
};

// If you need specific role aliases, you can export them as wrappers
exports.isAdmin = exports.authorize('admin');