const { rolePermissions } = require('../config/permission'); 

exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated.',
      });
    }

    const userRole = req.user.role; 
    const userPermissions = rolePermissions[userRole];
    if (!userPermissions) {
        return res.status(500).json({
          success: false,
          message: 'Server error: Role permissions not defined.',
        });
      }
    if (userPermissions.includes(requiredPermission)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have the required permission.',
      });
    }
  };
};
