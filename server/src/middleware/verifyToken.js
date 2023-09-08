const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify and decode the token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach the user ID to req.user
    req.user = { id: decoded._id, role: decoded.role }; // Now you can access req.user._id

    next();
  });
};

module.exports = verifyToken;