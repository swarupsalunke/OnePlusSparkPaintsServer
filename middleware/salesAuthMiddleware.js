
const jwt = require("jsonwebtoken");

const salesAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId || decoded.role !== "SALES_EXECUTIVE") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Sales Executive account required.",
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
};

module.exports = salesAuthMiddleware;
