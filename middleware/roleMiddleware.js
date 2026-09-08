const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User is not authenticated",
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

module.exports = roleMiddleware;