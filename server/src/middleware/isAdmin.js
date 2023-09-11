const verifyToken = require("./verifyToken");

const isAdmin = (req, res, next) => {

const userRole = req.user.role;

  if (userRole === "admin") {
    // User is an admin, allow them to proceed
    next();
  } else {
    // User is not an admin, deny access
    res.status(403).json({ error: "Access denied. Not an Admin." });
  }
};

module.exports = isAdmin;
