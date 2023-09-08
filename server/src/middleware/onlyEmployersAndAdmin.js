const verifyToken = require("./verifyToken");
// Middleware function to check if user is an admin or employer
const onlyEmployersAndAdmin = (req, res, next) => {
  const userRole = req.user.role;
  const allowedRoles = ["admin", "employer"];

  if (allowedRoles.includes(userRole)) {
    // User is an admin or employer, allow them to proceed
    next();
  } else {
    // User is not authorized, deny access
    res.status(403).json({
      error: "Access denied. Only admins and employers are allowed.",
    });
  }
};

module.exports = onlyEmployersAndAdmin;
