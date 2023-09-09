const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // const token = req.headers.authorization;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify and decode the token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.log({ decoded: decoded });
    // Attach the user ID to req.user
    req.user = { id: decoded.userId, role: decoded.role }; // Now you can access req.user._id

    next();
  });
};

module.exports = verifyToken;
