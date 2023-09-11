const express = require("express");
const upload = require("../middleware/multerConfig");

// controller functions
const {
  signupUser,
  verifyEmail,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithToken,
  updateUserProfile,
  promoteToAdmin,
  sendJobNotification,
  employerSignUp,
  getAllUsers,
  getUserProfile,
  deleteUser,
} = require("../controllers/userController");

const verifyToken = require("../middleware/verifyToken");
const onlyEmployerAndAdmin = require("../middleware/onlyEmployersAndAdmin");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// Route for signing up user
router.post("/signup", signupUser);

// Route for email verification
router.get("/verify/:token", verifyEmail);

//Route for logging in user
router.post("/login", loginUser);

// Route for initiating password reset
router.post("/initiate-password-reset", initiatePasswordReset);

// Route for resetting password using reset token
router.post("/reset-password-with-token", resetPasswordWithToken);

// Route for updating user profile
router.post(
  "/update-profile",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUserProfile
);

// Route for promoting user to Admin
router.post("/promote", promoteToAdmin);

// Route for sending job notification
router.post("/sendJobNotifications", sendJobNotification);

// Route for Employer Sign Up
router.post("/employer-signup", employerSignUp);

// Route for getting all Users
router.get("/get-all-users", verifyToken, isAdmin, getAllUsers);

// Route for getting a user profile
router.get("/:id/profile", verifyToken, onlyEmployerAndAdmin, getUserProfile);

// Route for deleting a user from database
router.delete("/:userId", verifyToken, deleteUser);

module.exports = router;
