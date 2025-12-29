// Check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

module.exports = { isAuthenticated, isAdmin };
